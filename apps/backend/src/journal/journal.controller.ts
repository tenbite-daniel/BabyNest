import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { JournalService } from './journal.service';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async findAll() {
    return this.journalService.findAll();
  }

  @Post()
  async create(@Body() body: { entry: string; mood: string }) {
    const { entry, mood } = body;
    return this.journalService.create(entry, mood);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { entry: string; mood: string }) {
    const { entry, mood } = body;
    return this.journalService.update(id, entry, mood);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.journalService.delete(id);
    return { message: 'Entry deleted successfully' };
  }
}