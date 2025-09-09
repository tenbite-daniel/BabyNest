import { Document } from 'mongoose';

export interface JournalEntry extends Document {
  userId: string;
  date: string;
  trimester: string;
  todos: string[];
  completedTodos: boolean[];
  notes: string;
  imageUrls: string[];
  createdAt: Date;
}