-- =====================================================
-- SCRIPT DE VÉRIFICATION : MIGRATION DES IMAGES DE PROFIL
-- =====================================================

-- 1. Vérifier que les nouveaux champs existent
SELECT '--- VÉRIFICATION DES NOUVEAUX CHAMPS ---' AS info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('candidate_profile_image_url', 'annonceur_profile_image_url')
ORDER BY column_name;

-- 2. Compter les utilisateurs par rôle
SELECT '--- COMPTAGE DES UTILISATEURS PAR RÔLE ---' AS info;

SELECT 
    ur.role,
    COUNT(*) as nombre_utilisateurs
FROM user_roles ur
GROUP BY ur.role
ORDER BY ur.role;

-- 3. Vérifier les images existantes dans les anciens champs
SELECT '--- IMAGES DANS LES ANCIENS CHAMPS ---' AS info;

SELECT 
    'avatar_url' as champ,
    COUNT(*) as total,
    COUNT(avatar_url) as avec_image,
    COUNT(*) - COUNT(avatar_url) as sans_image
FROM profiles
UNION ALL
SELECT 
    'profile_photo_url' as champ,
    COUNT(*) as total,
    COUNT(profile_photo_url) as avec_image,
    COUNT(*) - COUNT(profile_photo_url) as sans_image
FROM profiles;

-- 4. Vérifier les images dans les nouveaux champs
SELECT '--- IMAGES DANS LES NOUVEAUX CHAMPS ---' AS info;

SELECT 
    'candidate_profile_image_url' as champ,
    COUNT(*) as total,
    COUNT(candidate_profile_image_url) as avec_image,
    COUNT(*) - COUNT(candidate_profile_image_url) as sans_image
FROM profiles
UNION ALL
SELECT 
    'annonceur_profile_image_url' as champ,
    COUNT(*) as total,
    COUNT(annonceur_profile_image_url) as avec_image,
    COUNT(*) - COUNT(annonceur_profile_image_url) as sans_image
FROM profiles;

-- 5. Détail par rôle et champ d'image
SELECT '--- DÉTAIL PAR RÔLE ET CHAMP D''IMAGE ---' AS info;

SELECT 
    ur.role,
    COUNT(*) as total_utilisateurs,
    COUNT(p.avatar_url) as avec_avatar_url,
    COUNT(p.profile_photo_url) as avec_profile_photo_url,
    COUNT(p.candidate_profile_image_url) as avec_candidate_image,
    COUNT(p.annonceur_profile_image_url) as avec_annonceur_image
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
GROUP BY ur.role
ORDER BY ur.role;

-- 6. Utilisateurs avec les deux rôles
SELECT '--- UTILISATEURS AVEC LES DEUX RÔLES ---' AS info;

SELECT 
    p.id,
    p.email,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url,
    ARRAY_AGG(ur.role) as roles
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.avatar_url, p.profile_photo_url, p.candidate_profile_image_url, p.annonceur_profile_image_url
HAVING COUNT(DISTINCT ur.role) > 1
ORDER BY p.created_at;

-- 7. Exemples d'utilisateurs avec images
SELECT '--- EXEMPLES D''UTILISATEURS AVEC IMAGES ---' AS info;

SELECT 
    p.id,
    p.email,
    ur.role,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE p.avatar_url IS NOT NULL 
   OR p.profile_photo_url IS NOT NULL 
   OR p.candidate_profile_image_url IS NOT NULL 
   OR p.annonceur_profile_image_url IS NOT NULL
ORDER BY p.created_at
LIMIT 10;
