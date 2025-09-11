import 'dotenv/config';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';
import { AdEnrichment, AIAnalysisResult } from '@/types';

interface AIWorkerConfig {
  batchSize: number;
  delay: number;
  openaiApiKey: string;
}

class AIWorker {
  private openai: OpenAI;
  private config: AIWorkerConfig;
  private isRunning: boolean = false;

  constructor() {
    // Load environment variables explicitly
    require('dotenv').config({ path: '.env.local' });
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.config = {
      batchSize: parseInt(process.env.AI_WORKER_BATCH_SIZE || '10'),
      delay: parseInt(process.env.AI_WORKER_DELAY || '5000'),
      openaiApiKey,
    };

    this.openai = new OpenAI({
      apiKey: this.config.openaiApiKey,
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ AI Worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting AI Worker...');

    try {
      while (this.isRunning) {
        await this.processBatch();
        await this.delay(this.config.delay);
      }
    } catch (error) {
      console.error('❌ AI Worker failed:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('🛑 AI Worker stopped');
  }

  private async processBatch(): Promise<void> {
    try {
      // 분석이 필요한 광고 조회
      const { data: adsToAnalyze, error } = await supabaseAdmin
        .from('ads')
        .select(`
          id,
          title,
          description,
          media_url,
          media_type,
          platform
        `)
        .not('id', 'in', `(
          SELECT ad_id FROM ad_enrichments
        )`)
        .limit(this.config.batchSize);

      if (error) {
        throw new Error(`Failed to fetch ads: ${error.message}`);
      }

      if (!adsToAnalyze || adsToAnalyze.length === 0) {
        console.log('💤 No ads to analyze, waiting...');
        return;
      }

      console.log(`🔍 Processing ${adsToAnalyze.length} ads for AI analysis...`);

      // 배치 처리
      const results: AIAnalysisResult[] = [];
      for (const ad of adsToAnalyze) {
        try {
          const result = await this.analyzeAd(ad);
          results.push(result);
        } catch (error) {
          console.error(`❌ Failed to analyze ad ${ad.id}:`, error);
          results.push({
            success: false,
            ad_id: ad.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // 결과 저장
      await this.saveResults(results);

      console.log(`✅ Processed batch: ${results.filter(r => r.success).length}/${results.length} successful`);
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      throw error;
    }
  }

  private async analyzeAd(ad: any): Promise<AIAnalysisResult> {
    try {
      console.log(`🤖 Analyzing ad: ${ad.title}`);

      let ocrText = '';
      let asrText = '';

      // OCR 분석 (이미지인 경우)
      if (ad.media_type === 'image') {
        ocrText = await this.performOCR(ad.media_url);
      }

      // ASR 분석 (영상인 경우)
      if (ad.media_type === 'video') {
        asrText = await this.performASR(ad.media_url);
      }

      // 텍스트 결합
      const combinedText = this.combineTexts(ad.title, ad.description, ocrText, asrText);

      // OpenAI 임베딩 생성
      const embedding = await this.generateEmbedding(combinedText);

      // 카테고리 및 키워드 생성
      const { categories, keywords_ko, keywords_en, confidence_score } = 
        await this.generateCategoriesAndKeywords(combinedText);

      const enrichment: AdEnrichment = {
        id: '', // 데이터베이스에서 자동 생성
        ad_id: ad.id,
        ocr_text: ocrText || undefined,
        asr_text: asrText || undefined,
        combined_text: combinedText,
        embedding,
        categories,
        keywords_ko,
        keywords_en,
        confidence_score,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        ad_id: ad.id,
        enrichment,
      };
    } catch (error) {
      console.error(`❌ Failed to analyze ad ${ad.id}:`, error);
      return {
        success: false,
        ad_id: ad.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async performOCR(imageUrl: string): Promise<string> {
    try {
      // PaddleOCR을 사용한 이미지 텍스트 추출
      // 실제 구현에서는 PaddleOCR API 또는 서비스를 호출
      console.log(`📷 Performing OCR on: ${imageUrl}`);
      
      // 임시 구현: OpenAI Vision API 사용
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "이 이미지에서 모든 텍스트를 추출해주세요. 한국어와 영어 모두 포함해서 추출해주세요." },
              { type: "image_url", image_url: { url: imageUrl } }
            ],
          },
        ],
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.warn('⚠️ OCR failed, continuing without OCR text:', error);
      return '';
    }
  }

  private async performASR(videoUrl: string): Promise<string> {
    try {
      // Whisper를 사용한 음성 인식
      console.log(`🎥 Performing ASR on: ${videoUrl}`);
      
      // 비디오 다운로드
      const videoFile = await this.downloadVideo(videoUrl);
      
      // OpenAI Whisper API 사용
      const response = await this.openai.audio.transcriptions.create({
        file: videoFile,
        model: "whisper-1",
        language: "ko", // 한국어 우선
        response_format: "text",
        temperature: 0.0, // 일관성을 위해 낮은 온도 설정
      });

      // 임시 파일 정리
      try {
        require('fs').unlinkSync(`/tmp/video_${Date.now()}.mp4`);
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
      }

      return response;
    } catch (error) {
      console.warn('⚠️ ASR failed, continuing without ASR text:', error);
      return '';
    }
  }

  private async downloadVideo(videoUrl: string): Promise<File> {
    try {
      console.log(`📥 Downloading video: ${videoUrl}`);
      
      // 비디오 다운로드
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 임시 파일로 저장
      const tempPath = `/tmp/video_${Date.now()}.mp4`;
      require('fs').writeFileSync(tempPath, buffer);
      
      // File 객체 생성 (OpenAI Whisper API용)
      const file = new File([buffer], 'video.mp4', { type: 'video/mp4' });
      
      return file;
    } catch (error) {
      console.error('❌ Failed to download video:', error);
      throw error;
    }
  }

  private combineTexts(title: string, description: string, ocrText: string, asrText: string): string {
    const texts = [title, description, ocrText, asrText].filter(Boolean);
    return texts.join(' ').trim();
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  private async generateCategoriesAndKeywords(text: string): Promise<{
    categories: string[];
    keywords_ko: string[];
    keywords_en: string[];
    confidence_score: number;
  }> {
    try {
      const prompt = `
다음 텍스트를 분석하여 다음을 제공해주세요:

1. 카테고리 (3-5개, 한국어)
2. 한국어 키워드 (5-10개)
3. 영어 키워드 (5-10개)
4. 분석 신뢰도 (0-1 사이 숫자)

텍스트: "${text}"

JSON 형식으로 응답해주세요:
{
  "categories": ["카테고리1", "카테고리2"],
  "keywords_ko": ["키워드1", "키워드2"],
  "keywords_en": ["keyword1", "keyword2"],
  "confidence_score": 0.85
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // JSON 파싱
      const result = JSON.parse(content);
      
      return {
        categories: result.categories || [],
        keywords_ko: result.keywords_ko || [],
        keywords_en: result.keywords_en || [],
        confidence_score: result.confidence_score || 0.5,
      };
    } catch (error) {
      console.error('❌ Failed to generate categories and keywords:', error);
      // 기본값 반환
      return {
        categories: ['기타'],
        keywords_ko: ['광고'],
        keywords_en: ['advertisement'],
        confidence_score: 0.3,
      };
    }
  }

  private async saveResults(results: AIAnalysisResult[]): Promise<void> {
    try {
      const successfulResults = results.filter(r => r.success && r.enrichment);
      
      if (successfulResults.length === 0) {
        console.log('💤 No successful results to save');
        return;
      }

      const enrichments = successfulResults.map(r => r.enrichment!);
      
      const { error } = await supabaseAdmin
        .from('ad_enrichments')
        .insert(enrichments);

      if (error) {
        throw new Error(`Failed to save enrichments: ${error.message}`);
      }

      console.log(`💾 Saved ${enrichments.length} enrichments to database`);
    } catch (error) {
      console.error('❌ Failed to save results:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 메인 실행 함수
async function main() {
  const worker = new AIWorker();
  
  // Graceful shutdown 처리
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
  });

  await worker.start();
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ AI Worker failed:', error);
    process.exit(1);
  });
}

export { AIWorker };
