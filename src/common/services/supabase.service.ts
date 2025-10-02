import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('supabase.url');

    const supabaseKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('supabase.key');

    const supabaseServiceKey =
      this.configService.get<string>('SUPABASE_SERVICE_KEY') ||
      this.configService.get<string>('supabase.serviceKey');

    if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
      throw new InternalServerErrorException(
        `Supabase configuration is incomplete. url=${supabaseUrl}, anonKey=${!!supabaseKey}, serviceKey=${!!supabaseServiceKey}`,
      );
    }

    // Client public (utilisateur)
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Client admin (service role)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase client not initialized');
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new InternalServerErrorException(
        'Supabase admin client not initialized',
      );
    }
    return this.supabaseAdmin;
  }

  /**
   * Crée un client Supabase lié à un utilisateur authentifié
   * et valide le token avant de le retourner.
   */
  async getClientWithUser(accessToken: string): Promise<SupabaseClient> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('supabase.url');

    const supabaseAnonKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('supabase.key');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new InternalServerErrorException(
        'Supabase client (with user) configuration is incomplete',
      );
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Vérifie que le token est valide
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user) {
      throw new BadRequestException('Invalid or expired access token');
    }

    return client;
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(
        `Error uploading file: ${error.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new BadRequestException(
        `Error deleting file: ${error.message}`,
      );
    }
  }
}
