import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { UploadService } from '../upload/upload.service';

@Controller('user-profile')
export class UploadOnboardingController {
  private readonly logger = new Logger(UploadOnboardingController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('onboarding-with-files')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Compléter l'onboarding avec upload de fichiers",
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Onboarding complété avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async completeOnboardingWithFiles(
    @Request() req,
    @UploadedFiles() files: any[],
  ) {
    const userId = req.user.sub;
    this.logger.log(`Onboarding with files request for user ${userId}`);

    try {
      // Récupérer les données du formulaire depuis req.body
      const formData = req.body;
      
      // Traiter les fichiers uploadés
      const uploadedFiles = await this.processUploadedFiles(userId, files);
      
      // Fusionner les données du formulaire avec les URLs des fichiers uploadés
      const onboardingData = {
        ...formData,
        ...uploadedFiles,
      };

      // Récupérer le profil utilisateur pour déterminer le rôle
      const accessToken = req.headers.authorization?.split(' ')[1];
      const userProfile = await this.userProfileService.getUserProfile(userId, accessToken);
      
      const role = userProfile.roles.includes('annonceur') ? 'annonceur' : 'candidat';

      // Compléter l'onboarding avec les données fusionnées
      return await this.userProfileService.completeOnboarding(
        userId,
        role,
        onboardingData,
      );
    } catch (error) {
      this.logger.error(`Error in completeOnboardingWithFiles: ${error.message}`);
      throw new BadRequestException(
        "Erreur lors de l'enregistrement de l'onboarding utilisateur",
      );
    }
  }

  private async processUploadedFiles(userId: string, files: any[]) {
    const uploadedFiles: Record<string, string> = {};

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `${userId}/${fileName}`;

      try {
        let bucket: string;
        
        // Déterminer le bucket selon le type de fichier
        if (file.mimetype === 'application/pdf') {
          bucket = 'documents';
        } else if (file.mimetype.startsWith('image/')) {
          bucket = 'avatars';
        } else {
          throw new BadRequestException(`Type de fichier non supporté: ${file.mimetype}`);
        }

        // Uploader le fichier
        const url = await this.uploadService.uploadFile(bucket, filePath, file.buffer, file.mimetype);
        
        // Mapper le nom du fichier vers le champ correspondant
        const fieldName = this.mapFileNameToField(file.originalname);
        if (fieldName) {
          uploadedFiles[fieldName] = url;
        }

        this.logger.log(`File uploaded for user ${userId}: ${file.originalname} -> ${fieldName}`);
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
        throw new BadRequestException(`Erreur lors de l'upload de ${file.originalname}: ${error.message}`);
      }
    }

    return uploadedFiles;
  }

  private mapFileNameToField(fileName: string): string | null {
    const name = fileName.toLowerCase();
    
    // Mapping des noms de fichiers vers les champs de la base de données
    if (name.includes('avatar') || name.includes('photo-profil')) {
      return 'avatar_url';
    }
    if (name.includes('profile') || name.includes('profil')) {
      return 'profile_photo_url';
    }
    if (name.includes('id') || name.includes('identite') || name.includes('cni')) {
      return 'id_document_url';
    }
    if (name.includes('emploi') || name.includes('travail') || name.includes('work')) {
      return 'employment_certificate_url';
    }
    if (name.includes('salaire') || name.includes('bulletin') || name.includes('salary')) {
      return 'salary_slips_urls';
    }
    if (name.includes('loyer') || name.includes('rental')) {
      return 'rental_attestation_url';
    }
    if (name.includes('dette') || name.includes('debt')) {
      return 'debt_certificate_url';
    }
    if (name.includes('permit') || name.includes('sejour')) {
      return 'residence_permit_url';
    }
    if (name.includes('garant') || name.includes('guarantor')) {
      return 'guarantor_documents_urls';
    }
    
    return null;
  }
}
