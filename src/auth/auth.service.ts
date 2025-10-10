import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/services/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { UserRole } from 'src/common/enums/user-role.enum';
import { buildUserProfilePayload } from 'src/common/utils/build-user-profile-payload.util';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, role = UserRole.CANDIDAT } = registerDto;

    try {
      this.logger.log(`Registering user: ${email} (role: ${role})`);

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } =
        await this.supabaseService.getAdminClient().auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${this.configService.get('FRONTEND_URL')}/auth/confirm-email`,
          },
        });

      if (authError) {
        if (authError.status === 422 || authError.status === 409) {
          throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }
        throw new Error(`Auth signup failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error(`Signup failed: aucun utilisateur retourné`);
      }

      const userId = authData.user.id;

      // 2. Insérer dans la table "users"
      const { error: dbError } = await this.supabaseService.getAdminClient()
        .from('users')
        .insert([{
          id: userId,
          email,
          is_email_verified: false,
          created_at: new Date().toISOString(),
        }]);

      if (dbError) {
        this.logger.error(`Erreur insert users: ${JSON.stringify(dbError)}`);
        throw new Error(`Erreur insert users: ${dbError.message}`);
      }

      // 3. Ajouter un rôle
      const { error: roleError } = await this.supabaseService.getAdminClient()
        .from('user_roles')
        .insert([{ user_id: userId, role }]);

      if (roleError) {
        this.logger.error(`Erreur insert user_roles: ${JSON.stringify(roleError)}`);
        throw new Error(`Erreur insert user_roles: ${roleError.message || 'Unknown error'}`);
      }

      // 4. Créer un profil
      const profilePayload = buildUserProfilePayload(userId, role);
      const { error: profileError } = await this.supabaseService.getAdminClient()
        .from('profiles')
        .insert([profilePayload]);

      if (profileError) throw new Error(`Erreur insert profiles: ${profileError.message}`);

      this.logger.log(`Utilisateur ${userId} créé avec succès avec rôle: ${role}`);

      return {
        message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
        userId,
        role,
        email,
        redirectTo: `${this.configService.get('FRONTEND_URL')}/auth/confirm-email`,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      if (error instanceof ConflictException) throw error;
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      this.logger.log(`Login attempt for: ${email}`);

      // Authentifier avec Supabase
      const { data: authData, error: authError } =
        await this.supabaseService.getAdminClient().auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      if (!authData.user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      const userId = authData.user.id;

      // Récupérer les informations de l'utilisateur depuis la table profiles
      let { data: userData, error: userError } = await this.supabaseService.getAdminClient()
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        // Si l'utilisateur n'existe pas dans profiles, essayer de le créer
        this.logger.log(`User ${userId} not found in profiles, creating profile...`);
        
        // Créer un profil basique pour l'utilisateur
        const { data: newProfile, error: createError } = await this.supabaseService.getAdminClient()
          .from('profiles')
          .insert({
            id: userId,
            email: authData.user.email,
            user_type: 'candidat',
            is_onboarded: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id, email')
          .single();

        if (createError || !newProfile) {
          this.logger.error(`Failed to create profile for user ${userId}: ${createError?.message}`);
          throw new UnauthorizedException('Erreur lors de la création du profil');
        }
        
        userData = newProfile;
      }

      // Générer le token JWT
      const payload = { sub: userId, email: userData.email };
      const access_token = this.jwtService.sign(payload);

      this.logger.log(`User ${userId} logged in successfully`);

      return {
        access_token,
        user: {
          id: userData.id,
          email: userData.email,
          is_email_verified: true, // Supabase gère la vérification email
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Erreur lors de la connexion');
    }
  }

  async verifyEmail(token: string) {
    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 
                         this.configService.get<string>('supabase.url');
      const supabaseAnonKey = this.configService.get<string>('SUPABASE_KEY') || 
                             this.configService.get<string>('supabase.key');

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: authData, error: authError } = await tempClient.auth.getUser();

      if (authError) {
        throw new UnauthorizedException('Token de vérification invalide');
      }

      if (!authData.user) {
        throw new UnauthorizedException('Token de vérification invalide');
      }

      const userId = authData.user.id;

      if (authData.user.email_confirmed_at) {
        const payload = { sub: userId, email: authData.user.email };
        const access_token = this.jwtService.sign(payload);

        return {
          message: 'Email déjà vérifié avec succès',
          userId,
          email: authData.user.email,
          access_token,
          user: {
            id: userId,
            email: authData.user.email,
            is_email_verified: true,
          },
        };
      }

      const { error: updateError } = await this.supabaseService.getAdminClient()
        .from('users')
        .update({ is_email_verified: true })
        .eq('id', userId);

      if (updateError) {
        if (!updateError.message.includes('duplicate') && !updateError.message.includes('already')) {
          throw new Error('Erreur lors de la mise à jour du statut de vérification');
        }
      }

      const payload = { sub: userId, email: authData.user.email };
      const access_token = this.jwtService.sign(payload);

      return {
        message: 'Email vérifié avec succès',
        userId,
        email: authData.user.email,
        access_token,
        user: {
          id: userId,
          email: authData.user.email,
          is_email_verified: true,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Erreur lors de la vérification de l\'email');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    try {
      this.logger.log(`Password reset requested for: ${email}`);

      const { error } = await this.supabaseService.getAdminClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${this.configService.get('FRONTEND_URL')}/auth/reset-password`,
      });

      if (error) {
        this.logger.error(`Password reset error for ${email}:`, error);
        throw new UnauthorizedException('Erreur lors de l\'envoi de l\'email de réinitialisation');
      }

      this.logger.log(`Password reset email sent to: ${email}`);
      return {
        message: 'Un email de réinitialisation a été envoyé à votre adresse email',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Unexpected error in forgotPassword for ${email}:`, error);
      throw new UnauthorizedException('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      this.logger.log('Password reset attempt with token');

      // Pour la réinitialisation de mot de passe, nous devons utiliser le client avec le token
      // Créer un client Supabase avec le token de réinitialisation
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = this.configService.get('SUPABASE_URL');
      const supabaseAnonKey = this.configService.get('SUPABASE_ANON_KEY');
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Vérifier le token et réinitialiser le mot de passe
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        this.logger.error('Password reset error:', error);
        throw new UnauthorizedException('Token de réinitialisation invalide ou expiré');
      }

      this.logger.log(`Password successfully reset for user: ${data.user?.email}`);
      return {
        message: 'Votre mot de passe a été réinitialisé avec succès',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Unexpected error in resetPassword:', error);
      throw new UnauthorizedException('Erreur lors de la réinitialisation du mot de passe');
    }
  }
}
