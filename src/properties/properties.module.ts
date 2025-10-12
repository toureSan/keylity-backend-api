import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { SupabaseService } from '../common/services/supabase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, SupabaseService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
