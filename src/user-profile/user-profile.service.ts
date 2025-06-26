import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from 'src/common/services/supabase.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfile(userId: string, accessToken: string) {
    const client = this.supabaseService.getClientWithUser(accessToken);

    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('[DEBUG] Supabase profile error:', profileError);
      throw new UnauthorizedException('Impossible de récupérer le profil');
    }

    const { data: rolesData, error: roleError } = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (roleError || !rolesData) {
      console.error('[DEBUG] Supabase role error:', roleError);
      throw new UnauthorizedException('Impossible de récupérer les rôles');
    }

    const roles = rolesData.map((r) => r.role);

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
    });

    return {
      user: userInfo,
      roles,
      profile: filteredProfile,
    };
  }

  async completeOnboarding(userId: string, role: string, payload: Record<string, any>) {
    const client = this.supabaseService.getClient();

    // Vérifier les champs nécessaires selon le rôle
    const requiredFieldsCandidat = [
      'preferred_property_types', 'min_price', 'max_price', 'preferred_locations',
      'id_document_url', 'employment_certificate_url', 'salary_slips_urls',
      'rental_attestation_url', 'debt_certificate_url', 'residence_permit_url', 'guarantor_documents_urls'
    ];

    const requiredFieldsAnnonceur = [
      'agency_name', 'agency_license', 'agency_address', 'agency_phone',
      'owner_status', 'number_of_properties', 'property_relation'
    ];

    const requiredFieldsCommon = [
      'first_name', 'last_name', 'email', 'phone', 'address', 'zip_code',
      'birth_date', 'nationality', 'professional_status'
    ];

    const allRequiredFields = [
      ...requiredFieldsCommon,
      ...(role === 'candidat' ? requiredFieldsCandidat : []),
      ...(role === 'annonceur' ? requiredFieldsAnnonceur : [])
    ];
    const missingFields = allRequiredFields.filter(field => {
      const value = payload[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new UnauthorizedException(`Champs manquants: ${missingFields.join(', ')}`);
    }

    const { error } = await client
      .from('profiles')
      .update({ ...payload, is_onboarded: true })
      .eq('id', userId);

    if (error) {
      console.error('[ERROR] Onboarding update failed:', error);
      throw new UnauthorizedException('Erreur lors de la mise à jour du profil');
    }

    return { message: 'Onboarding complété avec succès' };
  }
}
