// 광고주 정보
export interface Advertiser {
  id: string;
  name: string;
  country: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

// 광고 기본 정보
export interface Ad {
  id: string;
  advertiser_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: 'video' | 'image';
  platform: 'youtube' | 'google' | 'facebook' | 'instagram';
  country: string;
  first_seen: string;
  status: 'active' | 'inactive' | 'removed';
  detail_url: string;
  content_hash: string; // 중복 방지용 해시
  created_at: string;
  updated_at: string;
}

// 광고 AI 분석 결과
export interface AdEnrichment {
  id: string;
  ad_id: string;
  ocr_text?: string; // 이미지에서 추출된 텍스트
  asr_text?: string; // 영상에서 추출된 텍스트
  combined_text: string; // OCR + ASR 텍스트 결합
  embedding: number[]; // OpenAI/e5 임베딩 벡터
  categories: string[]; // AI가 분류한 카테고리
  keywords_ko: string[]; // 한국어 키워드
  keywords_en: string[]; // 영어 키워드
  confidence_score: number; // AI 분석 신뢰도
  created_at: string;
  updated_at: string;
}

// 컬렉션 (즐겨찾기)
export interface Collection {
  id: string;
  user_id?: string; // 로그인 사용자 ID (선택사항)
  name: string;
  description?: string;
  ad_ids: string[];
  created_at: string;
  updated_at: string;
}

// 검색 결과
export interface SearchResult {
  ad: Ad;
  enrichment?: AdEnrichment;
  advertiser: Advertiser;
  relevance_score: number;
}

// 검색 필터
export interface SearchFilters {
  query?: string;
  platform?: string;
  country?: string;
  media_type?: string;
  date_from?: string;
  date_to?: string;
  categories?: string[];
}

// 크롤링 결과
export interface CrawlResult {
  success: boolean;
  ads_count: number;
  errors?: string[];
  duration_ms: number;
}

// AI 분석 결과
export interface AIAnalysisResult {
  success: boolean;
  ad_id: string;
  enrichment?: AdEnrichment;
  error?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 정렬 옵션
export interface SortOption {
  field: 'created_at' | 'first_seen' | 'relevance' | 'title';
  direction: 'asc' | 'desc';
}
