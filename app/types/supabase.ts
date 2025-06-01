export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      credentials: {
        Row: {
          id: string
          user_id: string
          type: 'password' | 'creditCard' | 'note' | 'wifi'
          title: string
          category: 'social' | 'work' | 'personal' | 'financial' | 'other'
          data: Json
          favorite: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'password' | 'creditCard' | 'note' | 'wifi'
          title: string
          category: 'social' | 'work' | 'personal' | 'financial' | 'other'
          data: Json
          favorite?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'password' | 'creditCard' | 'note' | 'wifi'
          title?: string
          category?: 'social' | 'work' | 'personal' | 'financial' | 'other'
          data?: Json
          favorite?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          settings: Json
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          settings?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 