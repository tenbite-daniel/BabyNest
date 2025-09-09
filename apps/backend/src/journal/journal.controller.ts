import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JournalService } from './journal.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.journalService.findByUser(user._id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @CurrentUser() user: any,
    @Body() body: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const { date, trimester, todos, completedTodos, notes } = body;
    
    let todosArray = [];
    let completedTodosArray = [];
    
    try {
      todosArray = todos ? JSON.parse(todos) : [];
      completedTodosArray = completedTodos ? JSON.parse(completedTodos) : [];
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in todos or completedTodos');
    }
    
    return this.journalService.create(user._id, date, trimester, todosArray, completedTodosArray, notes, images);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid journal entry ID');
    }
    
    const { date, trimester, todos, completedTodos, notes } = body;
    
    let todosArray = [];
    let completedTodosArray = [];
    
    try {
      todosArray = todos ? JSON.parse(todos) : [];
      completedTodosArray = completedTodos ? JSON.parse(completedTodos) : [];
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in todos or completedTodos');
    }
    
    return this.journalService.update(id, user._id, date, trimester, todosArray, completedTodosArray, notes, images);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid journal entry ID');
    }
    
    const deleted = await this.journalService.delete(id, user._id);
    if (!deleted) {
      throw new BadRequestException('Journal entry not found');
    }
    
    return { message: 'Entry deleted successfully' };
  }
}