import { Test, TestingModule } from '@nestjs/testing';
import { MatchEventsGateway } from './match-events.gateway';

describe('MatchEventsGateway', () => {
  let gateway: MatchEventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchEventsGateway],
    }).compile();

    gateway = module.get<MatchEventsGateway>(MatchEventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
