import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UploadOnboardingController } from './upload-onboarding.controller';
import { SupabaseService } from '../common/services/supabase.service';
import { UploadService } from '../upload/upload.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserProfileController, UploadOnboardingController],
  providers: [UserProfileService, SupabaseService, UploadService],
})
export class UserProfileModule {}
