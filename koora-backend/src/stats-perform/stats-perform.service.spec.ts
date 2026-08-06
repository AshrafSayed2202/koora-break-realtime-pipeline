import { Test, TestingModule } from '@nestjs/testing';
import { StatsPerformService } from '../match-events/stats-perform.service';

describe('StatsPerformService', () => {
  let service: StatsPerformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsPerformService],
    }).compile();

    service = module.get<StatsPerformService>(StatsPerformService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
