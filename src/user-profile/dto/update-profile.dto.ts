import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsNumber, IsDateString, IsArray, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Prénom', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'Nom de famille', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Numéro de téléphone', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Adresse', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Code postal', required: false })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiProperty({ description: 'Ville', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Code postal', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ description: 'Date de naissance', required: false })
  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @ApiProperty({ description: 'Nationalité', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ description: 'Statut marital', required: false })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiProperty({ description: 'Nombre d\'enfants', required: false })
  @IsOptional()
  @IsNumber()
  number_of_children?: number;

  @ApiProperty({ description: 'Adresse actuelle', required: false })
  @IsOptional()
  @IsString()
  current_address?: string;

  @ApiProperty({ description: 'Depuis quand à cette adresse', required: false })
  @IsOptional()
  @IsString()
  address_since?: string;

  @ApiProperty({ description: 'Raison du déménagement', required: false })
  @IsOptional()
  @IsString()
  moving_reason?: string;

  @ApiProperty({ description: 'Statut professionnel', required: false })
  @IsOptional()
  @IsString()
  professional_status?: string;

  @ApiProperty({ description: 'Employeur', required: false })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiProperty({ description: 'Poste', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'Taux de travail', required: false })
  @IsOptional()
  @IsString()
  work_rate?: string;

  @ApiProperty({ description: 'Type de contrat', required: false })
  @IsOptional()
  @IsString()
  contract_type?: string;

  @ApiProperty({ description: 'Date de début de contrat', required: false })
  @IsOptional()
  @IsDateString()
  contract_start_date?: string;

  @ApiProperty({ description: 'Revenu mensuel', required: false })
  @IsOptional()
  @IsNumber()
  monthly_income?: number;

  @ApiProperty({ description: 'Revenu du partenaire', required: false })
  @IsOptional()
  @IsNumber()
  partner_income?: number;

  @ApiProperty({ description: 'Autres revenus', required: false })
  @IsOptional()
  @IsNumber()
  other_income?: number;

  @ApiProperty({ description: 'Biographie', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'URL de l\'avatar', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ description: 'URL de la photo de profil', required: false })
  @IsOptional()
  @IsString()
  profile_photo_url?: string;

  @ApiProperty({ description: 'Langue préférée', required: false })
  @IsOptional()
  @IsString()
  preferred_language?: string;

  @ApiProperty({ description: 'Méthodes de contact', required: false })
  @IsOptional()
  @IsArray()
  contact_methods?: string[];

  @ApiProperty({ description: 'Adresse de correspondance', required: false })
  @IsOptional()
  @IsString()
  correspondence_address?: string;

  // Champs spécifiques aux candidats
  @ApiProperty({ description: 'Types de propriétés préférées', required: false })
  @IsOptional()
  @IsArray()
  preferred_property_types?: string[];

  @ApiProperty({ description: 'Prix minimum', required: false })
  @IsOptional()
  @IsNumber()
  min_price?: number;

  @ApiProperty({ description: 'Prix maximum', required: false })
  @IsOptional()
  @IsNumber()
  max_price?: number;

  @ApiProperty({ description: 'Localisations préférées', required: false })
  @IsOptional()
  @IsArray()
  preferred_locations?: string[];

  // Champs spécifiques aux annonceurs
  @ApiProperty({ description: 'Nom de l\'agence', required: false })
  @IsOptional()
  @IsString()
  agency_name?: string;

  @ApiProperty({ description: 'Licence de l\'agence', required: false })
  @IsOptional()
  @IsString()
  agency_license?: string;

  @ApiProperty({ description: 'Adresse de l\'agence', required: false })
  @IsOptional()
  @IsString()
  agency_address?: string;

  @ApiProperty({ description: 'Téléphone de l\'agence', required: false })
  @IsOptional()
  @IsString()
  agency_phone?: string;

  @ApiProperty({ description: 'Statut de propriétaire', required: false })
  @IsOptional()
  @IsString()
  owner_status?: string;

  @ApiProperty({ description: 'Nombre de propriétés', required: false })
  @IsOptional()
  @IsNumber()
  number_of_properties?: number;

  @ApiProperty({ description: 'Relation avec la propriété', required: false })
  @IsOptional()
  @IsString()
  property_relation?: string;
}