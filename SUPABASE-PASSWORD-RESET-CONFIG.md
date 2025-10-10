# 🔐 Configuration Supabase pour la réinitialisation de mot de passe

## 📋 Configuration requise dans Supabase

### 1. URL de redirection
Dans votre dashboard Supabase, allez dans **Authentication** > **URL Configuration** et ajoutez :

```
Site URL: https://votre-domaine.com
Redirect URLs: 
- https://votre-domaine.com/auth/reset-password
- https://votre-domaine.com/auth/confirm-email
```

### 2. Templates d'emails
Remplacez les templates par défaut par nos templates personnalisés :

#### Template de réinitialisation de mot de passe
- **Sujet** : `Réinitialisation de votre mot de passe - Keylity`
- **Contenu** : Copier le contenu de `email-templates/reset-password.html`

#### Template de confirmation d'email
- **Sujet** : `Confirmez votre compte - Keylity`
- **Contenu** : Copier le contenu de `email-templates/confirm-email.html`

### 3. Configuration SMTP (optionnel)
Si vous voulez utiliser votre propre serveur SMTP :

```
SMTP Host: smtp.votre-domaine.com
SMTP Port: 587
SMTP User: noreply@votre-domaine.com
SMTP Pass: votre-mot-de-passe
SMTP Admin Email: admin@votre-domaine.com
```

## 🔄 Flux de réinitialisation

### 1. Demande de réinitialisation
1. Utilisateur clique sur "Mot de passe oublié ?"
2. Saisit son email sur `/auth/forgot-password`
3. Appel API `POST /auth/forgot-password`
4. Supabase envoie un email avec un lien

### 2. Réinitialisation
1. Utilisateur clique sur le lien dans l'email
2. Redirection vers `/auth/reset-password` avec token
3. Plugin `password-reset.client.ts` établit la session
4. Utilisateur saisit son nouveau mot de passe
5. Appel `supabase.auth.updateUser()` pour mettre à jour
6. Déconnexion automatique et redirection vers `/login`

## 🛠️ Variables d'environnement

### Backend (.env)
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://votre-domaine.com
```

### Frontend (nuxt.config.ts)
```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      apiBase: process.env.API_BASE_URL
    }
  }
})
```

## 🔧 Dépannage

### Problème : Le lien redirige vers la connexion
**Cause** : URL de redirection mal configurée dans Supabase
**Solution** : Vérifier que `/auth/reset-password` est dans les Redirect URLs

### Problème : Token invalide
**Cause** : Token expiré ou mal formaté
**Solution** : Vérifier que le plugin `password-reset.client.ts` s'exécute correctement

### Problème : Session non établie
**Cause** : Plugin ne s'exécute pas ou erreur de configuration
**Solution** : Vérifier les logs du navigateur et la configuration Supabase

### Problème : Email non reçu
**Cause** : Configuration SMTP ou spam
**Solution** : Vérifier la configuration SMTP et les dossiers spam

## 📧 Test des emails

### 1. Test en développement
```bash
# Utiliser l'email de test Supabase
test@example.com
```

### 2. Test en production
- Utiliser un email réel
- Vérifier la réception
- Tester le lien de réinitialisation
- Vérifier la mise à jour du mot de passe

## 🔒 Sécurité

### Bonnes pratiques
- **Durée limitée** : Tokens valides 1 heure maximum
- **Usage unique** : Tokens invalidés après utilisation
- **HTTPS obligatoire** : Toutes les URLs en HTTPS
- **Validation côté serveur** : Vérifier les tokens

### Monitoring
- Surveiller les tentatives de réinitialisation
- Logger les erreurs d'authentification
- Alerter en cas de tentatives suspectes

## 📊 Métriques

### À surveiller
- **Taux de demande** : Nombre de demandes de réinitialisation
- **Taux de succès** : Réinitialisations réussies
- **Temps de traitement** : Délai entre demande et réinitialisation
- **Erreurs** : Types d'erreurs et fréquences

### Logs utiles
```typescript
// Dans auth.service.ts
this.logger.log(`Password reset requested for: ${email}`);
this.logger.log(`Password reset email sent to: ${email}`);
this.logger.log(`Password successfully reset for user: ${user.email}`);
```

## 🚀 Déploiement

### 1. Vérifications pré-déploiement
- [ ] URLs de redirection configurées
- [ ] Templates d'emails personnalisés
- [ ] Variables d'environnement correctes
- [ ] Tests de réinitialisation fonctionnels

### 2. Tests post-déploiement
- [ ] Demande de réinitialisation
- [ ] Réception de l'email
- [ ] Clic sur le lien
- [ ] Saisie du nouveau mot de passe
- [ ] Connexion avec le nouveau mot de passe

### 3. Monitoring
- [ ] Logs d'erreur surveillés
- [ ] Métriques configurées
- [ ] Alertes en place

---

**Note** : Cette configuration permet un flux de réinitialisation de mot de passe sécurisé et professionnel avec Supabase.
