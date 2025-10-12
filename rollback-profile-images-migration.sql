-- =====================================================
-- ROLLBACK : SUPPRESSION DES IMAGES DE PROFIL SPÉCIFIQUES PAR RÔLE
-- =====================================================

-- ATTENTION : Ce script supprime les nouveaux champs et leurs données
-- Assurez-vous de sauvegarder vos données avant d'exécuter ce script

-- Supprimer les index
DROP INDEX IF EXISTS idx_profiles_candidate_profile_image;
DROP INDEX IF EXISTS idx_profiles_annonceur_profile_image;

-- Supprimer les commentaires
COMMENT ON COLUMN profiles.candidate_profile_image_url IS NULL;
COMMENT ON COLUMN profiles.annonceur_profile_image_url IS NULL;

-- Supprimer les colonnes
ALTER TABLE profiles 
DROP COLUMN IF EXISTS candidate_profile_image_url,
DROP COLUMN IF EXISTS annonceur_profile_image_url;

-- Vérification que les colonnes ont été supprimées
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

-- Si aucune ligne n'est retournée, la suppression a réussi
SELECT 'Rollback terminé - Les colonnes ont été supprimées' AS status;
