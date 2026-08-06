/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchEventDto } from './dto/match-event.dto';

interface MatchState {
  matchId: string;
  homeScore: number;
  awayScore: number;
  events: MatchEventDto[];
  status: 'NOT_STARTED' | 'LIVE' | 'FINISHED';
}

@Injectable()
export class MatchEventsService {
  private readonly logger = new Logger(MatchEventsService.name);
  private matches = new Map<string, MatchState>();

  // This will be injected later from the Gateway
  private broadcastCallback:
    ((matchId: string, event: MatchEventDto) => void) | null = null;

  setBroadcastCallback(
    callback: (matchId: string, event: MatchEventDto) => void,
  ) {
    this.broadcastCallback = callback;
  }

  @OnEvent('match.event')
  handleIncomingEvent(event: MatchEventDto) {
    this.logger.log(`[${event.matchId}] Received: ${event.type}`);

    // Get or create match state
    let match = this.matches.get(event.matchId);

    if (!match) {
      match = {
        matchId: event.matchId,
        homeScore: 0,
        awayScore: 0,
        events: [],
        status: 'LIVE',
      };
      this.matches.set(event.matchId, match);
    }

    // Update score if it's a GOAL
    if (event.type === 'GOAL') {
      if (event.team === 'home') match.homeScore++;
      if (event.team === 'away') match.awayScore++;
    }

    // Update status
    if (event.type === 'KICK_OFF') match.status = 'LIVE';
    if (event.type === 'FULL_TIME') match.status = 'FINISHED';

    // Save the event
    match.events.push(event);

    // Broadcast to clients watching this match
    if (this.broadcastCallback) {
      this.broadcastCallback(event.matchId, event);
    }
  }

  getMatchState(matchId: string): MatchState | null {
    return this.matches.get(matchId) || null;
  }

  getAllMatches(): MatchState[] {
    return Array.from(this.matches.values());
  }
}
