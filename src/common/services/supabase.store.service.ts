// src/common/services/supabase-storage.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseStorageService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.client = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_KEY')
    );
  }

  async uploadFile(userId: string, file: Buffer, filename: string, mimetype: string) {
    const path = `${userId}/candidat/documents/${filename}`;

    const { error } = await this.client.storage
      .from('documents')
      .upload(path, file, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) throw new Error(`Erreur d'upload Supabase : ${error.message}`);

    const { data } = await this.client.storage
      .from('documents')
      .getPublicUrl(path); 

    return {
      path,
      url: data.publicUrl,
    };
  }
}
