import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt.strategy';

interface RequestWithBody extends Request {
  body: Record<string, unknown>;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          const body = (req as RequestWithBody)?.body;
          if (body && typeof body.refreshToken === 'string') {
            return body.refreshToken;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('authorization');
    let refreshToken = authHeader
      ? authHeader.replace('Bearer', '').trim()
      : null;

    const body = (req as RequestWithBody)?.body;

    if (!refreshToken && body && typeof body.refreshToken === 'string') {
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
