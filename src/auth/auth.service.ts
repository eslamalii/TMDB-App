import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from '../user/dtos/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userService.findByEmail(normalizedEmail);

    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    const { password, ...result } = user;
    return result;
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    const existing = await this.userService.findByEmail(normalizedEmail);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.userService.create({
      ...createUserDto,
      email: normalizedEmail,
    });

    const { password, ...result } = user;

    return result;
  }

  async login(user: Partial<User>) {
    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
