import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('previous-partners')
  async getPreviousChatPartners(@Query('userId') userId: string) {
    return this.chatService.getPreviousChatPartners(userId);
  }
}
