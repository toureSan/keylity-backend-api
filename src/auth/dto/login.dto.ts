import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'L\'adresse email de l\'utilisateur',
  })
  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Le mot de passe de l\'utilisateur',
  })
  @IsString()
  password: string;
} 