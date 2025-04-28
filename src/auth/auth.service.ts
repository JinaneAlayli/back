  import { Injectable, UnauthorizedException } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { UsersService } from '../users/users.service';

  @Injectable()
  export class AuthService {
    constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
    ) {}

    async login(email: string, password: string) {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new Error('EMAIL_NOT_FOUND');
    
      const isMatch = await this.usersService.comparePasswords(
        password,
        user.password
      );
      if (!isMatch) throw new Error('INVALID_PASSWORD');
    
      const token = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
          name:user.name,
          company_id: user.company_id,
          team_id:user.team_id,
        },
        {
          secret: process.env.JWT_SECRET || 'ss',
          expiresIn: '1d',
        }
      );
      return { token, user };
    }
    
  }
