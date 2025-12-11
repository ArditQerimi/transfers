import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    console.log('Registering user with email:', email);
    console.log('Password provided:', password);

    const exists = await this.authRepo.findByEmail(email);
    if (exists) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.authRepo.createUser({
      email,
      password: hash,
      balance: 100.0,
    });

    return { message: 'Registered successfully', userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
    };
  }
}
