import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService, // To find user on each request
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  /**
   * This method is called by Passport on every protected request
   * after it successfully validates the JWT signature.
   * The 'payload' is the decrypted JWT payload.
   */
  async validate(payload: { sub: number; email: string }) {
    // 'sub' (subject) is our user ID
    const user = await this.userService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    // We can attach the full user object to the request
    // (excluding the password hash)
    const { password, ...result } = user;
    return result; // This becomes req.user
  }
}
