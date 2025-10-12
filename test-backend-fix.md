# Test de la correction backend pour l'upload d'images spécifiques par rôle

## 🐛 Problème identifié

Le DTO `UpdateProfileDto` ne contenait pas les nouveaux champs `candidate_profile_image_url` et `annonceur_profile_image_url`, ce qui empêchait le backend de traiter correctement les mises à jour d'images spécifiques par rôle.

## ✅ Solution appliquée

### Ajout des champs manquants dans `UpdateProfileDto`

```typescript
@ApiProperty({ description: 'URL de l\'image de profil spécifique au rôle candidat', required: false })
@IsOptional()
@IsString()
candidate_profile_image_url?: string;

@ApiProperty({ description: 'URL de l\'image de profil spécifique au rôle annonceur', required: false })
@IsOptional()
@IsString()
annonceur_profile_image_url?: string;
```

## 🔄 Flux complet de l'upload

1. **Frontend** : L'utilisateur uploade une image en mode "candidat" ou "annonceur"
2. **Frontend** : L'image est sauvegardée dans le champ approprié selon le mode
3. **Backend** : Le DTO `UpdateProfileDto` accepte maintenant les nouveaux champs
4. **Backend** : Le service met à jour la base de données avec les bons champs
5. **Frontend** : L'affichage utilise le composable `useProfileImages` pour montrer la bonne image

## 🧪 Test de la correction

Pour tester que la correction fonctionne :

1. **Redémarrez le backend** :
   ```bash
   cd keylity-backend-api
   npm run start:dev
   ```

2. **Test en mode "Candidat"** :
   - Connectez-vous avec un utilisateur qui a les deux rôles
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

## 🎯 Résultat attendu

- ✅ Chaque rôle a sa propre image de profil
- ✅ L'upload respecte le mode actuel
- ✅ Les images ne se mélangent plus entre les rôles
- ✅ Le toggle affiche la bonne image selon le mode
- ✅ Le backend accepte et traite les nouveaux champs

## 📋 Fichiers modifiés

- ✅ `src/user-profile/dto/update-profile.dto.ts` : Ajout des nouveaux champs
- ✅ `pages/dashboard/index.vue` : Logique d'upload spécifique par rôle (déjà fait)

---

**Correction backend terminée ! 🎉**

L'upload d'images devrait maintenant fonctionner correctement avec des images spécifiques par rôle.
