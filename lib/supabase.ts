import { createClient } from '@supabase/supabase-js';

// 환경 변수 검증 (임시 설정)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';

// 개발 환경에서는 경고만 출력
if (process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Supabase environment variables not set. Using placeholder values.');
}

// 클라이언트용 Supabase 인스턴스 (브라우저에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// 서버용 Supabase 인스턴스 (서버 사이드에서만 사용)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 데이터베이스 타입 정의 (Prisma 스키마 기반)
export type Database = {
  public: {
    Tables: {
      advertisers: {
        Row: {
          id: string;
          name: string;
          country: string;
          platform: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          platform: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          platform?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ads: {
        Row: {
          id: string;
          advertiser_id: string;
          title: string;
          description: string | null;
          media_url: string;
          media_type: string;
          platform: string;
          country: string;
          first_seen: string;
          status: string;
          detail_url: string;
          content_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          advertiser_id: string;
          title: string;
          description?: string | null;
          media_url: string;
          media_type: string;
          platform: string;
          country: string;
          first_seen: string;
          status?: string;
          detail_url: string;
          content_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          advertiser_id?: string;
          title?: string;
          description?: string | null;
          media_url?: string;
          media_type?: string;
          platform?: string;
          country?: string;
          first_seen?: string;
          status?: string;
          detail_url?: string;
          content_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ad_enrichments: {
        Row: {
          id: string;
          ad_id: string;
          ocr_text: string | null;
          asr_text: string | null;
          combined_text: string;
          embedding: number[];
          categories: string[];
          keywords_ko: string[];
          keywords_en: string[];
          confidence_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          ocr_text?: string | null;
          asr_text?: string | null;
          combined_text: string;
          embedding: number[];
          categories: string[];
          keywords_ko: string[];
          keywords_en: string[];
          confidence_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ad_id?: string;
          ocr_text?: string | null;
          asr_text?: string | null;
          combined_text?: string;
          embedding?: number[];
          categories?: string[];
          keywords_ko?: string[];
          keywords_en?: string[];
          confidence_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          ad_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          ad_ids: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          ad_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
