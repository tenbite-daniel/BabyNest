import { Document } from 'mongoose';

export interface JournalEntry extends Document {
  entry: string;
  mood: string;
  date: Date;
}