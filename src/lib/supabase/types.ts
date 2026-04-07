import type { Content } from '@/lib/content/schema'

// Hand-maintained DB types for v1. Keep in sync with
// supabase/migrations/0001_init.sql. Regenerate via `supabase gen types`
// once we outgrow this.

export type Profile = {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export type Site = {
  id: string
  owner_id: string
  template: 'swe'
  content: Content
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Pick<Profile, 'id' | 'username'> &
          Partial<Pick<Profile, 'created_at' | 'updated_at'>>
        Update: Partial<Pick<Profile, 'username'>>
      }
      sites: {
        Row: Site
        Insert: Pick<Site, 'owner_id'> &
          Partial<
            Pick<
              Site,
              'id' | 'template' | 'content' | 'published' | 'published_at'
            >
          >
        Update: Partial<
          Pick<Site, 'template' | 'content' | 'published' | 'published_at'>
        >
      }
    }
  }
}
