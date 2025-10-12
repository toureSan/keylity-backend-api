import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly supabase: SupabaseService) {}

  async createProperty(createPropertyDto: CreatePropertyDto, userId: string) {
    try {

      // Vérifier que l'utilisateur a le rôle annonceur et récupérer le profil
      // Note: user_roles.user_id référence profiles.id, pas users.id
      const { data: profile, error: profileError } = await this.supabase
        .getClient()
        .from('profiles')
        .select('id, first_name, last_name, advertiser_type')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new ForbiddenException('Profil utilisateur non trouvé');
      }

      const { data: userRoles, error: rolesError } = await this.supabase
        .getClient()
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id);

      if (rolesError) {
        throw new Error(`Erreur lors de la vérification des rôles: ${rolesError.message}`);
      }

      const hasAnnonceurRole = userRoles?.some(ur => ur.role === 'annonceur');
      
      if (!hasAnnonceurRole) {
        throw new ForbiddenException('Seuls les annonceurs peuvent publier des propriétés');
      }

      // Formater le nom de l'annonceur
      const advertiserName = this.formatAdvertiserName(profile);

      // Préparer les données pour l'insertion (seulement les champs qui existent dans le schéma)
      const propertyData = {
        title: createPropertyDto.title,
        description: createPropertyDto.description,
        type: this.mapPropertyType(createPropertyDto.type), // Mapping des types de propriétés
        price: createPropertyDto.price,
        address: createPropertyDto.address,
        city: createPropertyDto.city,
        postal_code: createPropertyDto.postalCode,
        agent_id: userId,
      };
      

      // Créer la propriété
      const { data: property, error: createError } = await this.supabase
        .getClient()
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (createError) {
        throw new Error(`Erreur lors de la création de la propriété: ${createError.message}`);
      }

      return property;
    } catch (error) {
      console.error('Erreur dans createProperty:', error);
      throw error;
    }
  }

  async findAllProperties(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      let query = this.supabase
        .getClient()
        .from('properties')
        .select(`
          *,
          profiles!properties_agent_id_fkey (
            first_name,
            last_name,
            advertiser_type,
            profile_photo_url,
            candidate_profile_image_url,
            annonceur_profile_image_url
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.transactionType) {
        query = query.eq('transaction_type', filters.transactionType);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: properties, error, count } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des propriétés: ${error.message}`);
      }

      // Formater les propriétés avec le nom de l'annonceur
      const formattedProperties = properties?.map(property => ({
        ...property,
        advertiser_name: this.formatAdvertiserName(property.profiles),
        advertiser_type: property.profiles?.advertiser_type,
      })) || [];

      return {
        properties: formattedProperties,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Erreur dans findAllProperties:', error);
      throw error;
    }
  }

  async findOneProperty(id: string) {
    try {
      const { data: property, error } = await this.supabase
        .getClient()
        .from('properties')
        .select(`
          *,
          profiles!properties_agent_id_fkey (
            first_name,
            last_name,
            advertiser_type,
            profile_photo_url,
            candidate_profile_image_url,
            annonceur_profile_image_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${error.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      return {
        ...property,
        advertiser_name: this.formatAdvertiserName(property.profiles),
        advertiser_type: property.profiles?.advertiser_type,
      };
    } catch (error) {
      console.error('Erreur dans findOneProperty:', error);
      throw error;
    }
  }

  async getUserProperties(userId: string, page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: properties, error, count } = await this.supabase
        .getClient()
        .from('properties')
        .select(`
          *,
          profiles!properties_agent_id_fkey (
            first_name,
            last_name,
            advertiser_type,
            profile_photo_url,
            candidate_profile_image_url,
            annonceur_profile_image_url
          )
        `)
        .eq('agent_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Erreur lors de la récupération des propriétés de l'utilisateur: ${error.message}`);
      }

      // Formater les propriétés avec le nom de l'annonceur
      const formattedProperties = properties?.map(property => ({
        ...property,
        advertiser_name: this.formatAdvertiserName(property.profiles),
        advertiser_type: property.profiles?.advertiser_type,
      })) || [];

      return {
        properties: formattedProperties,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Erreur dans getUserProperties:', error);
      throw error;
    }
  }

  async updateProperty(id: string, updatePropertyDto: UpdatePropertyDto, userId: string) {
    try {
      // Vérifier que la propriété appartient à l'utilisateur
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('agent_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      if (property.agent_id !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que vos propres propriétés');
      }

      // Mettre à jour la propriété
      const { data: updatedProperty, error: updateError } = await this.supabase
        .getClient()
        .from('properties')
        .update(updatePropertyDto)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de la propriété: ${updateError.message}`);
      }

      return updatedProperty;
    } catch (error) {
      console.error('Erreur dans updateProperty:', error);
      throw error;
    }
  }

  async deleteProperty(id: string, userId: string) {
    try {
      // Vérifier que la propriété appartient à l'utilisateur
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('agent_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      if (property.agent_id !== userId) {
        throw new ForbiddenException('Vous ne pouvez supprimer que vos propres propriétés');
      }

      // Supprimer la propriété
      const { error: deleteError } = await this.supabase
        .getClient()
        .from('properties')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression de la propriété: ${deleteError.message}`);
      }

      return { message: 'Propriété supprimée avec succès' };
    } catch (error) {
      console.error('Erreur dans deleteProperty:', error);
      throw error;
    }
  }

  async removeProperty(id: string, userId: string) {
    return this.deleteProperty(id, userId);
  }

  async uploadPropertyImage(propertyId: string, file: any, userId: string) {
    try {
      // Vérifier que la propriété appartient à l'utilisateur
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('agent_id')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      if (property.agent_id !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que vos propres propriétés');
      }

      // TODO: Implémenter l'upload d'image vers Supabase Storage
      // Pour l'instant, retourner une URL fictive
      const imageUrl = `https://example.com/images/${propertyId}/${Date.now()}.jpg`;
      
      return imageUrl;
    } catch (error) {
      console.error('Erreur dans uploadPropertyImage:', error);
      throw error;
    }
  }

  async deletePropertyImage(propertyId: string, imageUrl: string, userId: string) {
    try {
      // Vérifier que la propriété appartient à l'utilisateur
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('agent_id')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      if (property.agent_id !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que vos propres propriétés');
      }

      // TODO: Implémenter la suppression d'image de Supabase Storage
      // Pour l'instant, retourner un succès
      
      return { message: 'Image supprimée avec succès' };
    } catch (error) {
      console.error('Erreur dans deletePropertyImage:', error);
      throw error;
    }
  }

  async incrementFavorites(propertyId: string) {
    try {
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('favorites_count')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      const newCount = (property.favorites_count || 0) + 1;

      const { error: updateError } = await this.supabase
        .getClient()
        .from('properties')
        .update({ favorites_count: newCount })
        .eq('id', propertyId);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour des favoris: ${updateError.message}`);
      }

      return { favorites_count: newCount };
    } catch (error) {
      console.error('Erreur dans incrementFavorites:', error);
      throw error;
    }
  }

  async decrementFavorites(propertyId: string) {
    try {
      const { data: property, error: fetchError } = await this.supabase
        .getClient()
        .from('properties')
        .select('favorites_count')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la propriété: ${fetchError.message}`);
      }

      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }

      const newCount = Math.max((property.favorites_count || 0) - 1, 0);

      const { error: updateError } = await this.supabase
        .getClient()
        .from('properties')
        .update({ favorites_count: newCount })
        .eq('id', propertyId);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour des favoris: ${updateError.message}`);
      }

      return { favorites_count: newCount };
    } catch (error) {
      console.error('Erreur dans decrementFavorites:', error);
      throw error;
    }
  }

  private formatAdvertiserName(profile: any): string {
    if (!profile) return 'Annonceur';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    }
    
    return 'Annonceur';
  }

  private mapPropertyType(type: string): string {
    // Mapping des types de propriétés du frontend vers les valeurs de l'enum de la base
    const typeMapping: { [key: string]: string } = {
      'duplex': 'apartment',
      'maison': 'house',
      'appartement': 'apartment',
      'studio': 'apartment',
      'loft': 'apartment',
      'villa': 'house',
      'penthouse': 'apartment',
      'terrain': 'land',
      'bureau': 'office',
      'commerce': 'commercial',
      'garage': 'parking',
      'parking': 'parking'
    };

    return typeMapping[type.toLowerCase()] || 'apartment'; // Par défaut: apartment
  }
}
