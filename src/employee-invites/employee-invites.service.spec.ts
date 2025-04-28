import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeInvitesService } from './employee-invites.service';

describe('EmployeeInvitesService', () => {
  let service: EmployeeInvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeInvitesService],
    }).compile();

    service = module.get<EmployeeInvitesService>(EmployeeInvitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
