import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async submitApplication(
    candidateId: string,
    annonceurId: string,
    propertyId?: string,
    message?: string
  ) {
    try {
      // Vérifier que l'annonceur existe et a le bon rôle
      const { data: annonceur, error: annonceurError } = await this.supabaseService
        .getAdminClient()
        .from('users')
        .select('id, email')
        .eq('id', annonceurId)
        .single();

      if (annonceurError || !annonceur) {
        throw new BadRequestException('Annonceur non trouvé');
      }

      // Vérifier le rôle de l'annonceur
      const { data: roleData, error: roleError } = await this.supabaseService
        .getAdminClient()
        .from('user_roles')
        .select('role')
        .eq('user_id', annonceurId)
        .single();

      if (roleError || roleData?.role !== 'annonceur') {
        throw new BadRequestException('L\'utilisateur n\'est pas un annonceur');
      }

      // Créer la candidature
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('applications')
        .insert([{
          candidate_id: candidateId,
          annonceur_id: annonceurId,
          property_id: propertyId,
          status: 'pending',
          message: message
        }])
        .select()
        .single();

      if (error) {
        this.logger.error(`Error creating application: ${error.message}`);
        throw new BadRequestException('Erreur lors de la création de la candidature');
      }

      this.logger.log(`Application created: ${data.id}`);
      return {
        message: 'Candidature soumise avec succès',
        application_id: data.id,
        status: 'pending'
      };
    } catch (error) {
      this.logger.error(`Error in submitApplication: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Erreur lors de la soumission de la candidature');
    }
  }

  async getMyApplications(userId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('applications')
        .select(`
          id,
          annonceur_id,
          property_id,
          status,
          message,
          created_at,
          annonceur:users!applications_annonceur_id_fkey(email)
        `)
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching applications: ${error.message}`);
        throw new BadRequestException('Erreur lors de la récupération des candidatures');
      }

      return { applications: data };
    } catch (error) {
      this.logger.error(`Error in getMyApplications: ${error.message}`);
      throw new BadRequestException('Erreur lors de la récupération des candidatures');
    }
  }

  async getReceivedApplications(annonceurId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('applications')
        .select(`
          id,
          candidate_id,
          property_id,
          status,
          message,
          created_at,
          candidate:users!applications_candidate_id_fkey(email)
        `)
        .eq('annonceur_id', annonceurId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching received applications: ${error.message}`);
        throw new BadRequestException('Erreur lors de la récupération des candidatures reçues');
      }

      return { applications: data };
    } catch (error) {
      this.logger.error(`Error in getReceivedApplications: ${error.message}`);
      throw new BadRequestException('Erreur lors de la récupération des candidatures reçues');
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    annonceurId: string,
    status: 'accepted' | 'rejected'
  ) {
    try {
      // Vérifier que l'annonceur est bien le propriétaire de cette candidature
      const { data: application, error: fetchError } = await this.supabaseService
        .getAdminClient()
        .from('applications')
        .select('annonceur_id')
        .eq('id', applicationId)
        .single();

      if (fetchError || !application) {
        throw new BadRequestException('Candidature non trouvée');
      }

      if (application.annonceur_id !== annonceurId) {
        throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette candidature');
      }

      // Mettre à jour le statut
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        this.logger.error(`Error updating application status: ${error.message}`);
        throw new BadRequestException('Erreur lors de la mise à jour du statut');
      }

      this.logger.log(`Application ${applicationId} status updated to ${status}`);
      return {
        message: `Candidature ${status === 'accepted' ? 'acceptée' : 'rejetée'}`,
        application: data
      };
    } catch (error) {
      this.logger.error(`Error in updateApplicationStatus: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
  }
}
