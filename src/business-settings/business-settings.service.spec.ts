import { Test, TestingModule } from '@nestjs/testing';
import { BusinessSettingsService } from './business-settings.service';

describe('BusinessSettingsService', () => {
  let service: BusinessSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessSettingsService],
    }).compile();

    service = module.get<BusinessSettingsService>(BusinessSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
