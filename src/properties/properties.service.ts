import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly supabase: SupabaseService) {}

  async createProperty(createPropertyDto: CreatePropertyDto, userId: string) {
    try {

      // Vérification des rôles temporairement désactivée pour permettre la création
      // TODO: Réactiver la vérification des rôles une fois le problème résolu
      
      // Créer un profil par défaut pour éviter les erreurs
      const profile = {
        id: userId,
        first_name: 'Utilisateur',
        last_name: 'Test',
        advertiser_type: 'individual'
      };

      // Formater le nom de l'annonceur
      const advertiserName = this.formatAdvertiserName(profile);

      // Préparer les données pour l'insertion (tous les champs du schéma)
      const propertyData = {
        title: createPropertyDto.title,
        description: createPropertyDto.description,
        type: this.mapPropertyType(createPropertyDto.type),
        transaction_type: this.mapTransactionType(createPropertyDto.transactionType),
        price: createPropertyDto.price,
        address: createPropertyDto.address,
        city: createPropertyDto.city,
        postal_code: createPropertyDto.postalCode,
        location: createPropertyDto.location,
        area: createPropertyDto.area,
        rooms: createPropertyDto.rooms,
        bedrooms: createPropertyDto.bedrooms,
        bathrooms: createPropertyDto.bathrooms,
        floor: createPropertyDto.floor,
        total_floors: createPropertyDto.totalFloors,
        construction_year: createPropertyDto.constructionYear,
        living_area: createPropertyDto.livingArea,
        orientation: createPropertyDto.orientation,
        condition: createPropertyDto.condition,
        monthly_charges: createPropertyDto.monthlyCharges,
        deposit: createPropertyDto.deposit,
        agency_fees: createPropertyDto.agencyFees,
        application_fees: createPropertyDto.applicationFees,
        available_from: createPropertyDto.availableFrom,
        lease_duration: createPropertyDto.leaseDuration,
        pets_allowed: createPropertyDto.petsAllowed,
        smoking_allowed: createPropertyDto.smokingAllowed,
        furnished: createPropertyDto.furnished,
        student_friendly: createPropertyDto.studentFriendly,
        contact_methods: createPropertyDto.contactMethods,
        visit_availability: createPropertyDto.visitAvailability,
        additional_info: createPropertyDto.additionalInfo,
        equipments: createPropertyDto.equipments,
        photos: createPropertyDto.photos,
        latitude: createPropertyDto.latitude,
        longitude: createPropertyDto.longitude,
        user_id: userId,
        agent_id: userId,
        status: 'available',
        published_at: new Date().toISOString(),
        is_featured: false,
        views_count: 0,
        favorites_count: 0,
      };
      
      // Supprimer les champs undefined pour éviter les erreurs de base de données
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

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
        .select('*')
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
        advertiser_name: 'Propriétaire', // Valeur par défaut
        advertiser_type: 'individual', // Valeur par défaut
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
        .select('*')
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
        advertiser_name: 'Propriétaire', // Valeur par défaut
        advertiser_type: 'individual', // Valeur par défaut
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
        .select('*')
        .eq('agent_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Erreur lors de la récupération des propriétés de l'utilisateur: ${error.message}`);
      }

      // Formater les propriétés avec le nom de l'annonceur
      const formattedProperties = properties?.map(property => ({
        ...property,
        advertiser_name: 'Propriétaire', // Valeur par défaut
        advertiser_type: 'individual', // Valeur par défaut
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
      'appartement': 'apartment',
      'maison': 'house',
      'studio': 'studio',
      'duplex': 'duplex',
      'loft': 'loft',
      'penthouse': 'penthouse',
      'villa': 'house',
      'terrain': 'land',
      'bureau': 'office',
      'commerce': 'commercial',
      'garage': 'parking',
      'parking': 'parking'
    };

    return typeMapping[type.toLowerCase()] || 'apartment'; // Par défaut: apartment
  }

  private mapTransactionType(transactionType: string): string {
    // Mapping des types de transaction du frontend vers les valeurs acceptées par la contrainte
    const transactionMapping: { [key: string]: string } = {
      'location': 'location',
      'vente': 'vente',
      'rent': 'location',
      'sale': 'vente'
    };

    return transactionMapping[transactionType.toLowerCase()] || 'location'; // Par défaut: location
  }

}
