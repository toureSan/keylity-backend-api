import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({
    status: 201,
    description: "L'utilisateur a été créé avec succès",
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        },
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "L'utilisateur a été connecté avec succès",
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              example: 'john.doe@example.com',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: "Vérification de l'email via un token" })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide' })
  async verifyEmail(@Body() body: { token: string }) {
    if (!body.token) {
      throw new UnauthorizedException('Token de vérification manquant');
    }

    return this.authService.verifyEmail(body.token);
  }
}
