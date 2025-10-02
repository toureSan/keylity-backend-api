import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/common/services/supabase.service';

@Injectable()
export class UploadService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.supabaseService.getAdminClient().storage
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
    } = this.supabaseService.getAdminClient().storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabaseService.getAdminClient().storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async getFileUrl(bucket: string, path: string): Promise<string> {
    const {
      data: { publicUrl },
    } = this.supabaseService.getAdminClient().storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }
}
