import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const connection = app.get<Connection>(getConnectionToken());
  connection.once('open', () => {
    console.log('✅ MongoDB connected!');
  });

  await app.listen(process.env.PORT || 5000);
  console.log(`Backend running on port ${process.env.PORT || 5000}`);
}
bootstrap();
