import { Test, TestingModule } from '@nestjs/testing';
import { BusinessSettingsController } from './business-settings.controller';

describe('BusinessSettingsController', () => {
  let controller: BusinessSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessSettingsController],
    }).compile();

    controller = module.get<BusinessSettingsController>(BusinessSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
