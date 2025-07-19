import { supabase } from './supabase';
import { type HomePageContent, type HeroImage, type HomeStat, type HomeServicePreview, type FullHomePage } from '../types';

export const API_URL = import.meta.env.VITE_BACKEND_URL;

export const getFullHomePage = async (): Promise<FullHomePage> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const isAuthenticated = !userError && userData?.user;

    const { data: contentData, error: contentError } = await supabase
      .from('home_content')
      .select('*')
      .limit(1)
      .single();

    
    

    let finalContent = contentData;
    if (contentError && contentError.code === 'PGRST116') { // No rows found
      
      if (isAuthenticated) {
        
        const { data: newContentData, error: insertError } = await supabase
          .from('home_content')
          .insert([{}]) // Insert an empty object as a default row
          .select('id, hero_title, hero_subtitle, hero_description, cta_title, cta_subtitle') // Select all fields including id
          .single();
        if (insertError) throw insertError;
        finalContent = newContentData;
        
      } else {
        
        finalContent = {}; // Return empty object if not authenticated and no data
      }
    } else if (contentError) {
      throw contentError;
    }

    

    const { data: heroImagesData, error: heroImagesError } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order');
    if (heroImagesError) throw heroImagesError;

    const { data: statsData, error: statsError } = await supabase
      .from('home_stats')
      .select('*')
      .order('display_order');
    if (statsError) throw statsError;

    const { data: servicesPreviewData, error: servicesPreviewError } = await supabase
      .from('home_services_preview')
      .select('*')
      .order('display_order');
    if (servicesPreviewError) throw servicesPreviewError;

    return {
      content: finalContent || {},
      hero_images: heroImagesData || [],
      stats: statsData || [],
      services_preview: servicesPreviewData || [],
    };
  } catch (error) {
    console.error("Error fetching full home page data:", error);
    return {
      content: { id: 0, hero_title: '', hero_subtitle: '', hero_description: '', cta_title: '', cta_subtitle: '' },
      hero_images: [],
      stats: [],
      services_preview: [],
    };
  }
};

export const getHomePageContent = async (): Promise<HomePageContent | null> => {
  const { data, error } = await supabase
    .from('home_content')
    .select('*')
    .limit(1);

  if (error) {
    
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

export const addHomePageContent = async (content: Omit<HomePageContent, 'id' | 'created_at'>, token: string): Promise<HomePageContent | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_content')
    .insert([content])
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const updateHomePageContent = async (content: HomePageContent, token: string): Promise<HomePageContent | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_content')
    .update(content)
    .eq('id', content.id)
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

// --- Hero Images API ---
export const getHeroImages = async (): Promise<HeroImage[]> => {
  const { data, error } = await supabase.from('hero_images').select('*');

  if (error) {
    
    return [];
  }

  return data || [];
};

export const addHeroImage = async (image: Omit<HeroImage, 'id' | 'created_at'>, token: string): Promise<HeroImage | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('hero_images')
    .insert([image])
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const updateHeroImage = async (id: string, image: Partial<HeroImage>, token: string): Promise<HeroImage | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('hero_images')
    .update(image)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const deleteHeroImage = async (id: string, token: string): Promise<boolean> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  
  const { error } = await supabase.from('hero_images').delete().eq('id', id);

  if (error) {
    
    return false;
  }

  
  return true;
};

// --- Home Stats API ---
export const getHomeStats = async (): Promise<HomeStat[]> => {
  const { data, error } = await supabase.from('home_stats').select('*');

  if (error) {
    
    return [];
  }

  return data || [];
};

export const addHomeStat = async (stat: Omit<HomeStat, 'id' | 'created_at'>, token: string): Promise<HomeStat | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_stats')
    .insert([stat])
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const updateHomeStat = async (id: string, stat: Partial<HomeStat>, token: string): Promise<HomeStat | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_stats')
    .update(stat)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const deleteHomeStat = async (id: string, token: string): Promise<boolean> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  
  const { error } = await supabase.from('home_stats').delete().eq('id', id);

  if (error) {
    
    return false;
  }

  
  return true;
};

// --- Home Services API ---
export const getHomeServices = async (): Promise<HomeServicePreview[]> => {
  const { data, error } = await supabase.from('home_services').select('*');

  if (error) {
    
    return [];
  }

  return data || [];
};

export const addHomeService = async (service: Omit<HomeServicePreview, 'id' | 'created_at'>, token: string): Promise<HomeServicePreview | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_services')
    .insert([service])
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const updateHomeService = async (id: string, service: Partial<HomeServicePreview>, token: string): Promise<HomeServicePreview | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { data, error } = await supabase
    .from('home_services')
    .update(service)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    
    return null;
  }

  return data;
};

export const deleteHomeService = async (id: string, token: string): Promise<boolean> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { error } = await supabase.from('home_services').delete().eq('id', id);

  if (error) {
    
    return false;
  }

  return true;
};

export const deleteHomeServicePreview = async (id: string, token: string): Promise<boolean> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  const { error } = await supabase.from('home_services_preview').delete().eq('id', id);

  if (error) {
    
    return false;
  }

  return true;
};


// New function to update the full home page
export const updateFullHomePage = async (data: FullHomePage, token: string): Promise<boolean> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  try {
    // Update home_content
    if (data.content.id) {
      const { id, ...contentToUpdate } = data.content;
      const { error: contentError } = await supabase
        .from('home_content')
        .update(contentToUpdate)
        .eq('id', id)
        .select()
        .single();
      if (contentError) {
        
        throw contentError;
      }
      
    } else {
      const { error: contentError } = await supabase
        .from('home_content')
        .insert([data.content])
        .select()
        .single();
      if (contentError) {
        
        throw contentError;
      }
      
    }

    // Delete existing hero images and insert new ones
    const { error: deleteHeroError } = await supabase.from('hero_images').delete().neq('id', 0); // Delete all
    if (deleteHeroError) {
      
      throw deleteHeroError;
    }
    
    if (data.hero_images.length > 0) {
      const heroImagesToInsert = data.hero_images.map(({ id, ...rest }) => rest);
      const { error: insertHeroError } = await supabase.from('hero_images').insert(heroImagesToInsert);
      if (insertHeroError) {
        
        throw insertHeroError;
      }
      
    }

    // Delete existing home stats and insert new ones
    const { error: deleteStatsError } = await supabase.from('home_stats').delete().neq('id', 0); // Delete all
    if (deleteStatsError) {
      
      throw deleteStatsError;
    }
    
    if (data.stats.length > 0) {
      const statsToInsert = data.stats.map(({ id, icon, ...rest }) => ({ ...rest, icon }));
      const { error: insertStatsError } = await supabase.from('home_stats').insert(statsToInsert);
      if (insertStatsError) {
        
        throw insertStatsError;
      }
      
    }

    // Delete existing home services preview and insert new ones
    const { error: deleteServicesError } = await supabase.from('home_services_preview').delete().neq('id', 0); // Delete all
    if (deleteServicesError) {
      
      throw deleteServicesError;
    }
    
    if (data.services_preview.length > 0) {
      const servicesToInsert = data.services_preview.map(({ id, ...rest }) => rest);
      const { error: insertServicesError } = await supabase.from('home_services_preview').insert(servicesToInsert);
      if (insertServicesError) {
        
        throw insertServicesError;
      }
      
    }

    return true;
  } catch (error) {
    console.error("Error fetching full home page data:", error);
    return false;
  }
};

// --- Image Upload API ---
export const uploadImage = async (file: File, token: string): Promise<string | null> => {
  supabase.auth.setSession({ access_token: token, refresh_token: token });
  
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (error) {
      
      return null;
    }

    
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    
    return publicUrlData.publicUrl;
  } catch (err: any) {
    
    return null;
  }
};