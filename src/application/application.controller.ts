import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Applications')
@Controller('application')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  constructor(private readonly applicationService: ApplicationService) {}

  @Post('submit')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soumettre une candidature' })
  @ApiResponse({ status: 201, description: 'Candidature soumise avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async submitApplication(
    @Request() req,
    @Body() body: { annonceur_id: string; property_id?: string; message?: string }
  ) {
    const candidateId = req.user.sub;
    this.logger.log(`Application submission by candidate ${candidateId} to annonceur ${body.annonceur_id}`);

    return this.applicationService.submitApplication(
      candidateId,
      body.annonceur_id,
      body.property_id,
      body.message
    );
  }

  @Get('my-applications')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mes candidatures (candidat)' })
  @ApiResponse({ status: 200, description: 'Liste des candidatures' })
  async getMyApplications(@Request() req) {
    const userId = req.user.sub;
    return this.applicationService.getMyApplications(userId);
  }

  @Get('received-applications')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les candidatures reçues (annonceur)' })
  @ApiResponse({ status: 200, description: 'Liste des candidatures reçues' })
  async getReceivedApplications(@Request() req) {
    const annonceurId = req.user.sub;
    return this.applicationService.getReceivedApplications(annonceurId);
  }

  @Post(':applicationId/status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le statut d\'une candidature' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  async updateApplicationStatus(
    @Request() req,
    @Param('applicationId') applicationId: string,
    @Body() body: { status: 'accepted' | 'rejected' }
  ) {
    const annonceurId = req.user.sub;
    return this.applicationService.updateApplicationStatus(
      applicationId,
      annonceurId,
      body.status
    );
  }
}
