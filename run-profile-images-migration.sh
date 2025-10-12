#!/bin/bash

# =====================================================
# SCRIPT DE MIGRATION : IMAGES DE PROFIL SPÉCIFIQUES PAR RÔLE
# =====================================================

echo "🚀 Début de la migration des images de profil spécifiques par rôle..."

# Vérifier que psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé. Veuillez installer PostgreSQL client."
    exit 1
fi

# Variables de configuration (à adapter selon votre environnement)
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"keylity"}
DB_USER=${DB_USER:-"postgres"}

echo "📊 Configuration de la base de données:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Demander confirmation
read -p "Voulez-vous continuer avec cette migration ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée."
    exit 1
fi

# Exécuter la migration
echo "🔄 Exécution de la migration..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "add-role-specific-profile-images.sql"; then
    echo "✅ Migration terminée avec succès !"
    echo ""
    echo "📋 Résumé des changements:"
    echo "   - Ajout de la colonne 'candidate_profile_image_url'"
    echo "   - Ajout de la colonne 'annonceur_profile_image_url'"
    echo "   - Création des index pour optimiser les requêtes"
    echo "   - Migration des images existantes vers les nouveaux champs"
    echo ""
    
    # Proposer de vérifier les résultats
    read -p "Voulez-vous vérifier les résultats de la migration ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔍 Vérification des résultats..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "verify-profile-images-migration.sql"
    fi
    
    echo ""
    echo "🎯 Prochaines étapes:"
    echo "   1. Redémarrer le backend API"
    echo "   2. Tester l'upload d'images dans l'onboarding"
    echo "   3. Vérifier que les images s'affichent correctement selon le rôle"
    echo "   4. Tester le switch entre les modes candidat/annonceur"
else
    echo "❌ Erreur lors de la migration."
    exit 1
fi
