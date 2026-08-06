/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MatchEventsService } from './match-events.service';
import { MatchEventDto } from './dto/match-event.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MatchEventsGateway.name);

  constructor(private readonly matchEventsService: MatchEventsService) {
    // Connect the service to this gateway so it can broadcast
    this.matchEventsService.setBroadcastCallback((matchId, event) => {
      this.broadcastToMatch(matchId, event);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Client sends: { matchId: "match_001" }
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ): any {
    const { matchId } = data;

    if (!matchId) {
      return { error: 'matchId is required' };
    }

    // Join the room for this match
    client.join(matchId);
    this.logger.log(`Client ${client.id} subscribed to ${matchId}`);

    // Late joiner support: send current match state immediately
    const currentState = this.matchEventsService.getMatchState(matchId);

    return {
      message: `Subscribed to ${matchId}`,
      currentState: currentState || null,
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    client.leave(data.matchId);
    this.logger.log(`Client ${client.id} unsubscribed from ${data.matchId}`);
    return { message: `Unsubscribed from ${data.matchId}` };
  }

  // Called by MatchEventsService when a new event arrives
  private broadcastToMatch(matchId: string, event: MatchEventDto) {
    this.server.to(matchId).emit('matchEvent', event);
    this.logger.debug(`Broadcasted ${event.type} to room ${matchId}`);
  }
}
