import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from 'src/common/services/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfile(userId: string, accessToken: string) {
    const client = this.supabaseService.getAdminClient();

    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      throw new UnauthorizedException('Impossible de récupérer le profil');
    }

    // Essayer de récupérer les rôles depuis user_roles, sinon utiliser user_type
    let roles: string[] = [];
    const { data: rolesData, error: roleError } = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (roleError || !rolesData) {
      // Utiliser le user_type du profil comme rôle par défaut
      roles = profileData.user_type ? [profileData.user_type] : ['candidat'];
    } else {
      roles = rolesData.map((r) => r.role);
    }

    const userInfo = {
      id: userId,
      email: profileData.email,
      is_email_verified: true,
      created_at: profileData.created_at || null,
    };

    const filteredProfile: Record<string, any> = {};

    if (roles.includes('candidat')) {
      Object.assign(filteredProfile, {
        preferred_property_types: profileData.preferred_property_types,
        min_price: profileData.min_price,
        max_price: profileData.max_price,
        preferred_locations: profileData.preferred_locations,
        id_document_url: profileData.id_document_url,
        employment_certificate_url: profileData.employment_certificate_url,
        salary_slips_urls: profileData.salary_slips_urls,
        bank_statements_urls: profileData.bank_statements_urls,
        rental_attestation_url: profileData.rental_attestation_url,
        debt_certificate_url: profileData.debt_certificate_url,
        residence_permit_url: profileData.residence_permit_url,
        guarantor_documents_urls: profileData.guarantor_documents_urls,
      });
    }

    if (roles.includes('annonceur')) {
      Object.assign(filteredProfile, {
        agency_name: profileData.agency_name,
        agency_license: profileData.agency_license,
        agency_address: profileData.agency_address,
        agency_phone: profileData.agency_phone,
        owner_status: profileData.owner_status,
        number_of_properties: profileData.number_of_properties,
        property_relation: profileData.property_relation,
      });
    }

    Object.assign(filteredProfile, {
      phone_number: profileData.phone_number,
      address: profileData.address,
      city: profileData.city,
      postal_code: profileData.postal_code,
      bio: profileData.bio,
      avatar_url: profileData.avatar_url,
      profile_photo_url: profileData.profile_photo_url,
      preferred_language: profileData.preferred_language,
      contact_methods: profileData.contact_methods,
      correspondence_address: profileData.correspondence_address,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      birth_date: profileData.birth_date,
      nationality: profileData.nationality,
      marital_status: profileData.marital_status,
      number_of_children: profileData.number_of_children,
      phone: profileData.phone,
      email: profileData.email,
      current_address: profileData.current_address,
      zip_code: profileData.zip_code,
      address_since: profileData.address_since,
      moving_reason: profileData.moving_reason,
      professional_status: profileData.professional_status,
      employer: profileData.employer,
      position: profileData.position,
      work_rate: profileData.work_rate,
      contract_type: profileData.contract_type,
      contract_start_date: profileData.contract_start_date,
      monthly_income: profileData.monthly_income,
      partner_income: profileData.partner_income,
      other_income: profileData.other_income,
      is_onboarded: profileData.is_onboarded,
      candidate_onboarding_completed: (profileData as any).candidate_onboarding_completed,
      annonceur_onboarding_completed: (profileData as any).annonceur_onboarding_completed,
    });

    return {
      user: userInfo,
      roles,
      profile: filteredProfile,
    };
  }

  async completeOnboarding(userId: string, role: string, payload: CompleteOnboardingDto) {
    
    const client = this.supabaseService.getAdminClient();

    // Vérifier les champs nécessaires selon le rôle (seulement les champs vraiment obligatoires)
    const requiredFieldsCandidat = [
      'first_name', 'last_name', 'email', 'phone'
    ];

    const requiredFieldsAnnonceur = [
      'first_name', 'last_name', 'email', 'phone', 'preferred_language'
    ];

    const allRequiredFields = role === 'candidat' ? requiredFieldsCandidat : requiredFieldsAnnonceur;
    
    const missingFields = allRequiredFields.filter(field => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new UnauthorizedException(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
    }

    // Préparer les données pour la mise à jour (exclure l'email et userType pour éviter les conflits)
    const { email, userType, ...payloadWithoutEmailAndUserType } = payload;
    const updateData = {
      ...payloadWithoutEmailAndUserType,
      is_onboarded: true,
      updated_at: new Date().toISOString()
    };

    // Mettre à jour le champ spécifique selon le rôle
    if (role === 'candidat') {
      (updateData as any).candidate_onboarding_completed = true;
    } else if (role === 'annonceur') {
      (updateData as any).annonceur_onboarding_completed = true;
    }

    // Gérer les champs spécifiques selon le rôle
    if (role === 'candidat') {
      // S'assurer que les champs candidat sont bien formatés
      if (payload.preferred_property_types && Array.isArray(payload.preferred_property_types)) {
        updateData.preferred_property_types = payload.preferred_property_types;
      }
      if (payload.preferred_locations && Array.isArray(payload.preferred_locations)) {
        updateData.preferred_locations = payload.preferred_locations;
      }
      if (payload.salary_slips_urls && Array.isArray(payload.salary_slips_urls)) {
        updateData.salary_slips_urls = payload.salary_slips_urls;
      }
      if (payload.guarantor_documents_urls && Array.isArray(payload.guarantor_documents_urls)) {
        updateData.guarantor_documents_urls = payload.guarantor_documents_urls;
      }
    } else if (role === 'annonceur') {
      // S'assurer que les champs annonceur sont bien formatés
      updateData.advertiser_type = payload.advertiser_type || null;
      updateData.agency_name = payload.agency_name || null;
      updateData.agency_license = payload.agency_license || null;
      updateData.agency_address = payload.agency_address || null;
      updateData.agency_phone = payload.agency_phone || null;
      updateData.owner_status = payload.owner_status || null;
      updateData.number_of_properties = payload.number_of_properties || null;
      updateData.property_relation = payload.property_relation || null;
    }
    
    const { error } = await client
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new UnauthorizedException(`Erreur lors de la mise à jour du profil: ${error.message}`);
    }

    // Mettre à jour la table user_roles pour assigner le bon rôle
    // On ajoute le nouveau rôle sans supprimer les autres (support multi-rôles)
    const { error: roleError } = await client
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,role'
      });

    if (roleError) {
      console.warn(`Erreur lors de la mise à jour du rôle: ${roleError.message}`);
      // Ne pas faire échouer l'onboarding pour une erreur de rôle
    } else {
      console.log(`Rôle '${role}' assigné avec succès à l'utilisateur ${userId}`);
    }

    return { message: 'Onboarding complété avec succès' };
  }

  // Fonction utilitaire pour gérer les rôles d'un utilisateur
  async manageUserRoles(userId: string, action: 'add' | 'remove' | 'get', role?: string) {
    const client = this.supabaseService.getAdminClient();

    switch (action) {
      case 'add':
        if (!role) throw new Error('Rôle requis pour l\'ajout');
        const { error: addError } = await client
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: role,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,role'
          });
        if (addError) throw new Error(`Erreur lors de l'ajout du rôle: ${addError.message}`);
        return { message: `Rôle '${role}' ajouté avec succès` };

      case 'remove':
        if (!role) throw new Error('Rôle requis pour la suppression');
        const { error: removeError } = await client
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (removeError) throw new Error(`Erreur lors de la suppression du rôle: ${removeError.message}`);
        return { message: `Rôle '${role}' supprimé avec succès` };

      case 'get':
        const { data: roles, error: getError } = await client
          .from('user_roles')
          .select('role, created_at')
          .eq('user_id', userId);
        if (getError) throw new Error(`Erreur lors de la récupération des rôles: ${getError.message}`);
        return { roles: roles || [] };

      default:
        throw new Error('Action non supportée');
    }
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const client = this.supabaseService.getAdminClient();

    // Filtrer les champs undefined et null
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
    );

    if (Object.keys(filteredData).length === 0) {
      throw new UnauthorizedException('Aucune donnée à mettre à jour');
    }

    const { data, error } = await client
      .from('profiles')
      .update(filteredData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new UnauthorizedException('Erreur lors de la mise à jour du profil');
    }

    return {
      message: 'Profil mis à jour avec succès',
      profile: data
    };
  }

  async getSignedUrl(userId: string, bucket: string, path: string) {
    // Vérifier que l'utilisateur a accès à ce document
    if (bucket === 'documents') {
      const client = this.supabaseService.getAdminClient();
      
      // Vérifier que le document appartient à l'utilisateur
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      // Vérifier que le path correspond à un document de l'utilisateur
      const documentFields = [
        'id_document_url',
        'employment_certificate_url',
        'salary_slips_urls',
        'bank_statements_urls',
        'rental_attestation_url',
        'debt_certificate_url',
        'residence_permit_url',
        'guarantor_documents_urls'
      ];

      const hasAccess = documentFields.some(field => {
        const value = profileData[field];
        if (Array.isArray(value)) {
          return value.includes(path);
        }
        return value === path;
      });

      if (!hasAccess) {
        throw new UnauthorizedException('Accès non autorisé à ce document');
      }
    }

    // Générer l'URL signée
    const signedUrl = await this.supabaseService.getSignedUrl(bucket, path, 3600); // 1 heure

    return {
      signedUrl,
      expiresIn: 3600
    };
  }
}
