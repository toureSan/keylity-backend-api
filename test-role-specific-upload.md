# Test de l'upload d'images spécifiques par rôle

## 🐛 Problème identifié

L'image uploadée sur la page d'accueil était sauvegardée dans les champs génériques (`avatar_url`, `profile_photo_url`) et utilisée pour les deux rôles au lieu d'être spécifique au rôle actuel.

## ✅ Solution appliquée

### Avant (problématique)
```javascript
// Sauvegardait dans les champs génériques pour tous les rôles
await updateProfile({ 
  avatar_url: response.url, 
  profile_photo_url: response.url 
})
```

### Après (corrigé)
```javascript
// Sauvegarde selon le mode actuel
const updateData = { avatar_url: response.url, profile_photo_url: response.url }

// Ajouter l'image dans le champ spécifique au rôle actuel
if (mode.value === 'candidat') {
  updateData.candidate_profile_image_url = response.url
} else if (mode.value === 'annonceur') {
  updateData.annonceur_profile_image_url = response.url
}

await updateProfile(updateData)
```

## 🎯 Comportement attendu

Maintenant, quand vous uploadez une image :

1. **En mode "Candidat"** :
   - ✅ Image sauvegardée dans `candidate_profile_image_url`
   - ✅ Image affichée uniquement quand le mode est "candidat"
   - ✅ L'image de l'annonceur reste inchangée

2. **En mode "Annonceur"** :
   - ✅ Image sauvegardée dans `annonceur_profile_image_url`
   - ✅ Image affichée uniquement quand le mode est "annonceur"
   - ✅ L'image du candidat reste inchangée

3. **Champs génériques** :
   - ✅ `avatar_url` et `profile_photo_url` sont aussi mis à jour pour la compatibilité
   - ✅ Utilisés comme fallback si les champs spécifiques sont vides

## 🧪 Test de la correction

Pour tester que la correction fonctionne :

1. **Connectez-vous avec un utilisateur qui a les deux rôles**

2. **Test en mode "Candidat"** :
   - Basculez vers le mode "Candidat"
   - Uploadez une nouvelle image de profil
   - Vérifiez que l'image s'affiche en mode "Candidat"
   - Basculez vers le mode "Annonceur"
   - Vérifiez que l'ancienne image d'annonceur est toujours affichée

3. **Test en mode "Annonceur"** :
   - Basculez vers le mode "Annonceur"
   - Uploadez une nouvelle image de profil
   - Vérifiez que l'image s'affiche en mode "Annonceur"
   - Basculez vers le mode "Candidat"
   - Vérifiez que l'ancienne image de candidat est toujours affichée

## 📊 Vérification en base de données

Vous pouvez vérifier que les images sont bien séparées :

```sql
SELECT 
    email,
    candidate_profile_image_url,
    annonceur_profile_image_url,
    avatar_url,
    profile_photo_url
FROM profiles 
WHERE id = 'votre_user_id';
```

## 🎉 Résultat attendu

- ✅ Chaque rôle a sa propre image de profil
- ✅ L'upload respecte le mode actuel
- ✅ Les images ne se mélangent plus entre les rôles
- ✅ Le toggle affiche la bonne image selon le mode

---

**Correction terminée ! 🎉**

L'upload d'images est maintenant spécifique au rôle sélectionné.
