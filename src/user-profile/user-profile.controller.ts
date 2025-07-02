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
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Controller('user-profile')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(private readonly userProfileService: UserProfileService) {}

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
  @ApiBody({ type: CompleteOnboardingDto })
  @ApiResponse({ status: 200, description: 'Onboarding complété avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async completeOnboarding(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    this.logger.log(`Onboarding request for user ${userId}`);
  
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];
      const userProfile = await this.userProfileService.getUserProfile(userId, accessToken);
  
      const role = userProfile.roles.includes('annonceur')
        ? 'annonceur'
        : 'candidat';
  
      return await this.userProfileService.completeOnboarding(
        userId,
        role,
        body,
      );
    } catch (error) {
      this.logger.error(`Error in completeOnboarding: ${error.message}`, body);
      throw new UnauthorizedException(
        "Erreur lors de l'enregistrement de l'onboarding utilisateur",
      );
    }
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
}
