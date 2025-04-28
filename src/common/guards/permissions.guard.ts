import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException, Logger } from "@nestjs/common"
import  { Reflector } from "@nestjs/core"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"
import  { PermissionsService } from "../../permissions/permissions.service"
import  { FastifyRequest } from "fastify"

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name)

  constructor(
    private reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { feature, action } = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!feature || !action) return true

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const user = request.user

    this.logger.debug(`Checking permissions for ${feature}:${action}`)

    if (!user || !user.role_id) {
      this.logger.warn("Permission check failed: Unauthorized user or missing role")
      throw new ForbiddenException("Unauthorized user or missing role.")
    }

    const isAllowed = await this.permissionsService.isAllowed(user.role_id, feature, action)

    if (!isAllowed) {
      this.logger.warn(`Permission denied for user ${user.id}, role ${user.role_id}, action ${feature}:${action}`)
      throw new ForbiddenException("You do not have permission for this action.")
    }

    this.logger.debug(`Permission granted for user ${user.id}, role ${user.role_id}, action ${feature}:${action}`)
    return true
  }
}
