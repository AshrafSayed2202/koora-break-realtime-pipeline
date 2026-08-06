import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MatchEventsModule } from './match-events/match-events.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MatchEventsModule,
  ],
})
export class AppModule {}