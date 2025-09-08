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
      date,
      trimester,
      todos,
      completedTodos,
      notes,
      imageUrls,
    });
    return newEntry.save();
  }

  async findAll(): Promise<JournalEntry[]> {
    return this.journalModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(
    id: string,
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

    return this.journalModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.journalModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}