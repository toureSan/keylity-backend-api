import {
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Body,
  Request,
  UnauthorizedException,
  Logger,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { GetSignedUrlDto } from './dto/get-signed-url.dto';

@Controller('user-profile')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer les informations de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Informations utilisateur récupérées avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMe(@Request() req) {
    this.logger.log(`getMe called with user: ${JSON.stringify(req.user)}`);
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      return this.userProfileService.getUserProfile(req.user.sub, accessToken);
    } catch (error) {
      this.logger.error(`Error in getMe: ${error.message}`);
      throw new UnauthorizedException(
        'Erreur lors de la récupération des informations utilisateur',
      );
    }
  }

  @Post('onboarding')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Compléter l'onboarding utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Onboarding complété avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async completeOnboarding(
    @Request() req, 
    @Body() body: CompleteOnboardingDto
  ) {
    const userId = req.user.sub;
    this.logger.log(`Onboarding request for user ${userId}`);
    this.logger.log(`Request body:`, JSON.stringify(body, null, 2));
    this.logger.log(`Authorization header:`, req.headers.authorization ? 'Present' : 'Missing');

    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      this.logger.log(`Access token extracted:`, accessToken ? 'Present' : 'Missing');
      
      this.logger.log(`Calling getUserProfile for user ${userId}`);
      const userProfile = await this.userProfileService.getUserProfile(userId, accessToken);
      this.logger.log(`User profile retrieved successfully:`, userProfile);

      const role = userProfile.roles.includes('annonceur')
        ? 'annonceur'
        : 'candidat';

      this.logger.log(`User role determined: ${role}`);

      this.logger.log(`Calling completeOnboarding service`);
      const result = await this.userProfileService.completeOnboarding(
        userId,
        role,
        body,
      );
      this.logger.log(`Onboarding completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error in completeOnboarding: ${error.message}`, error.stack);
      this.logger.error(`Request body that caused error:`, JSON.stringify(body, null, 2));
      throw new UnauthorizedException(
        `Erreur lors de l'enregistrement de l'onboarding utilisateur: ${error.message}`,
      );
    }
  }

  @Post('onboarding-with-files')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Compléter l'onboarding utilisateur avec upload de fichiers",
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Onboarding complété avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async completeOnboardingWithFiles(
    @Request() req, 
    @Body() body: any,
    @UploadedFiles() files?: any[]
  ) {
    const userId = req.user.sub;
    this.logger.log(`Onboarding with files request for user ${userId} with ${files?.length || 0} files`);
  
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const userProfile = await this.userProfileService.getUserProfile(userId, accessToken);
  
      const role = userProfile.roles.includes('annonceur')
        ? 'annonceur'
        : 'candidat';

      // Traiter les fichiers uploadés si présents
      if (files && files.length > 0) {
        const uploadedFiles = await this.processUploadedFiles(userId, files);
        // Fusionner les URLs des fichiers avec les données du formulaire
        body = { ...body, ...uploadedFiles };
      }
  
      return await this.userProfileService.completeOnboarding(
        userId,
        role,
        body,
      );
    } catch (error) {
      this.logger.error(`Error in completeOnboardingWithFiles: ${error.message}`, body);
      throw new UnauthorizedException(
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
    if (name.includes('bank') || name.includes('bancaire') || name.includes('relevé') || name.includes('bank-statements')) {
      return 'bank_statements_urls';
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

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mettre à jour les informations personnelles',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    const userId = req.user.sub;
    this.logger.log(`Update profile request for user ${userId}`);

    try {
      return await this.userProfileService.updateProfile(userId, updateData);
    } catch (error) {
      this.logger.error(`Error in updateProfile: ${error.message}`, updateData);
      throw new UnauthorizedException(
        'Erreur lors de la mise à jour du profil utilisateur',
      );
    }
  }

  @Post('signed-url')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Générer une URL signée pour accéder à un document privé',
  })
  @ApiBody({ type: GetSignedUrlDto })
  @ApiResponse({ status: 200, description: 'URL signée générée avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getSignedUrl(@Request() req, @Body() dto: GetSignedUrlDto) {
    const userId = req.user.sub;
    this.logger.log(`Get signed URL request for user ${userId}, path: ${dto.path}`);

    try {
      return await this.userProfileService.getSignedUrl(userId, dto.bucket, dto.path);
    } catch (error) {
      this.logger.error(`Error in getSignedUrl: ${error.message}`, dto);
      throw new BadRequestException(
        'Erreur lors de la génération de l\'URL signée',
      );
    }
  }
}
