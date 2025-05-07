import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(data: Partial<Task>, creatorId: number): Promise<Task> {
    const task = this.taskRepo.create({ ...data, created_by: creatorId });
    return this.taskRepo.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  async findByUser(userId: number): Promise<Task[]> {
    return this.taskRepo.find({ where: { user_id: userId } });
  }

  async update(id: number, updateTaskDto: Partial<Task>, userId: number, userRoleId: number) {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');
  
    if (userRoleId === 4 && task.created_by !== userId) {
      throw new ForbiddenException('You can only update tasks you created.');
    }
  
    if (userRoleId === 5) {
      if (task.user_id !== userId) {
        throw new ForbiddenException('You can only update your assigned tasks.');
      }
     
      if (updateTaskDto.note !== undefined) {
        task.note = updateTaskDto.note;
      }
    
      if (updateTaskDto.completed !== undefined) {
        task.completed = updateTaskDto.completed;
      }
    
      return this.taskRepo.save(task);
    }
    
  
    Object.assign(task, updateTaskDto);
    return this.taskRepo.save(task);
  }
  

  async delete(id: number, userId: number, userRoleId: number): Promise<void> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');

    if (userRoleId === 4 && task.created_by !== userId) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.taskRepo.remove(task);
  }
}
