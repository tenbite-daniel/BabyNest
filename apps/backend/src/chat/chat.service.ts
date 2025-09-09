import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.interface';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  private sanitizeString(input: string): string {
    return input.replace(/[<>]/g, '');
  }

  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  async saveMessage(room: string, sender: string, message: string): Promise<Message> {
    const sanitizedRoom = this.sanitizeString(room);
    const sanitizedSender = this.sanitizeString(sender);
    const sanitizedMessage = this.sanitizeString(message);
    
    const newMessage = new this.messageModel({ 
      room: sanitizedRoom, 
      sender: sanitizedSender, 
      message: sanitizedMessage, 
      timestamp: new Date() 
    });
    return newMessage.save();
  }

  async getMessages(room: string): Promise<Message[]> {
    const sanitizedRoom = this.sanitizeString(room);
    return this.messageModel.find({ room: sanitizedRoom }).sort({ timestamp: 1 }).exec();
  }

  async getPreviousChatPartners(userId: string): Promise<string[]> {
    const sanitizedUserId = this.sanitizeString(userId);
    const messages = await this.messageModel.find({ sender: sanitizedUserId }).distinct('room');
    const partners = await Promise.all(messages.map(async (room) => {
      const [sender, receiver] = room.split('_').sort();
      return sender === sanitizedUserId ? receiver : sender;
    }));
    return [...new Set(partners)].filter(partner => partner !== sanitizedUserId);
  }
}