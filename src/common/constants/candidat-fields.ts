// src/common/constants/candidat-fields.ts

export const requiredFieldsCandidat: string[] = [
    'preferred_property_types',
    'min_price',
    'max_price',
    'preferred_locations',
    'id_document_url',
    'employment_certificate_url',
    'salary_slips_urls',
    'rental_attestation_url',
    'debt_certificate_url',
    'residence_permit_url',
    'guarantor_documents_urls',
    'phone_number',
    'address',
    'city',
    'postal_code',
    'first_name',
    'last_name',
    'birth_date',
    'nationality',
    'phone',
    'email',
    'current_address',
    'zip_code',
    'professional_status',
    'monthly_income',
  ];
  
  export const optionalFieldsCandidat: string[] = [
    'bio',
    'avatar_url',
    'profile_photo_url',
    'preferred_language',
    'contact_methods',
    'correspondence_address',
    'marital_status',
    'number_of_children',
    'address_since',
    'moving_reason',
    'employer',
    'position',
    'work_rate',
    'contract_type',
    'contract_start_date',
    'partner_income',
    'other_income',
    'is_onboarded'
  ];
  
  export const allFieldsCandidat: string[] = [
    ...requiredFieldsCandidat,
    ...optionalFieldsCandidat
  ];
  