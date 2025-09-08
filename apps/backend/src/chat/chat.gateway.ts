import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:3001' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log('User connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('User disconnected:', socket.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() { room }: { room: string }, @ConnectedSocket() socket: Socket) {
    socket.join(room);
    const messages = await this.chatService.getMessages(room);
    socket.emit('previousMessages', messages);
  }

  @SubscribeMessage('chatMessage')
  async handleMessage(@MessageBody() { room, sender, message }: { room: string; sender: string; message: string }) {
    const savedMessage = await this.chatService.saveMessage(room, sender, message);
    this.server.to(room).emit('message', savedMessage);
  }
}