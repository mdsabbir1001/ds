export interface Package {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  is_popular: boolean;
  popular?: boolean;
  duration?: string;
}


export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  image_url: string;
  bio?: string;
  specialties?: string[];
  social_url_a?: string;
  social_url_b?: string;
  social_url_c?: string;
}

export interface Review {
  id: number;
  name: string;
  designation: string;
  company: string;
  company_url: string;
  project: string;
  rating: number;
  review: string;
  image_url: string;
  approved: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  project_images: string[];
  category_name: string;
  aspect_ratio?: string;
  technologies: string[];
  url?: string;
  github_url?: string;
}

export interface PortfolioCategory {
  id: number;
  name: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  received_at: string;
}

export interface Order {
  order_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  budget?: string;
  timeline?: string;
  package_name: string;
  package_price: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
}

// New interfaces for Home Page Content from Supabase
export interface HomePageContent {
  id: number;
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  cta_title?: string;
  cta_subtitle?: string;
}

export interface HeroImage {
  id?: string | number;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface HomeStat {
  id?: string | number;
  number: string;
  label: string;
  icon?: string;
  display_order: number;
  created_at?: string;
}

export interface HomeServicePreview {
  id?: string;
  title: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at?: string;
}

export interface FullHomePage {
  content: HomePageContent;
  hero_images: HeroImage[];
  stats: HomeStat[];
  services_preview: HomeServicePreview[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface ReviewsStat {
  id?: string;
  number: string;
  label: string;
  order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
  features: string[];
  cover_image_url?: string;
}

