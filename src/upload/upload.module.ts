import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { SupabaseService } from 'src/common/services/supabase.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, SupabaseService],
  exports: [UploadService],
})
export class UploadModule {}
