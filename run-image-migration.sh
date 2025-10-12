#!/bin/bash

# =====================================================
# SCRIPT DE MIGRATION DES IMAGES EXISTANTES
# =====================================================

echo "🔄 Migration des images existantes vers les nouveaux champs..."

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
read -p "Voulez-vous migrer les images existantes ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée."
    exit 1
fi

# Exécuter la migration
echo "🔄 Migration en cours..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "migrate-existing-images.sql"; then
    echo "✅ Migration terminée avec succès !"
    echo ""
    echo "📋 Résultats:"
    echo "   - Images migrées vers candidate_profile_image_url pour les candidats"
    echo "   - Images migrées vers annonceur_profile_image_url pour les annonceurs"
    echo "   - Utilisateurs avec les deux rôles ont leurs images dans les deux champs"
    echo ""
    echo "🎯 Prochaines étapes:"
    echo "   1. Redémarrer le backend API"
    echo "   2. Tester l'affichage des images par rôle"
    echo "   3. Vérifier que le toggle fonctionne correctement"
else
    echo "❌ Erreur lors de la migration."
    exit 1
fi
