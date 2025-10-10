-- =====================================================
-- SCRIPT DE TEST POUR L'ENDPOINT D'ONBOARDING
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER QU'UN UTILISATEUR EXISTE
-- =====================================================

SELECT 'Utilisateurs disponibles pour test:' as check_type;
SELECT id, email, user_type, is_onboarded
FROM profiles
LIMIT 5;

-- =====================================================
-- 2. VÉRIFIER LA STRUCTURE DE LA TABLE PROFILES
-- =====================================================

SELECT 'Colonnes de la table profiles:' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
AND column_name IN (
  'first_name', 'last_name', 'email', 'phone', 'birth_date', 'nationality',
  'marital_status', 'current_address', 'zip_code', 'city', 'address_since',
  'moving_reason', 'professional_status', 'employer', 'position', 'work_rate',
  'contract_type', 'contract_start_date', 'monthly_income', 'is_onboarded'
)
ORDER BY column_name;

-- =====================================================
-- 3. TESTER UNE MISE À JOUR MANUELLE
-- =====================================================

-- Mettre à jour un profil de test (remplacez l'ID par un ID réel)
-- UPDATE profiles 
-- SET 
--   first_name = 'Test',
--   last_name = 'User',
--   email = 'test@example.com',
--   phone = '+41789054467',
--   is_onboarded = true,
--   updated_at = NOW()
-- WHERE id = 'REMPLACEZ_PAR_UN_ID_REEL';

-- =====================================================
-- 4. VÉRIFIER LES RÔLES
-- =====================================================

SELECT 'Rôles disponibles:' as check_type;
SELECT role, COUNT(*) as count
FROM user_roles
GROUP BY role
ORDER BY role;

-- =====================================================
-- 5. VÉRIFIER LES POLITIQUES RLS
-- =====================================================

SELECT 'Politiques RLS pour profiles:' as check_type;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- 6. VÉRIFIER LES BUCKETS DE STOCKAGE
-- =====================================================

SELECT 'Buckets disponibles:' as check_type;
SELECT id, name, public, created_at
FROM storage.buckets
ORDER BY created_at;

-- =====================================================
-- 7. TESTER L'ACCÈS AUX DONNÉES
-- =====================================================

-- Vérifier qu'on peut lire les données
SELECT 'Test de lecture des données:' as check_type;
SELECT COUNT(*) as total_profiles FROM profiles;

-- =====================================================
-- 8. VÉRIFIER LES CONTRAINTES
-- =====================================================

SELECT 'Contraintes sur la table profiles:' as check_type;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- =====================================================
-- FIN DU SCRIPT DE TEST
-- =====================================================
