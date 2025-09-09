import { Schema } from 'mongoose';

export const JournalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  trimester: { type: String, required: true },
  todos: [{ type: String }],
  completedTodos: [{ type: Boolean }],
  notes: { type: String, required: true },
  imageUrls: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});