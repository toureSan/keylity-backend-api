-- =====================================================
-- SCRIPT DE TEST POUR VÉRIFIER L'AUTHENTIFICATION
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER LES UTILISATEURS DANS AUTH.USERS
-- =====================================================

SELECT 'Utilisateurs dans auth.users:' as check_type;
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- =====================================================
-- 2. VÉRIFIER LES PROFILS UTILISATEURS
-- =====================================================

SELECT 'Profils utilisateurs:' as check_type;
SELECT id, email, user_type, is_onboarded, created_at
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- 3. VÉRIFIER LES RÔLES UTILISATEURS
-- =====================================================

SELECT 'Rôles utilisateurs:' as check_type;
SELECT ur.user_id, ur.role, p.email
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
ORDER BY ur.created_at DESC;

-- =====================================================
-- 4. VÉRIFIER LES POLITIQUES RLS
-- =====================================================

SELECT 'Politiques RLS actives:' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 5. TESTER L'ACCÈS AUX DONNÉES
-- =====================================================

-- Vérifier qu'un utilisateur peut voir son propre profil
-- (Ce test nécessite d'être connecté en tant qu'utilisateur)
SELECT 'Test d\'accès aux données:' as check_type;
SELECT 'Pour tester l\'accès, connectez-vous et exécutez: SELECT * FROM profiles WHERE id = auth.uid();' as instruction;

-- =====================================================
-- 6. VÉRIFIER LES BUCKETS DE STOCKAGE
-- =====================================================

SELECT 'Buckets de stockage:' as check_type;
SELECT id, name, public, created_at
FROM storage.buckets
ORDER BY created_at;

-- =====================================================
-- 7. COMPTER LES ÉLÉMENTS
-- =====================================================

SELECT 'Compteurs:' as check_type;
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM user_roles) as user_roles_count,
    (SELECT COUNT(*) FROM storage.buckets) as buckets_count;

-- =====================================================
-- 8. VÉRIFIER LES COLONNES DE LA TABLE PROFILES
-- =====================================================

SELECT 'Colonnes de la table profiles:' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- FIN DU SCRIPT DE TEST
-- =====================================================
