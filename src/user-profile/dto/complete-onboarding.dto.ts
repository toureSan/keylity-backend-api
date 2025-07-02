import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsDateString, IsArray, IsOptional, IsUrl, ValidateIf } from 'class-validator';

export class CompleteOnboardingDto {
 
  @ApiProperty({ description: 'Prénom', example: 'Jean' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Nom de famille', example: 'Dupont' })
  @IsString()
  last_name: string;

  @ApiProperty({ description: 'Rôle utilisateur', example: 'candidat' })
@IsString()
role: 'candidat' | 'annonceur';

  @ApiProperty({ description: 'Email', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Numéro de téléphone', example: '+41789054467' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Adresse', example: '123 Rue de la Paix' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Code postal', example: '75001' })
  @IsString()
  zip_code: string;

  @ApiProperty({ description: 'Date de naissance', example: '1990-01-01' })
  @IsDateString()
  birth_date: string;

  @ApiProperty({ description: 'Nationalité', example: 'Française' })
  @IsString()
  nationality: string;

  @ApiProperty({ description: 'Statut professionnel', example: 'Salarié' })
  @IsString()
  professional_status: string;

  @ApiProperty({ description: 'Biographie', example: 'Je suis un candidat sérieux...' })
  @IsString()
  bio: string;

  @ApiProperty({ description: 'URL de l\'avatar', example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  avatar_url: string;

  @ApiProperty({ description: 'URL de la photo de profil', example: 'https://example.com/profile.jpg' })
  @IsUrl()
  profile_photo_url: string;

  @ApiProperty({ description: 'Langue préférée', example: 'fr' })
  @IsString()
  preferred_language: string;

  // Champs spécifiques aux candidats
  @ApiProperty({ 
    description: 'Types de propriétés préférées', 
    example: ['appartement', 'maison'],
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsArray()
  @IsString({ each: true })
  preferred_property_types?: string[];

  @ApiProperty({ 
    description: 'Prix minimum', 
    example: 500000,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  min_price?: number;

  @ApiProperty({ 
    description: 'Prix maximum', 
    example: 800000,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  max_price?: number;

  @ApiProperty({ 
    description: 'Localisations préférées', 
    example: ['Paris', 'Lyon'],
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsArray()
  @IsString({ each: true })
  preferred_locations?: string[];

  @ApiProperty({ 
    description: 'URL du document d\'identité', 
    example: 'https://example.com/id-document.pdf',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsUrl()
  id_document_url?: string;

  @ApiProperty({ 
    description: 'URL du certificat d\'emploi', 
    example: 'https://example.com/employment-cert.pdf',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsUrl()
  employment_certificate_url?: string;

  @ApiProperty({ 
    description: 'URLs des bulletins de salaire', 
    example: ['https://example.com/salary1.pdf', 'https://example.com/salary2.pdf'],
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsArray()
  @IsUrl({}, { each: true })
  salary_slips_urls?: string[];

  @ApiProperty({ 
    description: 'URL de l\'attestation de location', 
    example: 'https://example.com/rental-attestation.pdf',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsUrl()
  rental_attestation_url?: string;

  @ApiProperty({ 
    description: 'URL du certificat de dette', 
    example: 'https://example.com/debt-cert.pdf',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsUrl()
  debt_certificate_url?: string;

  @ApiProperty({ 
    description: 'URL du titre de séjour', 
    example: 'https://example.com/residence-permit.pdf',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsUrl()
  residence_permit_url?: string;

  @ApiProperty({ 
    description: 'URLs des documents du garant', 
    example: ['https://example.com/guarantor1.pdf', 'https://example.com/guarantor2.pdf'],
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsArray()
  @IsUrl({}, { each: true })
  guarantor_documents_urls?: string[];

  @ApiProperty({ 
    description: 'Numéro de téléphone', 
    example: '+33123456789',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  phone_number?: string;

  @ApiProperty({ 
    description: 'Ville', 
    example: 'Paris',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  city?: string;

  @ApiProperty({ 
    description: 'Code postal', 
    example: '75001',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  postal_code?: string;

  @ApiProperty({ 
    description: 'Statut marital', 
    example: 'Célibataire',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  marital_status?: string;

  @ApiProperty({ 
    description: 'Nombre d\'enfants', 
    example: 2,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  number_of_children?: number;

  @ApiProperty({ 
    description: 'Adresse actuelle', 
    example: '456 Avenue des Champs',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  current_address?: string;

  @ApiProperty({ 
    description: 'Depuis quand à cette adresse', 
    example: '2020-01-01',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsDateString()
  address_since?: string;

  @ApiProperty({ 
    description: 'Raison du déménagement', 
    example: 'Changement de travail',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  moving_reason?: string;

  @ApiProperty({ 
    description: 'Employeur', 
    example: 'Entreprise ABC',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  employer?: string;

  @ApiProperty({ 
    description: 'Poste', 
    example: 'Développeur',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  position?: string;

  @ApiProperty({ 
    description: 'Taux de travail', 
    example: 'Temps plein',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  work_rate?: string;

  @ApiProperty({ 
    description: 'Type de contrat', 
    example: 'CDI',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsString()
  contract_type?: string;

  @ApiProperty({ 
    description: 'Date de début de contrat', 
    example: '2020-01-01',
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsDateString()
  contract_start_date?: string;

  @ApiProperty({ 
    description: 'Revenu mensuel', 
    example: 5000,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  monthly_income?: number;

  @ApiProperty({ 
    description: 'Revenu du partenaire', 
    example: 3000,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  partner_income?: number;

  @ApiProperty({ 
    description: 'Autres revenus', 
    example: 500,
    required: false 
  })
  @ValidateIf((o) => o.role === 'candidat')
  @IsNumber()
  other_income?: number;

  // Champs spécifiques aux annonceurs
  @ApiProperty({ 
    description: 'Nom de l\'agence', 
    example: 'Agence Immobilière ABC',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  agency_name?: string;

  @ApiProperty({ 
    description: 'Licence de l\'agence', 
    example: 'LIC123456',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  agency_license?: string;

  @ApiProperty({ 
    description: 'Adresse de l\'agence', 
    example: '789 Boulevard de l\'Immobilier',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  agency_address?: string;

  @ApiProperty({ 
    description: 'Téléphone de l\'agence', 
    example: '+33123456789',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  agency_phone?: string;

  @ApiProperty({ 
    description: 'Statut de propriétaire', 
    example: 'Propriétaire',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  owner_status?: string;

  @ApiProperty({ 
    description: 'Nombre de propriétés', 
    example: 10,
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsNumber()
  number_of_properties?: number;

  @ApiProperty({ 
    description: 'Relation avec la propriété', 
    example: 'Propriétaire',
    required: false 
  })
  @ValidateIf((o) => o.role === 'annonceur')
  @IsString()
  property_relation?: string;
}