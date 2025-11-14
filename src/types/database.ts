/**
 * Database type definitions for Supabase tables
 * These types represent the structure of data in the database
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      catalogs: {
        Row: Catalog;
        Insert: CatalogInsert;
        Update: CatalogUpdate;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: ContactSubmissionInsert;
        Update: ContactSubmissionUpdate;
      };
    };
  };
}

// Profile Types
export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

// Category Types
export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

// Catalog Types
export interface Catalog {
  id: string;
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_url: string;
  thumbnail_url: string;
  file_size: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type CatalogInsert = Omit<Catalog, 'id' | 'created_at' | 'updated_at'>;
export type CatalogUpdate = Partial<CatalogInsert>;

// Contact Submission Types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
  read_at: string | null;
}

export type ContactSubmissionInsert = Omit<ContactSubmission, 'id' | 'created_at' | 'read_at'>;
export type ContactSubmissionUpdate = Partial<Omit<ContactSubmission, 'id' | 'created_at'>>;

// View Models (with joins)
export interface CatalogWithCategory extends Catalog {
  category: Category;
}

// Form Models
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CatalogFormData {
  title_en: string;
  title_ar: string;
  category_id: string;
  pdf_file: File;
  thumbnail_file: File;
}

export interface CategoryFormData {
  name_en: string;
  name_ar: string;
}
