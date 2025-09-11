'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, TrendingUp, Clock, Globe, Play, Image as ImageIcon, Zap, BarChart3, ArrowRight, Sparkles } from 'lucide-react';

// 임시 타입 정의
interface SearchResult {
  ad: {
    id: string;
    title: string;
    description?: string;
    media_type: string;
    media_url: string;
    first_seen: string;
  };
  advertiser?: {
    name: string;
  };
}

export default function HomePage() {
  const [popularAds, setPopularAds] = useState<SearchResult[]>([]);
  const [recentAds, setRecentAds] = useState<SearchResult[]>([]);
  const [counts, setCounts] = useState({ ads: 0, advertisers: 0 });
  const [loading, setLoading] = useState(true);
  const [animatedCounts, setAnimatedCounts] = useState({ ads: 0, advertisers: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetchPopular(), fetchRecent(), fetchCounts()]).finally(() => setLoading(false));
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounts();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [counts]);

  const animateCounts = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    const adsStep = counts.ads / steps;
    const advertisersStep = counts.advertisers / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedCounts({
        ads: Math.min(Math.floor(adsStep * currentStep), counts.ads),
        advertisers: Math.min(Math.floor(advertisersStep * currentStep), counts.advertisers)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedCounts(counts);
      }
    }, stepDuration);
  };

  const fetchPopular = async () => {
    try {
      const res = await fetch('/api/search?limit=8&sort_field=relevance&sort_direction=desc');
      const data = await res.json();
      if (data.success) setPopularAds(data.data.results);
    } catch {}
  };

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/search?limit=8&sort_field=created_at&sort_direction=desc');
      const data = await res.json();
      if (data.success) setRecentAds(data.data.results);
    } catch {}
  };

  const fetchCounts = async () => {
    try {
      // 임시: 검색 API의 pagination.total을 사용해 총 광고 수 추정
      const res = await fetch('/api/search?limit=1');
      const data = await res.json();
      if (data.success) {
        const totalAds = data.data.pagination?.total || 0;
        // 광고주 수는 임시로 광고 수의 1/10로 추정 (실제로는 별도 API 필요)
        const estimatedAdvertisers = Math.max(1, Math.floor(totalAds / 10));
        setCounts({ ads: totalAds, advertisers: estimatedAdvertisers });
      }
    } catch {}
  };

  const getMediaIcon = (mediaType: string) => (mediaType === 'video' ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded-full w-48 mx-auto mb-6"></div>
              <div className="h-16 bg-white/20 rounded-lg w-96 mx-auto mb-4"></div>
              <div className="h-16 bg-white/20 rounded-lg w-80 mx-auto mb-8"></div>
              <div className="h-6 bg-white/20 rounded-lg w-64 mx-auto mb-8"></div>
              <div className="flex justify-center gap-4">
                <div className="h-12 bg-white/20 rounded-2xl w-40"></div>
                <div className="h-12 bg-white/20 rounded-2xl w-32"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-64 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[1,2,3].map(i => (
                <div key={i} className="text-center p-8 rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-32 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-48 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title / Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">AI 기반 광고 투명성 플랫폼</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              오픈 광고
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                인사이트 센터
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI 기술로 광고를 더 똑똑하게 탐색하고 분석하세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/search" className="group px-8 py-4 rounded-2xl bg-white text-gray-900 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <SearchIcon className="w-5 h-5" />
                광고검색 시작하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/collection" className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300">
                내 컬렉션 보기
              </Link>
            </div>
          </div>
        </div>
        
      </div>

      {/* 최신 광고 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">최신 광고</h2>
              <p className="text-lg text-gray-600">방금 수집된 최신 광고</p>
            </div>
            <Link href="/search?sort_field=created_at&sort_direction=desc" className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              더 보기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <CardsGrid items={recentAds} getMediaIcon={getMediaIcon} formatDate={formatDate} />
        </div>
      </div>

      {/* 인기 광고 */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">인기 광고</h2>
              <p className="text-lg text-gray-600">관련도 점수 기반으로 선별된 인기 광고</p>
            </div>
            <Link href="/search?sort_field=relevance&sort_direction=desc" className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              더 보기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <CardsGrid items={popularAds} getMediaIcon={getMediaIcon} formatDate={formatDate} />
        </div>
      </div>

      {/* 주요 기능 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">주요 기능</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">AI 기술로 광고를 더 똑똑하게 탐색하고 분석합니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <SearchIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">하이브리드 검색</h3>
              <p className="text-gray-600 leading-relaxed">키워드와 의미 기반 검색을 결합하여 정밀한 결과를 제공합니다</p>
            </div>
            <div className="group text-center p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI 분석</h3>
              <p className="text-gray-600 leading-relaxed">OCR/ASR 임베딩 기반 자동 분류로 광고를 스마트하게 분석합니다</p>
            </div>
            <div className="group text-center p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">실시간 업데이트</h3>
              <p className="text-gray-600 leading-relaxed">크롤러와 워커로 지속적으로 데이터를 갱신합니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 플랫폼 현황 */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">플랫폼 현황</h2>
            <p className="text-lg text-gray-600">실시간으로 확장되는 데이터베이스</p>
          </div>
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="group text-center p-6 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {isVisible ? animatedCounts.ads.toLocaleString() : '0'}
              </h3>
              <p className="text-gray-600 font-medium">수집된 광고</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {isVisible ? animatedCounts.advertisers.toLocaleString() : '0'}
              </h3>
              <p className="text-gray-600 font-medium">광고주</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600 font-medium">실시간 수집</p>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">AI</h3>
              <p className="text-gray-600 font-medium">분석 엔진</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsGrid({ items, getMediaIcon, formatDate }:{ items: SearchResult[]; getMediaIcon:(t:string)=>JSX.Element; formatDate:(d:string)=>string; }){
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <SearchIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">아직 수집된 광고가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((result) => (
        <Link key={result.ad.id} href={`/detail/${result.ad.id}`} className="group bg-white rounded-3xl shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            {result.ad.media_type === 'video' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <img 
                src={result.ad.media_url} 
                alt={result.ad.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                onError={(e)=>{const t=e.target as HTMLImageElement;t.src='/placeholder-image.jpg';}} 
              />
            )}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              {getMediaIcon(result.ad.media_type)}
              {result.ad.media_type === 'video' ? '영상' : '이미지'}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{result.ad.title}</h3>
            {result.ad.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{result.ad.description}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Globe className="w-4 h-4" />
                {result.advertiser?.name || 'Unknown'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                {formatDate(result.ad.first_seen)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}