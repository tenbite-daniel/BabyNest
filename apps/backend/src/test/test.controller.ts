import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CollectionInfo } from 'mongodb';

@Controller('test')
export class TestController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('db')
  async testDB(): Promise<{ collections: CollectionInfo[] }> {
    const collections = await this.connection.db!.listCollections().toArray();
    return { collections };
  }
}
