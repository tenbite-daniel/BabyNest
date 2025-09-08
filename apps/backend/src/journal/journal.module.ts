import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { CloudinaryService } from './cloudinary.service';
import { JournalSchema } from './schemas/journal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Journal', schema: JournalSchema }]),
  ],
  controllers: [JournalController],
  providers: [JournalService, CloudinaryService],
})
export class JournalModule {}