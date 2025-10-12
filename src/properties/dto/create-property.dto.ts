import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, IsDateString, Min, Max, IsUUID } from 'class-validator';

export enum PropertyType {
  APARTMENT = 'appartement',
  HOUSE = 'maison',
  STUDIO = 'studio',
  DUPLEX = 'duplex',
  LOFT = 'loft',
  PENTHOUSE = 'penthouse',
}

export enum TransactionType {
  RENT = 'location',
  SALE = 'vente',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  SOLD = 'sold',
  UNAVAILABLE = 'unavailable',
}

export enum Orientation {
  NORTH = 'nord',
  SOUTH = 'sud',
  EAST = 'est',
  WEST = 'ouest',
  NORTHEAST = 'nord-est',
  NORTHWEST = 'nord-ouest',
  SOUTHEAST = 'sud-est',
  SOUTHWEST = 'sud-ouest',
}

export enum PropertyCondition {
  EXCELLENT = 'excellent',
  GOOD = 'bon',
  AVERAGE = 'moyen',
  POOR = 'mauvais',
  RENOVATION = 'à rénover',
}

export enum LeaseDuration {
  MONTHLY = 'mensuel',
  QUARTERLY = 'trimestriel',
  YEARLY = 'annuel',
  LONG_TERM = 'long terme',
}

export class CreatePropertyDto {
  @ApiProperty({ description: 'Titre de la propriété' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description de la propriété' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type de propriété' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Type de transaction' })
  @IsString()
  transactionType: string;

  @ApiProperty({ description: 'Adresse de la propriété' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Code postal' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Ville' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Lieu spécifique (Versoix, Coppet, etc.)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Prix de la propriété' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Surface totale en m²' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @ApiPropertyOptional({ description: 'Nombre de pièces' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rooms?: number;

  @ApiPropertyOptional({ description: 'Nombre de chambres' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Nombre de salles de bain' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Étage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({ description: 'Nombre total d\'étages' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalFloors?: number;

  @ApiPropertyOptional({ description: 'Année de construction' })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  constructionYear?: number;

  @ApiPropertyOptional({ description: 'Surface habitable en m²' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  livingArea?: number;

  @ApiPropertyOptional({ description: 'Orientation' })
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiPropertyOptional({ description: 'État de la propriété' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: 'Charges mensuelles' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyCharges?: number;

  @ApiPropertyOptional({ description: 'Caution' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @ApiPropertyOptional({ description: 'Frais d\'agence' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  agencyFees?: number;

  @ApiPropertyOptional({ description: 'Frais de dossier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  applicationFees?: number;

  @ApiPropertyOptional({ description: 'Disponible à partir de' })
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional({ description: 'Durée du bail' })
  @IsOptional()
  @IsString()
  leaseDuration?: string;

  @ApiPropertyOptional({ description: 'Animaux autorisés' })
  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Fumeurs autorisés' })
  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Meublé' })
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @ApiPropertyOptional({ description: 'Adapté aux étudiants' })
  @IsOptional()
  @IsBoolean()
  studentFriendly?: boolean;

  @ApiPropertyOptional({ description: 'Méthodes de contact', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactMethods?: string[];

  @ApiPropertyOptional({ description: 'Disponibilité pour visites' })
  @IsOptional()
  @IsString()
  visitAvailability?: string;

  @ApiPropertyOptional({ description: 'Informations supplémentaires' })
  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @ApiPropertyOptional({ description: 'Équipements', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipments?: string[];

  @ApiPropertyOptional({ description: 'URLs des photos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
