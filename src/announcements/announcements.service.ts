import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Announcement } from './announcement.entity'

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async create(body: any, user: any) {
    const isOwnerOrHR = [2, 3].includes(user.role_id)
    const isLeader = user.role_id === 4

    if (isLeader && body.team_id !== user.team_id) {
      throw new ForbiddenException('You can only post for your team')
    }

    const announcement = this.announcementRepo.create({
      title: body.title,
      content: body.content,
      team_id: body.team_id ?? null,
      created_by: user.id,
      company_id: user.company_id,
    })

    return this.announcementRepo.save(announcement)
  }

 async findAll(user: any): Promise<Announcement[]> {
  const query = this.announcementRepo.createQueryBuilder('announcement');

  if ([2, 3].includes(user.role_id)) {
     return query
      .where('announcement.company_id = :companyId', { companyId: user.company_id })
      .getMany();
  }

  if (user.role_id === 4) {
     return query
      .where('announcement.company_id = :companyId', { companyId: user.company_id })
      .andWhere('(announcement.team_id IS NULL OR announcement.team_id = :teamId)', {
        teamId: user.team_id,
      })
      .getMany();
  }
 
  return query
    .where('announcement.company_id = :companyId', { companyId: user.company_id })
    .andWhere('(announcement.team_id IS NULL OR announcement.team_id = :teamId)', {
      teamId: user.team_id,
    })
    .getMany();
}


  async update(id: number, body: any, user: any) {
    const ann = await this.announcementRepo.findOneBy({ id })
    if (!ann) throw new NotFoundException('Not found')

    if (![2, 3].includes(user.role_id) && ann.created_by !== user.id) {
      throw new ForbiddenException('Unauthorized update')
    }

    return this.announcementRepo.save({ ...ann, ...body })
  }

  async delete(id: number, user: any) {
    const ann = await this.announcementRepo.findOneBy({ id })
    if (!ann) throw new NotFoundException('Not found')

    if (![2, 3].includes(user.role_id) && ann.created_by !== user.id) {
      throw new ForbiddenException('Unauthorized delete')
    }

    return this.announcementRepo.remove(ann)
  }
}
