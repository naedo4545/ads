'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Plus, Edit3, Trash2, Play, Image as ImageIcon, Globe, Calendar, Tag, FolderOpen, Bookmark, Sparkles, Home } from 'lucide-react';
import { Collection, SearchResult } from '@/types';

export default function CollectionPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionAds, setCollectionAds] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionAds(selectedCollection.id);
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      const mockCollections: Collection[] = [
        {
          id: '1',
          name: '마케팅 전략',
          description: '마케팅 관련 광고들을 모아놓은 컬렉션',
          ad_ids: ['ad1', 'ad2', 'ad3'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: '브랜드 분석',
          description: '브랜드 전략 분석을 위한 광고 모음',
          ad_ids: ['ad4', 'ad5'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      setCollections(mockCollections);
      if (mockCollections.length > 0) {
        setSelectedCollection(mockCollections[0]);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionAds = async (collectionId: string) => {
    try {
      // TODO: 실제 API 호출로 대체
      const mockAds: SearchResult[] = [
        {
          ad: {
            id: 'ad1',
            title: '새로운 제품 출시 광고',
            description: '혁신적인 제품을 소개하는 광고',
            media_url: '/placeholder-image.jpg',
            media_type: 'image',
            platform: 'youtube',
            country: 'KR',
            first_seen: new Date().toISOString(),
            status: 'active',
            detail_url: '',
            content_hash: '',
            advertiser_id: 'adv1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          enrichment: {
            id: 'enrich1',
            ad_id: 'ad1',
            combined_text: '새로운 제품 출시 광고 혁신적인 제품을 소개하는 광고',
            embedding: [],
            categories: ['제품', '출시', '혁신'],
            keywords_ko: ['제품', '출시', '혁신', '광고'],
            keywords_en: ['product', 'launch', 'innovation', 'ad'],
            confidence_score: 0.85,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          advertiser: {
            id: 'adv1',
            name: '테크 기업',
            country: 'KR',
            platform: 'youtube',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          relevance_score: 0.9,
        },
      ];
      
      setCollectionAds(mockAds);
    } catch (error) {
      console.error('Failed to fetch collection ads:', error);
    }
  };

  const handleCreateCollection = () => {
    setFormData({ name: '', description: '' });
    setShowCreateModal(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm('정말로 이 컬렉션을 삭제하시겠습니까?')) {
      try {
        // TODO: 실제 API 호출로 대체
        setCollections(prev => prev.filter(c => c.id !== collectionId));
        if (selectedCollection?.id === collectionId) {
          setSelectedCollection(collections[0] || null);
        }
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (showEditModal && editingCollection) {
        // 수정
        const updatedCollection = {
          ...editingCollection,
          name: formData.name,
          description: formData.description,
          updated_at: new Date().toISOString(),
        };
        
        setCollections(prev => prev.map(c => 
          c.id === editingCollection.id ? updatedCollection : c
        ));
        
        if (selectedCollection?.id === editingCollection.id) {
          setSelectedCollection(updatedCollection);
        }
        
        setShowEditModal(false);
        setEditingCollection(null);
      } else {
        // 생성
        const newCollection: Collection = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          ad_ids: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setCollections(prev => [...prev, newCollection]);
        setSelectedCollection(newCollection);
        setShowCreateModal(false);
      }
      
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to save collection:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-gray-700" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">컬렉션</h1>
              </div>
              <p className="text-lg text-gray-600">좋아하는 광고들을 모아서 체계적으로 관리하세요</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
              >
                홈으로
              </Link>
              <button
                onClick={handleCreateCollection}
                className="flex items-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 컬렉션
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Collections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <FolderOpen className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">내 컬렉션</h2>
              </div>
              
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-3">아직 컬렉션이 없습니다</p>
                  <button
                    onClick={handleCreateCollection}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    첫 컬렉션 만들기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        selectedCollection?.id === collection.id
                          ? 'bg-gray-100 border-gray-300 shadow-soft'
                          : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-gray-500 truncate mb-2">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span>{collection.ad_ids.length}개 광고</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCollection(collection);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(collection.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Collection Content */}
          <div className="lg:col-span-3">
            {selectedCollection ? (
              <div className="space-y-6">
                {/* Enhanced Collection Header */}
                <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-200">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Bookmark className="w-6 h-6 text-gray-700" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {selectedCollection.name}
                        </h2>
                      </div>
                      {selectedCollection.description && (
                        <p className="text-lg text-gray-600">{selectedCollection.description}</p>
                      )}
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">총 광고 수</p>
                        <p className="text-3xl font-bold text-gray-700">
                          {selectedCollection.ad_ids.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>생성일: {formatDate(selectedCollection.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>수정일: {formatDate(selectedCollection.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Collection Ads */}
                {collectionAds.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-soft p-16 text-center border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">아직 광고가 없습니다</h3>
                    <p className="text-gray-500 mb-6">
                      이 컬렉션에 광고를 추가해보세요
                    </p>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      광고 찾기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collectionAds.map((result, index) => (
                      <Link
                        key={result.ad.id}
                        href={`/detail/${result.ad.id}`}
                        className="group bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {result.ad.media_type === 'video' ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                              <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={result.ad.media_url}
                              alt={result.ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.jpg';
                              }}
                            />
                          )}
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                            {getMediaIcon(result.ad.media_type)}
                            {result.ad.media_type === 'video' ? '영상' : '이미지'}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-gray-700 transition-colors">
                            {result.ad.title}
                          </h3>
                          
                          {result.ad.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {result.ad.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-2 font-medium">
                              <Globe className="w-4 h-4 text-gray-500" />
                              {result.advertiser?.name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.ad.first_seen)}
                            </span>
                          </div>
                          
                                                      {result.enrichment?.categories && result.enrichment.categories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {result.enrichment.categories.slice(0, 2).map((category, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium border border-gray-200 flex items-center gap-1"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-soft p-16 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bookmark className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">컬렉션을 선택하세요</h3>
                <p className="text-gray-500 mb-6">
                  왼쪽에서 컬렉션을 선택하거나 새 컬렉션을 만들어보세요
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  홈으로 돌아가기
                </Link>
                <button
                  onClick={handleCreateCollection}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  새 컬렉션 만들기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-large border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">새 컬렉션 만들기</h3>
            </div>
            
            <form onSubmit={submitForm}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  컬렉션 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500 transition-colors"
                  placeholder="컬렉션 이름을 입력하세요"
                  required
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  설명 (선택사항)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500 transition-colors"
                  placeholder="컬렉션에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  만들기
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Edit Collection Modal */}
      {showEditModal && editingCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-large border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">컬렉션 수정</h3>
            </div>
            
            <form onSubmit={submitForm}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  컬렉션 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500 transition-colors"
                  placeholder="컬렉션 이름을 입력하세요"
                  required
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  설명 (선택사항)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500 transition-colors"
                  placeholder="컬렉션에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCollection(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
