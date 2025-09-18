import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { SupabaseService } from '../common/services/supabase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserProfileController],
  providers: [UserProfileService, SupabaseService],
})
export class UserProfileModule {}
