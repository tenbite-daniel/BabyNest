import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.interface';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  async saveMessage(room: string, sender: string, message: string): Promise<Message> {
    const newMessage = new this.messageModel({ room, sender, message, timestamp: new Date() });
    return newMessage.save();
  }

  async getMessages(room: string): Promise<Message[]> {
    return this.messageModel.find({ room }).sort({ timestamp: 1 }).exec();
  }
}