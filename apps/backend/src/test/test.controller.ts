import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('test')
export class TestController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('db')
  async testDB() {
    const collections = await this.connection.db!.listCollections().toArray();
    return { collections };
  }
}
