-- =====================================================
-- SCRIPT DE TEST DES IMAGES DE PROFIL PAR RÔLE
-- =====================================================

-- 1. Vérifier la structure des données
SELECT '--- STRUCTURE DES DONNÉES ---' AS info;

SELECT
    p.id,
    p.email,
    p.avatar_url,
    p.profile_photo_url,
    p.candidate_profile_image_url,
    p.annonceur_profile_image_url,
    ARRAY_AGG(ur.role) AS roles,
    p.advertiser_type
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.email, p.avatar_url, p.profile_photo_url, p.candidate_profile_image_url, p.annonceur_profile_image_url, p.advertiser_type
ORDER BY p.created_at;

-- 2. Test des cas d'usage
SELECT '--- TEST DES CAS D''USAGE ---' AS info;

-- Cas 1: Utilisateur avec rôle candidat uniquement
SELECT 
    'Candidat uniquement' AS cas,
    p.email,
    p.candidate_profile_image_url AS image_candidat,
    p.annonceur_profile_image_url AS image_annonceur,
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
GROUP BY p.id, p.email, p.candidate_profile_image_url, p.annonceur_profile_image_url;

-- Cas 2: Utilisateur avec rôle annonceur uniquement
SELECT 
    'Annonceur uniquement' AS cas,
    p.email,
    p.candidate_profile_image_url AS image_candidat,
    p.annonceur_profile_image_url AS image_annonceur,
    ARRAY_AGG(ur.role) AS roles
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
GROUP BY p.id, p.email, p.candidate_profile_image_url, p.annonceur_profile_image_url;

-- Cas 3: Utilisateur avec les deux rôles
SELECT 
    'Les deux rôles' AS cas,
    p.email,
    p.candidate_profile_image_url AS image_candidat,
    p.annonceur_profile_image_url AS image_annonceur,
    ARRAY_AGG(ur.role) AS roles
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
GROUP BY p.id, p.email, p.candidate_profile_image_url, p.annonceur_profile_image_url;

-- 3. Statistiques
SELECT '--- STATISTIQUES ---' AS info;

SELECT 
    'Total utilisateurs' AS type,
    COUNT(*) AS count
FROM profiles
UNION ALL
SELECT 
    'Utilisateurs avec image candidat' AS type,
    COUNT(*) AS count
FROM profiles
WHERE candidate_profile_image_url IS NOT NULL
UNION ALL
SELECT 
    'Utilisateurs avec image annonceur' AS type,
    COUNT(*) AS count
FROM profiles
WHERE annonceur_profile_image_url IS NOT NULL
UNION ALL
SELECT 
    'Utilisateurs avec les deux images' AS type,
    COUNT(*) AS count
FROM profiles
WHERE candidate_profile_image_url IS NOT NULL 
AND annonceur_profile_image_url IS NOT NULL;
