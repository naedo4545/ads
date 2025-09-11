const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...');
    
    // init.sql 파일 읽기
    const initSqlPath = path.join(__dirname, '..', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', { sql: initSql });
    
    if (error) {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Database schema setup completed!');
    
    // 테이블 존재 확인
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['advertisers', 'ads', 'ad_enrichments', 'collections']);
    
    if (tablesError) {
      console.warn('⚠️ Could not verify tables:', tablesError);
    } else {
      console.log('📊 Created tables:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
