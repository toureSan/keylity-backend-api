-- =====================================================
-- SCRIPT DE CORRECTION RAPIDE POUR L'AUTHENTIFICATION
-- =====================================================
-- Ce script corrige les problèmes d'authentification après la migration

-- =====================================================
-- 1. VÉRIFIER ET CRÉER LA TABLE PROFILES SI NÉCESSAIRE
-- =====================================================

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    user_type VARCHAR(50) DEFAULT 'candidat',
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. AJOUTER LES COLONNES MANQUANTES SI NÉCESSAIRE
-- =====================================================

-- Ajouter les colonnes de base si elles n'existent pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'candidat',
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 3. CRÉER LA TABLE USER_ROLES SI NÉCESSAIRE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidat', 'annonceur', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- =====================================================
-- 4. MIGRER LES UTILISATEURS EXISTANTS (SI NÉCESSAIRE)
-- =====================================================

-- Insérer les utilisateurs de Supabase Auth dans profiles s'ils n'existent pas
INSERT INTO profiles (id, email, user_type, is_onboarded, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'candidat' as user_type,
    FALSE as is_onboarded,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CRÉER DES RÔLES PAR DÉFAUT
-- =====================================================

-- Créer des rôles par défaut pour les utilisateurs existants
INSERT INTO user_roles (user_id, role)
SELECT 
    p.id,
    p.user_type
FROM profiles p
WHERE p.id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- 6. ACTIVER RLS SUR LES TABLES
-- =====================================================

-- Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CRÉER LES POLITIQUES RLS DE BASE
-- =====================================================

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
-- 8. VÉRIFICATIONS
-- =====================================================

-- Vérifier que les tables existent
SELECT 'Tables créées:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles');

-- Vérifier les utilisateurs migrés
SELECT 'Utilisateurs dans profiles:' as check_type;
SELECT COUNT(*) as user_count FROM profiles;

-- Vérifier les rôles créés
SELECT 'Rôles créés:' as check_type;
SELECT COUNT(*) as role_count FROM user_roles;

-- =====================================================
-- FIN DU SCRIPT DE CORRECTION
-- =====================================================
