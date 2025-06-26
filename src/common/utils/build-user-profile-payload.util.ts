import { UserRole } from '../enums/user-role.enum';

export function buildUserProfilePayload(
  userId: string,
  role: UserRole,
): Record<string, any> {
  const baseProfile = {
    id: userId,
    first_name: null,
    last_name: null,
    birth_date: null,
    nationality: null,
    marital_status: null,
    number_of_children: null,
    phone: null,
    email: null,
    current_address: null,
    zip_code: null,
    address_since: null,
    moving_reason: null,
    professional_status: null,
    employer: null,
    position: null,
    work_rate: null,
    contract_type: null,
    contract_start_date: null,
    monthly_income: null,
    partner_income: null,
    other_income: null,

    // Champs communs
    phone_number: null,
    address: null,
    city: null,
    postal_code: null,
    bio: null,
    avatar_url: null,

    // Champs généraux
    created_at: new Date(),
    updated_at: new Date(),

    user_type: role,
    profile_photo_url: null,
    preferred_language: null,
    contact_methods: null,
    correspondence_address: null,
  };

  if (role === UserRole.ANNONCEUR) {
    return {
      ...baseProfile,
      agency_name: null,
      agency_license: null,
      agency_address: null,
      agency_phone: null,
      owner_status: null,
      number_of_properties: null,
      property_relation: null,
    };
  }

  if (role === UserRole.CANDIDAT) {
    return {
      ...baseProfile,
      preferred_property_types: [],
      min_price: null,
      max_price: null,
      preferred_locations: [],
      // Documents spécifiques au candidat
      id_document_url: null,
      employment_certificate_url: null,
      salary_slips_urls: [],
      rental_attestation_url: null,
      debt_certificate_url: null,
      residence_permit_url: null,
      guarantor_documents_urls: [],
    };
  }

  return baseProfile;
}
