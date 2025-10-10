import { IsString, IsNotEmpty } from 'class-validator';

export class GetSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;
}
