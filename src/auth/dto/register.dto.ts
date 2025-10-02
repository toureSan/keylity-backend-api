import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: "L'adresse email de l'utilisateur",
  })
  @IsEmail({}, { message: "L'adresse email n'est pas valide" })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    },
  )
  password: string;

  @ApiProperty({ 
    enum: UserRole, 
    default: UserRole.CANDIDAT,
    description: "Le rôle de l'utilisateur (par défaut: CANDIDAT)",
    required: false
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
