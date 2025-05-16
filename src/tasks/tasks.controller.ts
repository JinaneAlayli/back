import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.tasksService.create(body, req.user.id);
  }

 @Get()
findAll(@Req() req: any) {
  if (req.user.role_id !== 2) {
    throw new Error('Unauthorized');
  }
  return this.tasksService.findAllForOwner(req.user.company_id);
}


  @Get('my-tasks')
  findMyTasks(@Req() req: any) {
    return this.tasksService.findByUser(req.user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    return this.tasksService.update(id, body, req.user.id, req.user.role_id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.tasksService.delete(id, req.user.id, req.user.role_id);
  }

@Get('team-tasks')
findForTeam(@Req() req: any) {
  if (req.user.role_id !== 4) {
    throw new Error('Unauthorized');
  }
  return this.tasksService.findByTeam(req.user.team_id);
}


}
