import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpStatus,
  HttpCode,
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { PermissionsGuard } from "../common/guards/permissions.guard"
import { Permissions } from "../common/decorators/permissions.decorator"
import { UploadService } from "../common/upload/upload.service"
import type { FastifyRequest } from "fastify"
import type { MultipartFile } from "@fastify/multipart"
import { ForbiddenException } from '@nestjs/common'


@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users', 'view')
  getAllUsers(@Req() req: FastifyRequest) {
    this.logger.log('Getting all users');
    // Since we have the type declaration, TypeScript knows req.user exists
    // But we should still check for null/undefined at runtime
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('users', 'view')
  async getUserById(@Param('id') id: string) {
    this.logger.log(`Getting user by ID: ${id}`);
    const user = await this.usersService.findById(Number(id));
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

  @Post('register') 
  registerUser(@Body() body: any) {
    this.logger.log('Registering new user');
    return this.usersService.create(body);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateOwnProfile(@Req() req: FastifyRequest, @Body() body: any) {
    if (!req.user || !req.user.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    this.logger.log(`User ${req.user.id} updating own profile`);
    return this.usersService.update(req.user.id, body);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("users", "update")
  async updateUser(@Param('id') id: string, @Body() body: any, @Req() req: FastifyRequest) {
    const user = await this.usersService.findById(Number(id))
  
    if (!user) {
      throw new NotFoundException("User not found")
    }
  
    // ✅ Only allow update if the user is from same company
    if (req.user?.company_id !== user.company_id) {
      throw new ForbiddenException("You can only update users from your own company")
    }
  
    return this.usersService.update(Number(id), body)
  }
  

  @Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('users', 'delete')
async deleteUser(@Param('id') id: string, @Req() req: FastifyRequest) {
  const user = await this.usersService.findById(Number(id))

  if (!user) throw new NotFoundException('User not found')

  if (user.company_id !== req.user?.company_id) {
    throw new ForbiddenException('Not your company user')
  }

  return this.usersService.delete(Number(id))
}


  @Post('upload-profile')
  @UseGuards(JwtAuthGuard)
  async uploadProfile(@Req() req: FastifyRequest) {
    try {
      this.logger.log('Starting profile image upload');
      
      // Check if user exists in the request
      if (!req.user || !req.user.id) {
        throw new BadRequestException('User not authenticated or missing ID');
      }
      
      const userId = req.user.id;
      this.logger.log(`Processing upload for user: ${userId}`);
      
      // Process the multipart request
      const parts = req.parts();
      
      let file: MultipartFile | null = null;
      
      // Iterate through parts to find the file
      for await (const part of parts) {
        if (part.type === 'file') {
          file = part;
          break; // Only process the first file
        }
      }
      
      if (!file) {
        this.logger.warn('No file received in the request');
        throw new BadRequestException('No file uploaded');
      }
      
      this.logger.log(`File received: ${file.filename}, mimetype: ${file.mimetype}`);
      
      // Upload the file to storage
      const imageUrl = await this.uploadService.uploadProfileImage(file, userId);
      
      // Update the user's profile with the new image URL
      const result = await this.usersService.updateProfileImage(userId, imageUrl);
      
      // If there was a previous image, delete it to save storage
      if (result.oldImageUrl && result.oldImageUrl !== imageUrl) {
        try {
          await this.uploadService.deleteProfileImage(result.oldImageUrl);
          this.logger.log(`Old profile image deleted: ${result.oldImageUrl}`);
        } catch (error) {
          // Don't fail the request if old image deletion fails
          this.logger.warn(`Failed to delete old image: ${error.message}`);
        }
      }
      
      this.logger.log(`Profile image updated successfully: ${imageUrl}`);
      
      return {
        message: 'Profile image updated successfully',
        imageUrl,
      };
    } catch (error) {
      this.logger.error(`Profile upload failed: ${error.message}`, error.stack);
      
      // Re-throw the error with appropriate status code
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to upload profile image: ${error.message}`);
    }
  }
  @Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Req() req: FastifyRequest) {
  if (!req.user) {
    throw new BadRequestException('User not authenticated');
  }

  const user = await this.usersService.findById(req.user.id)

  if (!user) {
    throw new NotFoundException("User not found")
  }
 
  const { password, ...safeUser } = user
  return safeUser
}


}
