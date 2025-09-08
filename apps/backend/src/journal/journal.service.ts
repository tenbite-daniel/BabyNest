import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JournalEntry } from './journal.interface';

@Injectable()
export class JournalService {
  constructor(@InjectModel('Journal') private journalModel: Model<JournalEntry>) {}

  async create(entry: string, mood: string): Promise<JournalEntry> {
    const newEntry = new this.journalModel({ entry, mood, date: new Date() });
    return newEntry.save();
  }

  async findAll(): Promise<JournalEntry[]> {
    return this.journalModel.find().exec();
  }

  async update(id: string, entry: string, mood: string): Promise<JournalEntry | null> {
    return this.journalModel.findByIdAndUpdate(id, { entry, mood, date: new Date() }, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.journalModel.findByIdAndDelete(id).exec();
  }
}