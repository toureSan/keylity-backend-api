#!/bin/bash

# Script pour exécuter la vérification des champs de propriété
echo "🔍 Vérification des champs de propriété dans la base de données..."

# Vérifier que le fichier SQL existe
if [ ! -f "verify-property-fields.sql" ]; then
    echo "❌ Erreur: Le fichier verify-property-fields.sql n'existe pas"
    exit 1
fi

# Exécuter le script SQL
echo "📊 Exécution de la vérification..."
echo ""

# Note: Vous devrez exécuter ce script dans l'interface SQL de Supabase
echo "📋 Instructions:"
echo "1. Ouvrez l'interface SQL de Supabase"
echo "2. Copiez le contenu du fichier verify-property-fields.sql"
echo "3. Collez-le dans l'éditeur SQL"
echo "4. Exécutez le script"
echo ""
echo "✅ Le script vérifiera:"
echo "   - Structure de la table properties"
echo "   - Dernières propriétés créées avec tous leurs champs"
echo "   - Statistiques sur les champs remplis"
echo "   - Équipements les plus courants"
echo "   - Méthodes de contact les plus courantes"
echo ""
echo "📁 Fichier SQL: verify-property-fields.sql"
