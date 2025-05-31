import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../auth.service';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'L\'adresse email de l\'utilisateur',
  })
  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    },
  )
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Le prénom de l\'utilisateur',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Le nom de famille de l\'utilisateur',
  })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
} 