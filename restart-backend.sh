#!/bin/bash

echo "🔄 Redémarrage du backend Keylity..."

# Arrêter les processus existants sur le port 3000
echo "🛑 Arrêt des processus existants..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Aucun processus sur le port 3000"

# Attendre un peu
sleep 2

# Nettoyer le cache npm
echo "🧹 Nettoyage du cache..."
npm cache clean --force

# Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
npm install

# Démarrer le backend
echo "🚀 Démarrage du backend..."
npm run start:dev
