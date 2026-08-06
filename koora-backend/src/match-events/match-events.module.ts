import { Module } from '@nestjs/common';
import { MatchEventsGateway } from './match-events.gateway';
import { MatchEventsService } from './match-events.service';
import { StatsPerformService } from './stats-perform.service';

@Module({
  providers: [
    MatchEventsGateway,
    MatchEventsService,
    StatsPerformService,
  ],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}