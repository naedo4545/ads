-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the database schema
CREATE TABLE IF NOT EXISTS advertisers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    advertiser_id TEXT NOT NULL REFERENCES advertisers(id),
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    country TEXT NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active',
    detail_url TEXT NOT NULL,
    content_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_enrichments (
    id TEXT PRIMARY KEY,
    ad_id TEXT UNIQUE NOT NULL REFERENCES ads(id),
    ocr_text TEXT,
    asr_text TEXT,
    combined_text TEXT NOT NULL,
    embedding vector(1536),
    categories TEXT[] DEFAULT '{}',
    keywords_ko TEXT[] DEFAULT '{}',
    keywords_en TEXT[] DEFAULT '{}',
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    ad_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advertisers_country_platform ON advertisers(country, platform);
CREATE INDEX IF NOT EXISTS idx_ads_platform_country_status ON ads(platform, country, status);
CREATE INDEX IF NOT EXISTS idx_ads_first_seen ON ads(first_seen);
CREATE INDEX IF NOT EXISTS idx_ads_content_hash ON ads(content_hash);
CREATE INDEX IF NOT EXISTS idx_ad_enrichments_categories ON ad_enrichments USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

-- Create vector index for embeddings
CREATE INDEX IF NOT EXISTS idx_ad_enrichments_embedding ON ad_enrichments USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_ads(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    ad_id text,
    similarity float,
    ad jsonb,
    enrichment jsonb,
    advertiser jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.ad_id,
        1 - (ae.embedding <=> query_embedding) as similarity,
        to_jsonb(a.*) as ad,
        to_jsonb(ae.*) as enrichment,
        to_jsonb(adv.*) as advertiser
    FROM ad_enrichments ae
    JOIN ads a ON ae.ad_id = a.id
    JOIN advertisers adv ON a.advertiser_id = adv.id
    WHERE 1 - (ae.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
