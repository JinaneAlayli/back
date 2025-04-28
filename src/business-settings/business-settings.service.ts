import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSetting } from './business-setting.entity';

@Injectable()
export class BusinessSettingsService {
  constructor(
    @InjectRepository(BusinessSetting)
    private readonly repo: Repository<BusinessSetting>,
  ) {}

  findAll(): Promise<BusinessSetting[]> {
    return this.repo.find();
  }

  findByCompany(company_id: number): Promise<BusinessSetting | null> {
    return this.repo.findOne({ where: { company_id } });
  }

  findById(id: number): Promise<BusinessSetting | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<BusinessSetting>): Promise<BusinessSetting> {
    const setting = this.repo.create(data);
    return this.repo.save(setting);
  }

  async update(id: number, data: Partial<BusinessSetting>): Promise<BusinessSetting> {
     
  
    const cleanedData: Partial<BusinessSetting> = {
      ...data,
      overtime_rate: data.overtime_rate ? Number(data.overtime_rate) : undefined,
      annual_leave_days: data.annual_leave_days ? Number(data.annual_leave_days) : undefined,
      sick_leave_days: data.sick_leave_days ? Number(data.sick_leave_days) : undefined,
    };
   
  
    return this.repo.save({ id, ...cleanedData });
  }
  
}
