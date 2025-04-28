import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepo.create(data);
    return this.permissionRepo.save(permission);
  }

  async isAllowed(roleId: number, feature: string, action: string): Promise<boolean> {
    const permission = await this.permissionRepo.findOne({
      where: {
        role_id: roleId,
        feature_name: feature,
        action: action,
        allowed: true,
      },
    });
    return !!permission;
  }
}
