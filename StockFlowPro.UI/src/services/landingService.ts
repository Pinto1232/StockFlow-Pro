export interface LandingFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LandingTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  imageUrl: string;
  quote: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LandingStat {
  id: string;
  number: string;
  label: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LandingContent {
  features: LandingFeature[];
  testimonials: LandingTestimonial[];
  stats: LandingStat[];
}

// Backend route is implemented as api/legacy/landing
const API_BASE_URL = '/api/legacy/landing';

export const landingService = {
  async getLandingContent(activeOnly: boolean = true): Promise<LandingContent> {
    try {
      const response = await fetch(`${API_BASE_URL}/content?activeOnly=${activeOnly}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch landing content: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landing content:', error);
      throw error;
    }
  },

  async getFeatures(activeOnly: boolean = true): Promise<LandingFeature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features?activeOnly=${activeOnly}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching features:', error);
      throw error;
    }
  },

  async getTestimonials(activeOnly: boolean = true): Promise<LandingTestimonial[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials?activeOnly=${activeOnly}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  async getStats(activeOnly: boolean = true): Promise<LandingStat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats?activeOnly=${activeOnly}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};
