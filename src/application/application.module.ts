import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { SupabaseService } from '../common/services/supabase.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, SupabaseService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
