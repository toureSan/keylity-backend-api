import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
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
      throw new Error(
        `❌ Supabase configuration is incomplete. url=${supabaseUrl}, anonKey=${!!supabaseKey}, serviceKey=${!!supabaseServiceKey}`,
      );
    }

    // Client public (utilisateur)
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    // Client admin (service role)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase clients initialized with URL:', supabaseUrl);
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }
    return this.supabaseAdmin;
  }

  getClientWithUser(accessToken: string): SupabaseClient {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('supabase.url');

    const supabaseAnonKey =
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('supabase.key');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('❌ Supabase client (with user) configuration is incomplete');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }
}
