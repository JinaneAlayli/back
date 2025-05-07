import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common"
import   { EmployeeInvitesService } from "./employee-invites.service"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { PermissionsGuard } from "../common/guards/permissions.guard"
import { Permissions } from "../common/decorators/permissions.decorator"
import type { FastifyRequest } from "fastify"
import type { EmployeeInvite } from "./employee-invite.entity"

@Controller("employee-invites")
export class EmployeeInvitesController {
  constructor(private readonly service: EmployeeInvitesService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("invites", "create")
  @Post()
  async inviteEmployee(
    @Req() req: FastifyRequest,
    @Body() body: Partial<EmployeeInvite> & { name: string },
  ): Promise<{ invite: EmployeeInvite; link: string }> {
    const user = req.user as any
    return this.service.create({ ...body, company_id: user.company_id })
  }

  @Get(':token')
  async getInviteByToken(@Param('token') token: string): Promise<EmployeeInvite | null> {
    return this.service.findByToken(token);
  }

  @Get()
  async getAll(): Promise<EmployeeInvite[]> {
    return this.service.findAll()
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteInvite(@Param('id') id: string, @Req() req: FastifyRequest): Promise<{ success: boolean }> {
    const user = req.user as any

    // Check if user has permission to delete invites (owner_id 1, 2, or 3)
    if (![1, 2, 3].includes(user.id)) {
      throw new ForbiddenException("You do not have permission to delete invitations")
    }

    const invite = await this.service.findById(Number(id))

    if (!invite) {
      throw new NotFoundException("Invitation not found")
    }

    // Check if the invitation belongs to the same company as the user
    if (invite.company_id !== user.company_id) {
      throw new ForbiddenException("You can only delete invitations from your own company")
    }

    await this.service.delete(Number(id))

    return { success: true }
  }
}
