import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from "@nestjs/common"
import  { TasksService } from "./tasks.service"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Update the create method to handle role-based permissions
  @Post()
  create(@Req() req: any, @Body() body: any) {
    // Role ID 2 = Owner, 3 = HR - Can assign tasks to any team
    // Role ID 4 = Leader - Can only assign tasks to team members
    if (req.user.role_id === 2 || req.user.role_id === 3) {
      return this.tasksService.create(body, req.user.id)
    } else if (req.user.role_id === 4) {
      // Check if the assigned user is in the leader's team
      if (body.user_id) {
        // You would need to inject the UsersService to check if the user is in the team
        // For now, we'll assume the frontend handles this validation
        return this.tasksService.create(body, req.user.id)
      }
      throw new ForbiddenException("You can only assign tasks to your team members")
    }

    throw new ForbiddenException("You do not have permission to create tasks")
  }

  // Update the findAll method to handle role-based permissions
  @Get()
 findAll(@Req() req: any) {
   // Role ID 2 = Owner, 3 = HR - Can view all tasks
   if (req.user.role_id === 2 || req.user.role_id === 3) {
     return this.tasksService.findAllForOwner(req.user.company_id);
   }
   
   throw new ForbiddenException('You do not have permission to view all tasks');
 }

  @Get('my-tasks')
  findMyTasks(@Req() req: any) {
    return this.tasksService.findByUser(req.user.id);
  }

  @Patch(":id")
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    return this.tasksService.update(id, body, req.user.id, req.user.role_id)
  }

  @Delete(":id")
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tasksService.delete(id, req.user.id, req.user.role_id)
  }

  // Add a method for team leaders to view team tasks
  @Get('team-tasks')
  findForTeam(@Req() req: any) {
    // Role ID 4 = Leader - Can view team tasks
    if (req.user.role_id === 4) {
      return this.tasksService.findByTeam(req.user.team_id);
    }
    
    throw new ForbiddenException('You do not have permission to view team tasks');
  }
}
