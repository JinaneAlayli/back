import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitesController } from './employee-invites.controller';

describe('EmployeeInvitesController', () => {
  let controller: EmployeeInvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeInvitesController],
    }).compile();

    controller = module.get<EmployeeInvitesController>(EmployeeInvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
