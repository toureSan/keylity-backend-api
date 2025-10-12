import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      // Décoder le JWT avec la clé secrète
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const decoded = jwt.verify(token, jwtSecret) as any;

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Token invalide');
      }

      // Ajouter l'utilisateur à la requête
      request.user = {
        id: decoded.sub,
        email: decoded.email,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
