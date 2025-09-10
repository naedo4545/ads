'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Image as ImageIcon, Globe, Calendar, Tag, Eye, Brain, FileText, Heart, Share2, Download, ExternalLink } from 'lucide-react';
import { SearchResult } from '@/types';

export default function AdDetailPage() {
  const params = useParams();
  const adId = params.id as string;
  
  const [adDetail, setAdDetail] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchAdDetail();
  }, [adId]);

  const fetchAdDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=&limit=1&ad_id=${adId}`);
      const data = await response.json();
      
      if (data.success && data.data.results.length > 0) {
        setAdDetail(data.data.results[0]);
      } else {
        setError('광고를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('Failed to fetch ad detail:', error);
      setError('광고 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // TODO: 컬렉션에 추가/제거 API 호출
  };

  const getMediaIcon = (mediaType: string) => {
    return mediaType === 'video' ? <Play className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">광고 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !adDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-soft p-8 border border-gray-200">
          <div className="text-gray-300 mb-6">
            <ImageIcon className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">오류가 발생했습니다</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            검색 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { ad, enrichment, advertiser } = adDetail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Link
              href="/search"
              className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <div className="w-8 h-8 bg-gray-100 hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              검색 결과로 돌아가기
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isLiked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-soft'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-soft'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? '좋아요 취소' : '좋아요'}
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <Share2 className="w-4 h-4" />
                공유
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Media Section */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-200">
              <div className="p-8 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full">
                    {getMediaIcon(ad.media_type)}
                    <span className="capitalize font-medium">{ad.media_type === 'video' ? '영상' : '이미지'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full">
                    <Globe className="w-3 h-3" />
                    <span className="font-medium">{ad.platform}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">{ad.country}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{ad.title}</h1>
                
                {ad.description && (
                  <p className="text-gray-600 text-lg leading-relaxed">{ad.description}</p>
                )}
              </div>
              
              <div className="p-8">
                {ad.media_type === 'video' && ad.media_url.includes('youtube') ? (
                  <div className="aspect-video rounded-xl overflow-hidden shadow-medium">
                    <iframe
                      src={getYouTubeEmbedUrl(ad.media_url)}
                      title={ad.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : ad.media_type === 'video' ? (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-soft">
                    <div className="text-center">
                      <div className="bg-white bg-opacity-20 rounded-full p-6 backdrop-blur-sm mb-4">
                        <Play className="w-12 h-12 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium">비디오 재생을 지원하지 않습니다</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={ad.media_url}
                      alt={ad.title}
                      className="w-full h-auto rounded-2xl shadow-soft transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-3 rounded-xl shadow-medium transition-all duration-200 hover:scale-110">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced AI Analysis Section */}
            {enrichment && (
              <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">AI 분석 결과</h2>
                    <p className="text-gray-600">광고 콘텐츠를 AI가 분석한 결과입니다</p>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm px-4 py-2 rounded-full font-semibold">
                      신뢰도: {Math.round(enrichment.confidence_score * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Categories */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      카테고리
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {enrichment.categories.map((category, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      키워드
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600 mb-2 block">한국어</span>
                        <div className="flex flex-wrap gap-2">
                          {enrichment.keywords_ko.map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 mb-2 block">영어</span>
                        <div className="flex flex-wrap gap-2">
                          {enrichment.keywords_en.map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Text */}
                {(enrichment.ocr_text || enrichment.asr_text) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-indigo-600" />
                      </div>
                      추출된 텍스트
                    </h3>
                    <div className="space-y-4">
                      {enrichment.ocr_text && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <span className="text-sm font-semibold text-gray-700 mb-2 block">OCR (이미지)</span>
                          <p className="text-gray-600 leading-relaxed">{enrichment.ocr_text}</p>
                        </div>
                      )}
                      {enrichment.asr_text && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <span className="text-sm font-semibold text-gray-700 mb-2 block">ASR (음성)</span>
                          <p className="text-gray-600 leading-relaxed">{enrichment.asr_text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Metadata Section */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">광고 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">광고주</span>
                    <p className="text-gray-900 font-semibold text-lg">{advertiser?.name || 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">플랫폼</span>
                    <p className="text-gray-900 capitalize font-medium">{ad.platform}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">국가</span>
                    <p className="text-gray-900 font-medium">{ad.country}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">최초 게재일</span>
                    <p className="text-gray-900 font-medium">{formatDate(ad.first_seen)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">상태</span>
                    <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                      ad.status === 'active' ? 'bg-success-100 text-success-800 border border-success-200' :
                      ad.status === 'inactive' ? 'bg-warning-100 text-warning-800 border border-warning-200' :
                      'bg-error-100 text-error-800 border border-error-200'
                    }`}>
                      {ad.status === 'active' ? '활성' : ad.status === 'inactive' ? '비활성' : '제거됨'}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-500 block mb-2">등록일</span>
                    <p className="text-gray-900 font-medium">{formatDate(ad.created_at)}</p>
                  </div>
                </div>
              </div>

              {ad.detail_url && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <a
                    href={ad.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 px-6 py-3 rounded-xl transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    원본 광고 보기
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Advertiser Info */}
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                광고주 정보
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-gray-500 block mb-1">이름</span>
                  <p className="text-gray-900 font-semibold">{advertiser?.name || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-gray-500 block mb-1">국가</span>
                  <p className="text-gray-900 font-medium">{advertiser?.country || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-gray-500 block mb-1">플랫폼</span>
                  <p className="text-gray-900 capitalize font-medium">{advertiser?.platform || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Enhanced Related Ads */}
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">관련 광고</h3>
              <p className="text-gray-500 text-sm mb-6">같은 광고주의 다른 광고들을 확인해보세요</p>
              
              <Link
                href={`/search?advertiser=${advertiser?.name}`}
                className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 px-6 py-3 rounded-xl transition-all duration-200 w-full justify-center"
              >
                <Eye className="w-4 h-4" />
                모든 광고 보기
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 text-gray-700 hover:text-primary-600 bg-white hover:bg-primary-50 px-4 py-3 rounded-xl transition-all duration-200 font-medium">
                  <Download className="w-4 h-4" />
                  미디어 다운로드
                </button>
                <button className="w-full flex items-center gap-3 text-gray-700 hover:text-primary-600 bg-white hover:bg-primary-50 px-4 py-3 rounded-xl transition-all duration-200 font-medium">
                  <Share2 className="w-4 h-4" />
                  링크 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
