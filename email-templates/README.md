# 📧 Templates d'emails Keylity

Ce dossier contient les templates d'emails personnalisés pour l'application Keylity, conçus avec un design moderne et professionnel.

## 🎨 Design

- **Thème clair** : Fond blanc avec couleurs douces
- **Responsive** : Adapté aux mobiles et desktop
- **Professionnel** : Design cohérent avec l'identité Keylity
- **Accessible** : Contraste élevé et lisibilité optimale

## 📁 Templates disponibles

### 1. `reset-password.html`
**Usage** : Réinitialisation de mot de passe
- **Variables** : `{{ .ConfirmationURL }}`
- **Durée de validité** : 1 heure
- **Couleur principale** : Bleu (#3b82f6)

### 2. `confirm-email.html`
**Usage** : Confirmation d'email lors de l'inscription
- **Variables** : `{{ .ConfirmationURL }}`
- **Durée de validité** : 24 heures
- **Couleur principale** : Vert (#10b981)

### 3. `welcome.html`
**Usage** : Email de bienvenue après confirmation
- **Variables** : Aucune (email statique)
- **Couleur principale** : Bleu (#3b82f6)

## 🔧 Configuration Supabase

### 1. Accéder aux templates
1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Authentication** > **Email Templates**
3. Sélectionnez le type d'email à personnaliser

### 2. Remplacer le contenu
1. Copiez le contenu HTML du template correspondant
2. Collez-le dans l'éditeur Supabase
3. Sauvegardez les modifications

### 3. Variables disponibles
- `{{ .ConfirmationURL }}` : URL de confirmation/réinitialisation
- `{{ .SiteURL }}` : URL de votre site
- `{{ .Email }}` : Email de l'utilisateur
- `{{ .Token }}` : Token de confirmation

## 🎯 Types d'emails configurés

### Confirmation d'inscription
- **Template** : `confirm-email.html`
- **Sujet** : "Confirmez votre compte - Keylity"
- **Action** : Activation du compte

### Réinitialisation de mot de passe
- **Template** : `reset-password.html`
- **Sujet** : "Réinitialisation de votre mot de passe - Keylity"
- **Action** : Réinitialisation du mot de passe

### Email de bienvenue
- **Template** : `welcome.html`
- **Sujet** : "Bienvenue sur Keylity - Votre compte est activé !"
- **Action** : Onboarding et prochaines étapes

## 🛠️ Personnalisation

### Couleurs
Les couleurs principales peuvent être modifiées dans le CSS :
- **Bleu principal** : `#3b82f6`
- **Vert succès** : `#10b981`
- **Gris texte** : `#475569`
- **Fond** : `#f8fafc`

### Logo
Remplacez l'URL du logo dans chaque template :
```html
<img src="https://keylity.ch/logo.png" alt="Keylity Logo" />
```

### Liens
Mettez à jour les liens vers votre site :
- **Connexion** : `https://keylity.ch/login`
- **Aide** : `https://keylity.ch/help`
- **Support** : `https://keylity.ch/support`

## 📱 Responsive Design

Les templates sont optimisés pour :
- **Desktop** : Largeur maximale de 600px
- **Tablet** : Adaptation automatique
- **Mobile** : Padding et tailles ajustés

## 🔒 Sécurité

### Bonnes pratiques
- **Liens sécurisés** : Utilisation de HTTPS
- **Durées limitées** : Tokens avec expiration
- **Messages clairs** : Instructions de sécurité
- **Fallbacks** : Liens de secours en cas de problème

### Variables sensibles
- Ne jamais exposer de tokens dans les emails
- Utiliser uniquement les variables officielles Supabase
- Vérifier les URLs de redirection

## 🚀 Déploiement

### Test en local
1. Copiez le contenu HTML dans un fichier `.html`
2. Ouvrez dans un navigateur pour prévisualiser
3. Testez les liens et la responsivité

### Mise en production
1. Configurez les templates dans Supabase
2. Testez l'envoi d'emails
3. Vérifiez la réception et l'affichage
4. Surveillez les logs d'envoi

## 📊 Monitoring

### Métriques à suivre
- **Taux d'ouverture** : Emails lus par les utilisateurs
- **Taux de clic** : Clics sur les boutons d'action
- **Taux de conversion** : Confirmations/réinitialisations réussies
- **Erreurs d'envoi** : Emails non délivrés

### Logs Supabase
- Consultez les logs d'authentification
- Surveillez les erreurs d'envoi
- Vérifiez les taux de succès

## 🎨 Personnalisation avancée

### Ajout d'éléments
- **Images** : Ajoutez des illustrations si nécessaire
- **Boutons** : Personnalisez les couleurs et styles
- **Sections** : Ajoutez des blocs d'information
- **Footer** : Modifiez les informations de contact

### A/B Testing
- Testez différents sujets d'email
- Comparez les taux de conversion
- Optimisez selon les résultats

## 📞 Support

Pour toute question sur les templates :
- **Documentation Supabase** : [docs.supabase.com](https://docs.supabase.com)
- **Support Keylity** : support@keylity.ch
- **Équipe technique** : dev@keylity.ch

---

**Note** : Ces templates sont optimisés pour Supabase Auth et respectent les meilleures pratiques d'email marketing et de sécurité.
