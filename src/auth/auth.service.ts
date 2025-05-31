import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/services/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import * as jwt from 'jsonwebtoken';
// Définition des rôles disponibles
export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  USER = 'user'
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role = UserRole.USER } = registerDto;

    try {
      this.logger.log(`Attempting to register user with email: ${email} and role: ${role}`);

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser, error: checkError } = await this.supabaseService
        .getClient()
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        this.logger.error(`Error checking existing user: ${checkError.message}`);
        throw new Error(`Erreur lors de la vérification de l'utilisateur: ${checkError.message}`);
      }

      if (existingUser) {
        this.logger.warn(`User with email ${email} already exists`);
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      // Créer l'utilisateur dans Supabase Auth avec redirection
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role,
            },
            emailRedirectTo: `${this.configService.get('app.frontendUrl')}/auth/confirm-email`,
          },
        });

      if (authError) {
        this.logger.error(`Error during signup: ${authError.message}`);
        throw new Error(`Erreur lors de l'inscription: ${authError.message}`);
      }

      if (!authData.user) {
        this.logger.error('No user data returned from signup');
        throw new Error('Erreur l\'inscription: Aucune donnée utilisateur retournée');
      }

      // Créer l'utilisateur dans la table users
      const { error: dbError } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            is_email_verified: false,
            role: role,
          },
        ]);

      if (dbError) {
        this.logger.error(`Error creating user in database: ${dbError.message}`);
        throw new Error(`Erreur lors de la création de l'utilisateur: ${dbError.message}`);
      }

      // Créer le profil avec des champs spécifiques selon le rôle
      const { error: profileError } = await this.supabaseService
        .getAdminClient()
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            // Champs communs
            phone_number: null,
            address: null,
            city: null,
            postal_code: null,
            bio: null,
            avatar_url: null,
            // Champs spécifiques aux agents
            ...(role === UserRole.AGENT && {
              agency_name: null,
              agency_license: null,
              agency_address: null,
              agency_phone: null,
            }),
            // Champs spécifiques aux candidats
            ...(role === UserRole.USER && {
              preferred_property_types: [],
              min_price: null,
              max_price: null,
              preferred_locations: [],
            }),
          },
        ]);

      if (profileError) {
        this.logger.error(`Error creating user profile: ${profileError.message}`);
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      this.logger.log(`User registered successfully: ${authData.user.id}`);
      return {
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        userId: authData.user.id,
        role: role,
        email: email,
        redirectTo: `${this.configService.get('app.frontendUrl')}/auth/confirm-email`,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  // Méthode pour ajouter un rôle à un utilisateur
  async addRoleToUser(userId: string, role: UserRole) {
    try {
      const { error } = await this.supabaseService
        .getAdminClient()
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role: role,
          },
        ]);

      if (error) {
        this.logger.error(`Error adding role to user: ${error.message}`);
        throw new Error(`Erreur lors de l'ajout du rôle: ${error.message}`);
      }

      return { message: 'Rôle ajouté avec succès' };
    } catch (error) {
      this.logger.error(`Add role error: ${error.message}`);
      throw new Error(`Erreur lors de l'ajout du rôle: ${error.message}`);
    }
  }

  // Méthode pour vérifier si un utilisateur a un rôle spécifique
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (error) {
        this.logger.error(`Error checking user role: ${error.message}`);
        return false;
      }

      return !!data;
    } catch (error) {
      this.logger.error(`Check role error: ${error.message}`);
      return false;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      this.logger.log(`Attempting login for user: ${email}`);

      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        this.logger.warn(`Login failed for user ${email}: ${error.message}`);
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Vérifier si l'email est vérifié
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .from('users')
        .select('is_email_verified')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        this.logger.error(`Error checking email verification: ${userError.message}`);
        throw new Error(`Erreur lors de la vérification de l'email: ${userError.message}`);
      }

      if (!userData.is_email_verified) {
        this.logger.warn(`Unverified user attempted login: ${email}`);
        throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
      }

      // Générer le token JWT
      const payload = {
        sub: data.user.id,
        email: data.user.email,
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      });

      this.logger.log(`User logged in successfully: ${data.user.id}`);
      return {
        access_token: token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Erreur lors de la connexion: ${error.message}`);
    }
  }

  async verifyEmail(token: string) {
    try {
      this.logger.log('Décodage du token de vérification...');

      // 1. Décoder le token (sans vérification de signature)
      const payload = jwt.decode(token) as any;

      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Token invalide ou incomplet');
      }

      const userId = payload.sub;
      const userEmail = payload.email;

      this.logger.log(`Token décodé avec succès. userId=${userId}, email=${userEmail}`);

      // 2. Vérifier si l'utilisateur existe
      const { data: user, error } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.error(`Utilisateur introuvable pour l'ID : ${userId}`);
        throw new UnauthorizedException('Utilisateur introuvable');
      }

      // 3. Mettre à jour is_email_verified si besoin
      if (!user.is_email_verified) {
        const { error: updateError } = await this.supabaseService
          .getAdminClient()
          .from('users')
          .update({ is_email_verified: true })
          .eq('id', userId);

        if (updateError) {
          this.logger.error(`Erreur lors de la mise à jour de la vérification : ${updateError.message}`);
          throw new Error('Erreur lors de la mise à jour de la vérification');
        }

        this.logger.log('Statut is_email_verified mis à jour avec succès.');
      }

      return {
        message: 'Email vérifié avec succès',
        user: {
          id: userId,
          email: userEmail
        },
        access_token: token,
        isVerified: true,
        redirectTo: `${this.configService.get('app.frontendUrl')}/dashboard`
      };
    } catch (error) {
      throw new UnauthorizedException('Erreur lors de la vérification de l\'email');
    }
  }

  async getUserProfile(userId: string) {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        is_email_verified,
        role,
        profiles (
          phone_number,
          address,
          city,
          postal_code,
          bio,
          avatar_url,
          agency_name,
          agency_license,
          agency_address,
          agency_phone,
          preferred_property_types,
          min_price,
          max_price,
          preferred_locations
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw new UnauthorizedException('Erreur lors de la récupération des informations utilisateur');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isEmailVerified: user.is_email_verified,
      role: user.role,
      profile: user.profiles
    };
  }
} 