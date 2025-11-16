import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard automatically uses the 'jwt' strategy we defined
 * and protects routes. It will throw a 401 Unauthorized
 * response if the JWT is missing or invalid.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
