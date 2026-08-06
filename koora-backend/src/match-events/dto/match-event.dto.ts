export type EventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'KICK_OFF'
  | 'FULL_TIME';

export class MatchEventDto {
  eventId!: string;
  matchId!: string;
  type!: EventType;
  team!: 'home' | 'away' | null;
  minute!: number;
  player!: string | null;
  timestamp!: string;
}
