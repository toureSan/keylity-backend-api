-- =====================================================
-- SCRIPT DE TEST DE L'AFFICHAGE DES IMAGES
-- =====================================================

-- 1. Vérifier les données pour l'utilisateur avec les deux rôles
SELECT '--- UTILISATEUR AVEC LES DEUX RÔLES ---' AS info;

SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url,
    ARRAY_AGG(ur.role) AS roles,
    p.advertiser_type
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.id IN (
    SELECT ur2.user_id 
    FROM user_roles ur2 
    WHERE ur2.role = 'candidat'
    AND ur2.user_id IN (
        SELECT ur3.user_id 
        FROM user_roles ur3 
        WHERE ur3.role = 'annonceur'
    )
)
GROUP BY p.id, p.email, p.first_name, p.last_name, p.avatar_url, p.profile_photo_url, p.candidate_profile_image_url, p.annonceur_profile_image_url, p.advertiser_type;

-- 2. Vérifier les données pour l'utilisateur candidat uniquement
SELECT '--- UTILISATEUR CANDIDAT UNIQUEMENT ---' AS info;

SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url,
    ARRAY_AGG(ur.role) AS roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.id IN (
    SELECT ur2.user_id 
    FROM user_roles ur2 
    WHERE ur2.role = 'candidat'
    AND ur2.user_id NOT IN (
        SELECT ur3.user_id 
        FROM user_roles ur3 
        WHERE ur3.role = 'annonceur'
    )
)
GROUP BY p.id, p.email, p.first_name, p.last_name, p.avatar_url, p.profile_photo_url, p.candidate_profile_image_url, p.annonceur_profile_image_url;

-- 3. Vérifier les données pour l'utilisateur annonceur uniquement
SELECT '--- UTILISATEUR ANNONCEUR UNIQUEMENT ---' AS info;

SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url,
    ARRAY_AGG(ur.role) AS roles,
    p.advertiser_type
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.id IN (
    SELECT ur2.user_id 
    FROM user_roles ur2 
    WHERE ur2.role = 'annonceur'
    AND ur2.user_id NOT IN (
        SELECT ur3.user_id 
        FROM user_roles ur3 
        WHERE ur3.role = 'candidat'
    )
)
GROUP BY p.id, p.email, p.first_name, p.last_name, p.avatar_url, p.profile_photo_url, p.candidate_profile_image_url, p.annonceur_profile_image_url, p.advertiser_type;

-- 4. Résumé des images par rôle
SELECT '--- RÉSUMÉ DES IMAGES PAR RÔLE ---' AS info;

SELECT 
    'Images candidat' AS type,
    COUNT(*) AS total,
    COUNT(candidate_profile_image_url) AS avec_image
FROM profiles p
WHERE p.id IN (
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'candidat'
)
UNION ALL
SELECT 
    'Images annonceur' AS type,
    COUNT(*) AS total,
    COUNT(annonceur_profile_image_url) AS avec_image
FROM profiles p
WHERE p.id IN (
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'annonceur'
);
