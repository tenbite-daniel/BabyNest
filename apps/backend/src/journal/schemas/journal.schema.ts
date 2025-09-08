import { Schema } from 'mongoose';

export const JournalSchema = new Schema({
  entry: { type: String, required: true },
  mood: { type: String, required: true },
  date: { type: Date, default: Date.now },
});