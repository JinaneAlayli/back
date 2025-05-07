import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Team } from "./team.entity"
import { User } from "../users/user.entity"

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find({ relations: ["leader", "company"] })
  }

  async findByCompany(companyId: number): Promise<Team[]> {
    return this.teamRepo.find({
      where: { company_id: companyId },
      relations: ["leader", "company"],
    })
  }

  async create(data: Partial<Team> & { member_ids?: number[] }): Promise<Team> {
    const { member_ids, ...teamData } = data

    if (teamData.leader_id) {
      const leader = await this.userRepo.findOneBy({ id: teamData.leader_id })
      if (!leader) throw new Error("Leader not found")
      teamData.leader = leader
    }

    const team = this.teamRepo.create(teamData)
    const savedTeam = await this.teamRepo.save(team)

    if (member_ids && member_ids.length > 0) {
      await Promise.all(member_ids.map((userId) => this.userRepo.update(userId, { team_id: savedTeam.id })))
    }

    return savedTeam
  }

  async update(id: number, data: Partial<Team> & { member_ids?: number[] }): Promise<Team> {
    const { member_ids, ...teamDataWithoutMembers } = data

    const team = await this.teamRepo.findOneOrFail({
      where: { id },
      relations: ["leader", "company"],
    })

    let hasUpdates = false

    if (teamDataWithoutMembers.name !== undefined) {
      team.name = teamDataWithoutMembers.name
      hasUpdates = true
    }

    if (teamDataWithoutMembers.description !== undefined) {
      team.description = teamDataWithoutMembers.description
      hasUpdates = true
    }

    if (teamDataWithoutMembers.leader_id !== undefined) {
      const leader = await this.userRepo.findOneBy({ id: teamDataWithoutMembers.leader_id })
      if (!leader) {
        throw new Error("Leader not found")
      }
      team.leader = leader
      hasUpdates = true
    }

    if (hasUpdates) {
      await this.teamRepo.save(team)
    }

    // Member_ids must be handled separately!
    if (member_ids) {
      // Use TypeORM's query builder to set team_id to NULL
      await this.userRepo
        .createQueryBuilder()
        .update(User)
        .set({ team_id: () => "NULL" })
        .where("team_id = :teamId", { teamId: id })
        .execute()

      if (member_ids.length > 0) {
        await Promise.all(member_ids.map((userId) => this.userRepo.update(userId, { team_id: id })))
      }
    }

    return this.teamRepo.findOneOrFail({
      where: { id },
      relations: ["leader", "company"],
    })
  }

  async delete(id: number): Promise<void> {
    // Before deleting the team, remove team_id from users
    // Use TypeORM's query builder to set team_id to NULL
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ team_id: () => "NULL" })
      .where("team_id = :teamId", { teamId: id })
      .execute()

    // Now safely delete the team
    await this.teamRepo.delete(id)
  }
}
