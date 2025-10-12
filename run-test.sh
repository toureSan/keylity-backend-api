#!/bin/bash

# =====================================================
# SCRIPT DE TEST DES IMAGES DE PROFIL
# =====================================================

echo "🧪 Test des images de profil par rôle..."

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

# Exécuter le test
echo "🔄 Exécution du test..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "test-profile-images.sql"; then
    echo ""
    echo "✅ Test terminé avec succès !"
    echo ""
    echo "📋 Vérifications effectuées:"
    echo "   - Structure des données"
    echo "   - Cas d'usage (candidat, annonceur, les deux)"
    echo "   - Statistiques des images"
    echo ""
    echo "🎯 Prochaines étapes:"
    echo "   1. Vérifier que les résultats correspondent aux attentes"
    echo "   2. Tester le frontend avec le toggle de rôles"
    echo "   3. Vérifier que les images s'affichent correctement"
else
    echo "❌ Erreur lors du test."
    exit 1
fi
