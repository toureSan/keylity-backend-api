import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle propriété' })
  @ApiResponse({ status: 201, description: 'Propriété créée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôle annonceur requis' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
async create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
if (!req.user || !req.user.id) {
  throw new Error('Utilisateur non authentifié');
}

return this.propertiesService.createProperty(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les propriétés disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des propriétés récupérée avec succès' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'transactionType', required: false, type: String, description: 'Type de transaction (location/vente)' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Type de propriété' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Lieu spécifique' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Ville' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Prix minimum' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Prix maximum' })
  @ApiQuery({ name: 'minArea', required: false, type: Number, description: 'Surface minimum' })
  @ApiQuery({ name: 'maxArea', required: false, type: Number, description: 'Surface maximum' })
  @ApiQuery({ name: 'rooms', required: false, type: Number, description: 'Nombre de pièces' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('transactionType') transactionType?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minArea') minArea?: string,
    @Query('maxArea') maxArea?: string,
    @Query('rooms') rooms?: string,
  ) {
    // Convertir les paramètres de pagination
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    // Convertir les paramètres numériques
    const filters = {
      transactionType,
      type,
      location,
      city,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      minArea: minArea ? parseInt(minArea, 10) : undefined,
      maxArea: maxArea ? parseInt(maxArea, 10) : undefined,
      rooms: rooms ? parseInt(rooms, 10) : undefined,
    };

    // Supprimer les filtres undefined
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    return this.propertiesService.findAllProperties(pageNum, limitNum, filters);
  }

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les propriétés de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Liste des propriétés de l\'utilisateur récupérée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  async getMyProperties(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.propertiesService.getUserProperties(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une propriété par son ID' })
  @ApiResponse({ status: 200, description: 'Propriété récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOneProperty(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une propriété' })
  @ApiResponse({ status: 200, description: 'Propriété mise à jour avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous ne pouvez modifier que vos propres propriétés' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Request() req) {
    return this.propertiesService.updateProperty(id, updatePropertyDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une propriété' })
  @ApiResponse({ status: 200, description: 'Propriété supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous ne pouvez supprimer que vos propres propriétés' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.propertiesService.removeProperty(id, req.user.id);
    return { message: 'Propriété supprimée avec succès' };
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader une image pour une propriété' })
  @ApiResponse({ status: 201, description: 'Image uploadée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous ne pouvez uploader des images que pour vos propres propriétés' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req,
  ) {
    const imageUrl = await this.propertiesService.uploadPropertyImage(id, file, req.user.id);
    return { imageUrl, message: 'Image uploadée avec succès' };
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une image d\'une propriété' })
  @ApiResponse({ status: 200, description: 'Image supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Vous ne pouvez supprimer des images que pour vos propres propriétés' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async deleteImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
    @Request() req,
  ) {
    await this.propertiesService.deletePropertyImage(id, imageUrl, req.user.id);
    return { message: 'Image supprimée avec succès' };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter une propriété aux favoris' })
  @ApiResponse({ status: 200, description: 'Propriété ajoutée aux favoris avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async addToFavorites(@Param('id') id: string) {
    await this.propertiesService.incrementFavorites(id);
    return { message: 'Propriété ajoutée aux favoris avec succès' };
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirer une propriété des favoris' })
  @ApiResponse({ status: 200, description: 'Propriété retirée des favoris avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async removeFromFavorites(@Param('id') id: string) {
    await this.propertiesService.decrementFavorites(id);
    return { message: 'Propriété retirée des favoris avec succès' };
  }
}
