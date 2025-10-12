-- =====================================================
-- SCRIPT DE TEST POUR LA TABLE USER_ROLES
-- =====================================================

-- 1. Vérifier la structure de la table user_roles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_roles';

-- 3. Vérifier les utilisateurs et leurs rôles
SELECT 
    p.id,
    p.email,
    p.is_onboarded,
    p.annonceur_onboarding_completed,
    p.candidate_onboarding_completed,
    ur.role,
    ur.created_at as role_created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;

-- 4. Vérifier les utilisateurs sans rôles
SELECT 
    p.id,
    p.email,
    p.is_onboarded
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.user_id IS NULL;

-- 5. Tester l'insertion d'un rôle (remplacer USER_ID par un vrai ID)
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('USER_ID_ICI', 'annonceur')
-- ON CONFLICT (user_id, role) DO UPDATE SET
--     updated_at = NOW();
