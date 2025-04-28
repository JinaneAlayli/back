import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.jwt,  
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-bestie',
    });
  }

  async validate(payload: any) { 
    return {
      id: payload.id,
      email: payload.email,
      role_id: payload.role_id,
      name: payload.name,
      company_id: payload.company_id,
      team_id: payload.team_id,
    };
  }
}
