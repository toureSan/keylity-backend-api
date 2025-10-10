import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('document')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Uploader un document (PDF)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Document uploadé avec succès',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://supabase.co/storage/v1/object/public/documents/user-id/document.pdf' },
        path: { type: 'string', example: 'user-id/document.pdf' },
      },
    },
  })
  async uploadDocument(@Request() req, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Seuls les fichiers PDF sont acceptés');
    }

    const userId = req.user.sub;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${userId}/${fileName}`;

    try {
      const url = await this.uploadService.uploadFile('documents', filePath, file.buffer, file.mimetype);
      
      this.logger.log(`Document uploaded for user ${userId}: ${filePath}`);
      
      return {
        url,
        path: filePath,
        fileName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Document upload failed for user ${userId}: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Uploader une photo de profil',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Avatar uploadé avec succès',
  })
  async uploadAvatar(@Request() req, @UploadedFile() file: any) {
    this.logger.log(`Avatar upload request received`);
    this.logger.log(`File received:`, file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');

    if (!file) {
      this.logger.error('No file provided for avatar upload');
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!file.mimetype.startsWith('image/')) {
      this.logger.error(`Invalid file type for avatar: ${file.mimetype}`);
      throw new BadRequestException('Seules les images sont acceptées');
    }

    const userId = req.user.sub;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${userId}/${fileName}`;

    this.logger.log(`Uploading avatar for user ${userId} to path: ${filePath}`);

    try {
      const url = await this.uploadService.uploadFile('avatars', filePath, file.buffer, file.mimetype);
      
      this.logger.log(`Avatar uploaded successfully for user ${userId}: ${filePath}`);
      this.logger.log(`Avatar URL: ${url}`);
      
      return {
        url,
        path: filePath,
        fileName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Avatar upload failed for user ${userId}: ${error.message}`);
      this.logger.error(`Error stack:`, error.stack);
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }
}
