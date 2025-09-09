import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL
      : [process.env.FRONTEND_URL, 'http://localhost:3001'],
    credentials: true,
  });

  const connection = app.get<Connection>(getConnectionToken());
  
  // Drop problematic phoneNumber index in development only
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(async () => {
      try {
        if (connection.db) {
          await connection.db.collection('users').dropIndex('phoneNumber_1');
          console.log('✅ Dropped phoneNumber_1 index');
        }
      } catch (error) {
        console.log('ℹ️ phoneNumber_1 index not found or already dropped');
      }
    }, 1000);
  }
  
  connection.once('open', () => {
    console.log('✅ MongoDB connected!');
  });

  await app.listen(process.env.PORT || 5000);
  console.log(`Backend running on port ${process.env.PORT || 5000}`);
}
bootstrap().catch(console.error);
