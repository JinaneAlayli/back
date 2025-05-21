import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Task } from "./task.entity"

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(data: Partial<Task>, creatorId: number): Promise<Task> {
    const task = this.taskRepo.create({ ...data, created_by: creatorId })
    return this.taskRepo.save(task)
  }

  // Update the findAllForOwner method to handle both Owner and HR roles
  async findAllForOwner(companyId: number): Promise<Task[]> {
    return this.taskRepo
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .where("user.company_id = :companyId", { companyId })
      .getMany()
  }

  async findByTeam(teamId: number): Promise<Task[]> {
    return this.taskRepo
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .where("user.team_id = :teamId", { teamId })
      .getMany()
  }

  async findByUser(userId: number): Promise<Task[]> {
    return this.taskRepo.find({ where: { user_id: userId } })
  }

  // Update the update method to properly handle role permissions
  async update(id: number, updateTaskDto: Partial<Task>, userId: number, userRoleId: number) {
    const task = await this.taskRepo.findOneBy({ id })
    if (!task) throw new NotFoundException("Task not found")

    // Role ID 2 = Owner, 3 = HR - Can update any task
    if (userRoleId === 2 || userRoleId === 3) {
      Object.assign(task, updateTaskDto)
      return this.taskRepo.save(task)
    }

    // Role ID 4 = Leader - Can only update team tasks
    if (userRoleId === 4) {
      // Get the user's team_id
      const user = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoinAndSelect("task.user", "user")
        .where("task.id = :id", { id })
        .getOne()

      if (!user || user.user.team_id !== task.user.team_id) {
        throw new ForbiddenException("You can only update tasks for your team members")
      }

      Object.assign(task, updateTaskDto)
      return this.taskRepo.save(task)
    }

    // Role ID 5 = Employee - Can only complete their own tasks
    if (userRoleId === 5) {
      if (task.user_id !== userId) {
        throw new ForbiddenException("You can only update your assigned tasks")
      }

      // Employees can only update the completed status and add notes
      if (updateTaskDto.note !== undefined) {
        task.note = updateTaskDto.note
      }

      if (updateTaskDto.completed !== undefined) {
        task.completed = updateTaskDto.completed
      }

      return this.taskRepo.save(task)
    }

    throw new ForbiddenException("You do not have permission to update this task")
  }

  // Update the delete method to properly handle role permissions
  async delete(id: number, userId: number, userRoleId: number): Promise<void> {
    const task = await this.taskRepo.findOneBy({ id })
    if (!task) throw new NotFoundException("Task not found")

    // Only Owner (2) and HR (3) can delete any task
    if (userRoleId === 2 || userRoleId === 3) {
      await this.taskRepo.remove(task)
      return
    }

    // Leader (4) can only delete team tasks
    if (userRoleId === 4) {
      const user = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoinAndSelect("task.user", "user")
        .where("task.id = :id", { id })
        .getOne()

      if (!user || user.user.team_id !== task.user.team_id) {
        throw new ForbiddenException("You can only delete tasks for your team members")
      }

      await this.taskRepo.remove(task)
      return
    }

    throw new ForbiddenException("You do not have permission to delete this task")
  }
}
