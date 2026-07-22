import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const user = await this.usersService.create({
      email: signUpDto.email,
      password: hashedPassword,
      name: signUpDto.name || '',
    });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const userObject = user.toObject();

    return {
      user: userObject,
      ...tokens,
    };
  }

  async signin(signInDto: SignInDto) {
    const user = await this.usersService.findByEmailWithPassword(
      signInDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const userObject = user.toObject();

    return {
      user: userObject,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    if (!refreshToken) {
      await this.usersService.updateRefreshTokenHash(userId, null);
      return;
    }
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }

  private async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
      email,
    };

    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret';
    const accessExpiresIn = (this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) || '15m') as JwtSignOptions['expiresIn'];

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret';
    const refreshExpiresIn = (this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) || '7d') as JwtSignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
