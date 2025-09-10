import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SearchFilters, SearchResult, Pagination, SortOption, ApiResponse } from '@/types';
import OpenAI from 'openai';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{
  results: SearchResult[];
  pagination: Pagination;
}>>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // 검색 파라미터 파싱
    const query = searchParams.get('q') || '';
    const platform = searchParams.get('platform') || '';
    const country = searchParams.get('country') || '';
    const mediaType = searchParams.get('media_type') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const categories = searchParams.get('categories') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortField = searchParams.get('sort_field') || 'created_at';
    const sortDirection = searchParams.get('sort_direction') || 'desc';

    // 검색 필터 구성
    const filters: SearchFilters = {
      query,
      platform: platform || undefined,
      country: country || undefined,
      media_type: mediaType || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      categories: categories ? categories.split(',') : undefined,
    };

    // 정렬 옵션
    const sortOption: SortOption = {
      field: sortField as any,
      direction: sortDirection as 'asc' | 'desc',
    };

    // 검색 실행
    const { results, pagination } = await performSearch(filters, sortOption, page, limit);

    return NextResponse.json({
      success: true,
      data: { results, pagination },
      message: 'Search completed successfully',
    });

  } catch (error) {
    console.error('❌ Search failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}

async function performSearch(
  filters: SearchFilters,
  sortOption: SortOption,
  page: number,
  limit: number
): Promise<{ results: SearchResult[]; pagination: Pagination }> {
  try {
    let query = supabaseAdmin
      .from('ads')
      .select(`
        *,
        advertiser:advertisers(*),
        enrichment:ad_enrichments(*)
      `);

    // 기본 필터 적용
    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    if (filters.media_type) {
      query = query.eq('media_type', filters.media_type);
    }
    if (filters.date_from) {
      query = query.gte('first_seen', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('first_seen', filters.date_to);
    }

    // 카테고리 필터 (AI 분석 결과 기반)
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('enrichment.categories', filters.categories);
    }

    // 텍스트 검색 (Full-text search)
    if (filters.query) {
      // 키워드 검색
      const keywordQuery = supabaseAdmin
        .from('ads')
        .select(`
          *,
          advertiser:advertisers(*),
          enrichment:ad_enrichments(*)
        `)
        .or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);

      // 벡터 검색 (의미적 검색)
      const vectorResults = await performVectorSearch(filters.query, limit * 2);
      
      // 키워드 검색 결과
      const { data: keywordResults } = await keywordQuery;
      
      // 결과 결합 및 중복 제거
      const combinedResults = combineSearchResults(keywordResults || [], vectorResults);
      
      // 정렬 및 페이지네이션
      const sortedResults = sortSearchResults(combinedResults, sortOption);
      const paginatedResults = paginateResults(sortedResults, page, limit);
      
      return {
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total: combinedResults.length,
          total_pages: Math.ceil(combinedResults.length / limit),
        },
      };
    } else {
      // 필터만 적용된 경우
      const { data, count } = await query
        .order(sortOption.field, { ascending: sortOption.direction === 'asc' })
        .range((page - 1) * limit, page * limit - 1)
        .select('*');

      const results: SearchResult[] = (data || []).map(ad => ({
        ad,
        enrichment: ad.enrichment,
        advertiser: ad.advertiser,
        relevance_score: 1.0, // 기본 점수
      }));

      return {
        results,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    }

  } catch (error) {
    console.error('❌ Search query failed:', error);
    throw error;
  }
}

async function performVectorSearch(query: string, limit: number): Promise<SearchResult[]> {
  try {
    // OpenAI 임베딩 생성
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const queryEmbedding = embedding.data[0].embedding;

    // pgvector를 사용한 벡터 검색
    const { data: vectorResults } = await supabaseAdmin.rpc('match_ads', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
    });

    // 결과를 SearchResult 형식으로 변환
    const results: SearchResult[] = (vectorResults || []).map((result: any) => ({
      ad: result.ad,
      enrichment: result.enrichment,
      advertiser: result.advertiser,
      relevance_score: result.similarity || 0.0,
    }));

    return results;

  } catch (error) {
    console.error('❌ Vector search failed:', error);
    return [];
  }
}

function combineSearchResults(
  keywordResults: any[],
  vectorResults: SearchResult[]
): SearchResult[] {
  const combined = new Map<string, SearchResult>();

  // 키워드 검색 결과 추가
  keywordResults.forEach(ad => {
    combined.set(ad.id, {
      ad,
      enrichment: ad.enrichment,
      advertiser: ad.advertiser,
      relevance_score: 1.0,
    });
  });

  // 벡터 검색 결과 추가 (중복 시 더 높은 점수 유지)
  vectorResults.forEach(result => {
    const existing = combined.get(result.ad.id);
    if (!existing || result.relevance_score > existing.relevance_score) {
      combined.set(result.ad.id, result);
    }
  });

  return Array.from(combined.values());
}

function sortSearchResults(results: SearchResult[], sortOption: SortOption): SearchResult[] {
  return results.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortOption.field) {
      case 'relevance':
        aValue = a.relevance_score;
        bValue = b.relevance_score;
        break;
      case 'title':
        aValue = a.ad.title;
        bValue = b.ad.title;
        break;
      case 'first_seen':
        aValue = new Date(a.ad.first_seen);
        bValue = new Date(b.ad.first_seen);
        break;
      case 'created_at':
      default:
        aValue = new Date(a.ad.created_at);
        bValue = new Date(b.ad.created_at);
        break;
    }

    if (sortOption.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

function paginateResults(results: SearchResult[], page: number, limit: number): SearchResult[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return results.slice(startIndex, endIndex);
}

// 검색 제안 API
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<string[]>>> {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // 검색 제안 (카테고리, 키워드 등)
    const suggestions = await getSearchSuggestions(query);

    return NextResponse.json({
      success: true,
      data: suggestions,
      message: 'Search suggestions retrieved successfully',
    });

  } catch (error) {
    console.error('❌ Search suggestions failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get search suggestions',
      },
      { status: 500 }
    );
  }
}

async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const suggestions: string[] = [];

    // 카테고리 제안
    const { data: categories } = await supabaseAdmin
      .from('ad_enrichments')
      .select('categories')
      .ilike('categories', `%${query}%`)
      .limit(5);

    if (categories) {
      categories.forEach(item => {
        item.categories.forEach((cat: string) => {
          if (cat.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(cat)) {
            suggestions.push(cat);
          }
        });
      });
    }

    // 키워드 제안
    const { data: keywords } = await supabaseAdmin
      .from('ad_enrichments')
      .select('keywords_ko, keywords_en')
      .or(`keywords_ko.cs.{${query}},keywords_en.cs.{${query}}`)
      .limit(5);

    if (keywords) {
      keywords.forEach(item => {
        [...item.keywords_ko, ...item.keywords_en].forEach((keyword: string) => {
          if (keyword.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(keyword)) {
            suggestions.push(keyword);
          }
        });
      });
    }

    return suggestions.slice(0, 10); // 최대 10개 제안

  } catch (error) {
    console.error('❌ Failed to get search suggestions:', error);
    return [];
  }
}
