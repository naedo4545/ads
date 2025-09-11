const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAIWorker() {
  try {
    console.log('🧪 Testing AI Worker...');
    
    // 테스트용 광고주 생성
    const { data: advertiser, error: advError } = await supabase
      .from('advertisers')
      .insert({
        name: 'Test Advertiser',
        country: 'KR',
        platform: 'google'
      })
      .select()
      .single();
    
    if (advError) {
      console.log('⚠️ Advertiser creation error:', advError.message);
    } else {
      console.log('✅ Test advertiser created:', advertiser.id);
    }
    
    // 테스트용 광고 생성
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .insert({
        advertiser_id: advertiser.id,
        title: 'Test Ad Title',
        description: 'This is a test ad description',
        media_url: 'https://example.com/test-image.jpg',
        media_type: 'image',
        platform: 'google',
        country: 'KR',
        first_seen: new Date().toISOString(),
        status: 'active',
        detail_url: 'https://example.com/test-ad',
        content_hash: 'test-hash-' + Date.now()
      })
      .select()
      .single();
    
    if (adError) {
      console.log('⚠️ Ad creation error:', adError.message);
    } else {
      console.log('✅ Test ad created:', ad.id);
    }
    
    console.log('✅ Test data created successfully!');
    console.log('Now you can run: npm run analyze');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIWorker();
