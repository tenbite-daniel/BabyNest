import { Document } from 'mongoose';

export interface Message extends Document {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
}