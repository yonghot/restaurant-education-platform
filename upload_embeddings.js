const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

// 환경 변수
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY);
console.log('PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT);
console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME);

if (!GEMINI_API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME || !PINECONE_ENVIRONMENT) {
    console.error('필수 환경변수(GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME, PINECONE_ENVIRONMENT)가 누락되었습니다.');
    process.exit(1);
}

// Pinecone 클라이언트 초기화
const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT
});
const index = pinecone.index(PINECONE_INDEX_NAME);

// Gemini 임베딩 생성 함수
async function getEmbedding(text) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent({ content: text });
    return result.embedding.values;
}

// 메인 업로드 함수
async function uploadAllEmbeddings() {
    const dataPath = path.join(__dirname, 'chunks_processed.json');
    if (!fs.existsSync(dataPath)) {
        console.error('chunks_processed.json 파일이 없습니다.');
        process.exit(1);
    }
    const { chunks } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`총 ${chunks.length}개의 청크 임베딩 업로드 시작...`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const embedding = await getEmbedding(chunk.text);
            const upsertRequest = {
                vectors: [
                    {
                        id: chunk.id,
                        values: embedding,
                        metadata: {
                            source: chunk.source,
                            category: chunk.category,
                            length: chunk.length
                        }
                    }
                ]
            };
            await index.upsert(upsertRequest);
            console.log(`[${i + 1}/${chunks.length}] ${chunk.id} 업로드 완료`);
        } catch (err) {
            console.error(`[${i + 1}/${chunks.length}] ${chunk.id} 업로드 실패:`, err.message);
        }
    }
    console.log('✅ 모든 임베딩 업로드 완료!');
}

if (require.main === module) {
    uploadAllEmbeddings().catch(console.error);
} 