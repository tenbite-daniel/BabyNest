import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JournalEntry } from './journal.interface';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class JournalService {
  constructor(
    @InjectModel('Journal') private journalModel: Model<JournalEntry>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    userId: string,
    date: string,
    trimester: string,
    todos: string[],
    completedTodos: boolean[],
    notes: string,
    images?: Express.Multer.File[],
  ): Promise<JournalEntry> {
    let imageUrls: string[] = [];
    
    if (images && images.length > 0) {
      try {
        const uploadResults = await Promise.allSettled(
          images.map(image => this.cloudinaryService.uploadImage(image))
        );
        imageUrls = uploadResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<string>).value);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    const newEntry = new this.journalModel({
      userId,
      date,
      trimester,
      todos,
      completedTodos,
      notes,
      imageUrls,
    });
    return newEntry.save();
  }

  async findByUser(userId: string): Promise<JournalEntry[]> {
    return this.journalModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(
    id: string,
    userId: string,
    date: string,
    trimester: string,
    todos: string[],
    completedTodos: boolean[],
    notes: string,
    images?: Express.Multer.File[],
  ): Promise<JournalEntry | null> {
    let imageUrls: string[] = [];
    
    if (images && images.length > 0) {
      try {
        const uploadResults = await Promise.allSettled(
          images.map(image => this.cloudinaryService.uploadImage(image))
        );
        imageUrls = uploadResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<string>).value);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }

    const updateData: any = { date, trimester, todos, completedTodos, notes };
    if (imageUrls.length > 0) {
      updateData.imageUrls = imageUrls;
    }

    return this.journalModel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.journalModel.findOneAndDelete({ _id: id, userId }).exec();
    return !!result;
  }
}