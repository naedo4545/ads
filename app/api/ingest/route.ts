import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createHash } from 'crypto';

// 광고 데이터 타입
interface AdData {
  title: string;
  description?: string;
  advertiser_name: string;
  platform: string;
  country: string;
  media_url?: string;
  media_type: 'video' | 'image';
  first_seen: string;
  status: 'active' | 'inactive' | 'removed';
  detail_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const adData: AdData = await request.json();
    
    // 필수 필드 검증
    if (!adData.title || !adData.advertiser_name) {
      return NextResponse.json(
        { error: 'Title and advertiser name are required' },
        { status: 400 }
      );
    }

    // 콘텐츠 해시 생성 (중복 방지)
    const contentHash = createHash('sha256')
      .update(`${adData.title}-${adData.advertiser_name}-${adData.media_url || ''}`)
      .digest('hex');

    // 중복 체크
    const { data: existingAd } = await supabaseAdmin
      .from('ads')
      .select('id')
      .eq('content_hash', contentHash)
      .single();

    if (existingAd) {
      return NextResponse.json(
        { message: 'Ad already exists', id: existingAd.id },
        { status: 200 }
      );
    }

    // 광고주 ID 생성 또는 조회
    const advertiserId = await getOrCreateAdvertiser(
      adData.advertiser_name,
      adData.country,
      adData.platform
    );

    // 광고 데이터 저장
    const { data: newAd, error } = await supabaseAdmin
      .from('ads')
      .insert({
        advertiser_id: advertiserId,
        title: adData.title,
        description: adData.description,
        media_url: adData.media_url,
        media_type: adData.media_type,
        platform: adData.platform,
        country: adData.country,
        first_seen: adData.first_seen,
        status: adData.status,
        detail_url: adData.detail_url,
        content_hash: contentHash,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save ad' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Ad saved successfully', id: newAd.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getOrCreateAdvertiser(name: string, country: string, platform: string): Promise<string> {
  try {
    // 기존 광고주 조회
    const { data: existingAdvertiser } = await supabaseAdmin
      .from('advertisers')
      .select('id')
      .eq('name', name)
      .eq('country', country)
      .eq('platform', platform)
      .single();

    if (existingAdvertiser) {
      return existingAdvertiser.id;
    }

    // 새 광고주 생성
    const { data: newAdvertiser, error } = await supabaseAdmin
      .from('advertisers')
      .insert({
        name,
        country,
        platform,
      })
      .select('id')
      .single();

    if (error || !newAdvertiser) {
      throw new Error(`Failed to create advertiser: ${error?.message}`);
    }

    return newAdvertiser.id;
  } catch (error) {
    console.error('Failed to get or create advertiser:', error);
    throw error;
  }
}