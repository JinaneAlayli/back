import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const { token, user } = await this.authService.login(body.email, body.password);

    res.setCookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });

    return {
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        name:user.name,
        team_id:user.team_id,
        company_id: user.company_id,
      },
    };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('jwt', { path: '/' });
    return { message: 'Logged out successfully!' };
  }
 
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: FastifyRequest) {
    const user = req.user as any;
    return {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      name:user.name,
    };
  }
}
