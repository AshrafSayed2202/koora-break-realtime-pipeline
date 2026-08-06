import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { MatchEventDto } from './dto/match-event.dto';

@Injectable()
export class StatsPerformService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(StatsPerformService.name);
    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor(private readonly eventEmitter: EventEmitter2) { }

    onModuleInit() {
        this.connect();
    }

    onModuleDestroy() {
        this.disconnect();
    }

    private connect() {
        this.logger.log('Connecting to Mock StatsPerform...');

        this.ws = new WebSocket('ws://localhost:4001');

        this.ws.on('open', () => {
            this.logger.log('Connected to Mock StatsPerform');
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            try {
                const event: MatchEventDto = JSON.parse(data.toString());
                // Emit the event so other services can listen to it
                this.eventEmitter.emit('match.event', event);
            } catch (err) {
                this.logger.warn('Received malformed event from StatsPerform');
            }
        });

        this.ws.on('close', () => {
            this.logger.warn('Disconnected from Mock StatsPerform. Reconnecting in 3s...');
            this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
            this.logger.error(`StatsPerform connection error: ${err.message}`);
        });
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, 3000);
    }

    private disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}