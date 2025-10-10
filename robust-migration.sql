-- =====================================================
-- MIGRATION ROBUSTE QUI GÈRE TOUS LES CAS D'ERREUR
-- =====================================================

-- =====================================================
-- ÉTAPE 1: NETTOYER LES DONNÉES EXISTANTES
-- =====================================================

-- Supprimer les entrées problématiques dans user_roles
DELETE FROM user_roles WHERE role IS NULL;

-- =====================================================
-- ÉTAPE 2: CRÉER/METTRE À JOUR LA TABLE PROFILES
-- =====================================================

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    user_type VARCHAR(50) DEFAULT 'candidat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter toutes les colonnes nécessaires
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'candidat',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_since DATE,
ADD COLUMN IF NOT EXISTS moving_reason TEXT,
ADD COLUMN IF NOT EXISTS professional_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS employer VARCHAR(255),
ADD COLUMN IF NOT EXISTS position VARCHAR(255),
ADD COLUMN IF NOT EXISTS work_rate VARCHAR(50),
ADD COLUMN IF NOT EXISTS contract_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS partner_income DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS other_income TEXT,
ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS agency_license VARCHAR(100),
ADD COLUMN IF NOT EXISTS agency_address TEXT,
ADD COLUMN IF NOT EXISTS agency_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS owner_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS number_of_properties INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS property_relation VARCHAR(100),
ADD COLUMN IF NOT EXISTS legal_representative VARCHAR(255),
ADD COLUMN IF NOT EXISTS representative_role VARCHAR(100),
ADD COLUMN IF NOT EXISTS responsible_agent VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS employment_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS salary_slips_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS bank_statements_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rental_attestation_url TEXT,
ADD COLUMN IF NOT EXISTS debt_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS residence_permit_url TEXT,
ADD COLUMN IF NOT EXISTS guarantor_documents_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferred_property_types JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferred_locations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS min_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS contact_methods JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS correspondence_address TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'fr';

-- =====================================================
-- ÉTAPE 3: MIGRER LES UTILISATEURS
-- =====================================================

-- Migrer les utilisateurs de auth.users vers profiles
INSERT INTO profiles (id, email, user_type, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'candidat' as user_type,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- =====================================================
-- ÉTAPE 4: CORRIGER LES USER_TYPE NULL
-- =====================================================

-- S'assurer que tous les utilisateurs ont un user_type valide
UPDATE profiles 
SET user_type = 'candidat' 
WHERE user_type IS NULL OR user_type = '';

-- =====================================================
-- ÉTAPE 5: CRÉER LA TABLE USER_ROLES
-- =====================================================

-- Supprimer la table user_roles si elle existe et la recréer
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidat', 'annonceur', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- =====================================================
-- ÉTAPE 6: CRÉER LES RÔLES
-- =====================================================

-- Créer des rôles pour tous les utilisateurs
INSERT INTO user_roles (user_id, role)
SELECT 
    p.id,
    p.user_type
FROM profiles p
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- ÉTAPE 7: CONFIGURER RLS
-- =====================================================

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
CREATE POLICY "Users can insert own roles" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ÉTAPE 8: CRÉER LES BUCKETS
-- =====================================================

-- Créer les buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('documents', 'documents', false),
    ('avatars', 'avatars', true),
    ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 9: POLITIQUES DE STOCKAGE
-- =====================================================

-- Politiques pour documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Politiques pour avatars
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- =====================================================
-- ÉTAPE 10: VÉRIFICATIONS FINALES
-- =====================================================

-- Vérifier les utilisateurs
SELECT 'Utilisateurs migrés:' as check_type;
SELECT COUNT(*) as user_count FROM profiles;

-- Vérifier les rôles
SELECT 'Rôles créés:' as check_type;
SELECT role, COUNT(*) as count
FROM user_roles
GROUP BY role
ORDER BY role;

-- Vérifier les buckets
SELECT 'Buckets créés:' as check_type;
SELECT id, name, public FROM storage.buckets;

-- Vérifier qu'il n'y a plus de problèmes
SELECT 'Problèmes restants:' as check_type;
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE user_type IS NULL) as null_user_types,
    (SELECT COUNT(*) FROM user_roles WHERE role IS NULL) as null_roles;

-- =====================================================
-- FIN DE LA MIGRATION ROBUSTE
-- =====================================================
