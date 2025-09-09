import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IsString, IsNotEmpty } from 'class-validator';
import { ChatService } from './chat.service';

class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  room: string;
}

class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  room: string;
  
  @IsString()
  @IsNotEmpty()
  sender: string;
  
  @IsString()
  @IsNotEmpty()
  message: string;
}

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id.replace(/[\r\n]/g, ''));
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected:', socket.id.replace(/[\r\n]/g, ''));
  }

  @SubscribeMessage('joinRoom')
  @UsePipes(ValidationPipe)
  async handleJoinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() socket: Socket) {
    try {
      socket.join(data.room);
      const messages = await this.chatService.getMessages(data.room);
      socket.emit('previousMessages', messages);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('chatMessage')
  @UsePipes(ValidationPipe)
  async handleMessage(@MessageBody() data: ChatMessageDto) {
    try {
      const savedMessage = await this.chatService.saveMessage(data.room, data.sender, data.message);
      this.server.to(data.room).emit('message', savedMessage);
    } catch (error) {
      console.error('Chat message error:', error.message);
    }
  }
}