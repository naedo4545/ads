'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, X, Play, Image as ImageIcon, Globe, Calendar, Tag, ChevronLeft, ChevronRight, TrendingUp, Clock, Zap, Folder } from 'lucide-react';
import { SearchResult, SearchFilters, SortOption } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });

  // 필터 상태
  const [filters, setFilters] = useState<SearchFilters>({
    platform: searchParams.get('platform') || '',
    country: searchParams.get('country') || '',
    media_type: searchParams.get('media_type') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    categories: searchParams.get('categories')?.split(',') || [],
  });

  // 정렬 옵션
  const [sortOption, setSortOption] = useState<SortOption>({
    field: (searchParams.get('sort_field') as any) || 'created_at',
    direction: (searchParams.get('sort_direction') as any) || 'desc',
  });

  // 유틸: 날짜 preset 적용
  const applyDatePreset = (months: number | 'all') => {
    if (months === 'all') {
      setFilters(prev => ({ ...prev, date_from: '', date_to: '' }));
      performSearch(1);
      updateURL();
      return;
    }
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - (months as number));
    const pad = (n: number) => `${n}`.padStart(2, '0');
    const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;
    const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
    setFilters(prev => ({ ...prev, date_from: fromStr, date_to: toStr }));
    performSearch(1);
    updateURL();
  };


  // 검색 실행
  const performSearch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('q', searchQuery);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.country) params.append('country', filters.country);
      if (filters.media_type) params.append('media_type', filters.media_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.categories?.length) params.append('categories', filters.categories.join(','));
      
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sort_field', sortOption.field);
      params.append('sort_direction', sortOption.direction);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortOption, pagination.limit]);

  // URL 업데이트
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('q', searchQuery);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.country) params.append('country', filters.country);
    if (filters.media_type) params.append('media_type', filters.media_type);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    
    params.append('sort_field', sortOption.field);
    params.append('sort_direction', sortOption.direction);

    router.push(`/search?${params.toString()}`);
  }, [searchQuery, filters, sortOption, router]);

  // 필터 적용 (복구)
  const applyFilters = () => {
    performSearch(1);
    updateURL();
    setShowFilters(true);
  };

  // 필터 초기화 (복구)
  const clearFilters = () => {
    setFilters({
      platform: '',
      country: '',
      media_type: '',
      date_from: '',
      date_to: '',
      categories: [],
    });
    setSortOption({ field: 'created_at', direction: 'desc' });
  };

  // 페이지 변경
  const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      performSearch(page);
      setPagination(prev => ({ ...prev, page }));
    }
  };

  // 초기 로드: 검색 실행
  useEffect(() => {
    performSearch(1);
  }, []);

  // 검색어나 필터 변경 시 검색 실행
  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
      performSearch(1);
    }
  }, [searchQuery, filters, sortOption]);

  const getMediaIcon = (mediaType: string) => {
    return mediaType === 'video' ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              광고 아카이브
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={e=>{e.preventDefault();performSearch(1);updateURL();}} className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="relative bg-white rounded-xl shadow-soft border border-gray-200">
                  <div className="flex items-center p-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="광고 제목, 키워드, 카테고리로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Link href="/collection" className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">내 컬렉션</Link>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${
                  showFilters ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                필터
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* 검색 결과 섹션 (기존) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 bg-white rounded-2xl shadow-soft p-6 h-fit border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">필터 설정</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">플랫폼</label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                >
                  <option value="">모든 플랫폼</option>
                  <option value="youtube">YouTube</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              {/* Country Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">국가</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                >
                  <option value="">모든 국가</option>
                  <option value="KR">한국</option>
                  <option value="US">미국</option>
                  <option value="JP">일본</option>
                  <option value="CN">중국</option>
                </select>
              </div>

              {/* Media Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">미디어 타입</label>
                <select
                  value={filters.media_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, media_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                >
                  <option value="">모든 타입</option>
                  <option value="image">이미지</option>
                  <option value="video">영상</option>
                </select>
              </div>

              {/* Date Range Filter with Presets */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">날짜 범위</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => applyDatePreset(1)} className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-100">최근 1개월</button>
                  <button onClick={() => applyDatePreset(3)} className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-100">최근 3개월</button>
                  <button onClick={() => applyDatePreset(6)} className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-100">최근 6개월</button>
                  <button onClick={() => applyDatePreset('all')} className="px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-100">전체</button>
                </div>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                  />
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">정렬</label>
                <div className="space-y-3">
                  <select
                    value={sortOption.field}
                    onChange={(e) => setSortOption(prev => ({ ...prev, field: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                  >
                    <option value="relevance">관련도</option>
                    <option value="created_at">등록일</option>
                    <option value="first_seen">최초 게재일</option>
                    <option value="title">제목</option>
                  </select>
                  <select
                    value={sortOption.direction}
                    onChange={(e) => setSortOption(prev => ({ ...prev, direction: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={applyFilters}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  필터 적용
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {searchQuery ? `"${searchQuery}" 검색 결과` : '모든 광고'}
                  </h2>
                  <p className="text-gray-600">
                    총 <span className="font-semibold text-gray-900">{pagination.total}</span>개의 광고를 찾았습니다
                  </p>
                </div>
                
                {/* Active Filters Display */}
                {(filters.platform || filters.country || filters.media_type || filters.date_from || filters.date_to) && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-500 font-medium">활성 필터:</span>
                    {filters.platform && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                        {filters.platform}
                      </span>
                    )}
                    {filters.country && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                        {filters.country}
                      </span>
                    )}
                    {filters.media_type && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                        {filters.media_type}
                      </span>
                    )}
                    {(filters.date_from || filters.date_to) && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                        {filters.date_from} ~ {filters.date_to}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">검색 중...</p>
                </div>
              </div>
            )}

            {!loading && results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-soft border border-gray-200">
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">검색 결과가 없습니다</h3>
                <p className="text-gray-500 mb-6">다른 키워드나 필터를 시도해보세요</p>
                <button onClick={()=>clearFilters()} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">필터 초기화</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((result) => (
                    <Link key={result.ad.id} href={`/detail/${result.ad.id}`} className="group bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        {result.ad.media_type === 'video' ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img src={result.ad.media_url} alt={result.ad.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" onError={(e)=>{const t=e.target as HTMLImageElement;t.src='/placeholder-image.jpg';}} />
                        )}
                        <div className="absolute top-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                          {getMediaIcon(result.ad.media_type)}
                          {result.ad.media_type === 'video' ? '영상' : '이미지'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{result.ad.title}</h3>
                        {result.ad.description && (<p className="text-gray-600 text-sm mb-3 line-clamp-2">{result.ad.description}</p>)}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-2"><Globe className="w-4 h-4" />{result.advertiser?.name || 'Unknown'}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{formatDate(result.ad.first_seen)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-center mt-16">
                    <nav className="flex items-center gap-2 bg-white rounded-2xl shadow-soft p-2 border border-gray-200">
                      <button onClick={()=>changePage(pagination.page - 1)} disabled={pagination.page === 1} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" />이전</button>
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={()=>changePage(page)} className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${page===pagination.page ? 'bg-gray-900 text-white' : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                      ))}
                      <button onClick={()=>changePage(pagination.page + 1)} disabled={pagination.page === pagination.total_pages} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">다음<ChevronRight className="w-4 h-4" /></button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
