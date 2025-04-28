 import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../users/user.entity'
@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find({ relations: ['leader', 'company'] });
  }

  async findByCompany(companyId: number): Promise<Team[]> {
    return this.teamRepo.find({
      where: { company_id: companyId },
      relations: ['leader', 'company'],
    });
  }

  async create(data: Partial<Team> & { member_ids?: number[] }): Promise<Team> {
    const { member_ids, ...teamData } = data;
   
    if (teamData.leader_id) {
      const leader = await this.userRepo.findOneBy({ id: teamData.leader_id });
      if (!leader) throw new Error('Leader not found');
      teamData.leader = leader;
    }
  
    const team = this.teamRepo.create(teamData);
    const savedTeam = await this.teamRepo.save(team);
  
    if (member_ids && member_ids.length > 0) {
      await Promise.all(
        member_ids.map((userId) =>
          this.userRepo.update(userId, { team_id: savedTeam.id })
        )
      );
    }
  
    return savedTeam;
  }
  
 

  async update(id: number, data: Partial<Team>): Promise<Team> {
    await this.teamRepo.update(id, data);
    return this.teamRepo.findOneOrFail({ where: { id }, relations: ['leader', 'company'] });
  }

  async delete(id: number): Promise<void> {
    await this.teamRepo.delete(id);
  }
}
