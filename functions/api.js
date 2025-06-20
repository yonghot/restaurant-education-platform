const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
// Pinecone 연동을 위한 패키지 (필요시 설치)
// const { Pinecone } = require('@pinecone-database/pinecone');

// Pinecone 설정 (환경변수에서 가져오기)
// const pinecone = new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY,
// });
// const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// 텍스트 파일에서 데이터 자동 로드 함수 (현재 사용하지 않음)
/*
async function loadKnowledgeFromFiles() {
    const knowledgeData = [];
    
    try {
        // 기본 데이터 먼저 로드
        const defaultKnowledge = getDefaultKnowledge();
        knowledgeData.push(...defaultKnowledge);
        
        console.log('기본 데이터 로드 완료:', defaultKnowledge.length, '개');
        
        // public/data 디렉토리 경로 설정
        const dataDir = path.join(__dirname, '..', 'public', 'data');
        console.log('데이터 디렉토리 경로:', dataDir);
        
        // data 디렉토리 존재 확인
        try {
            await fs.access(dataDir);
            console.log('public/data 디렉토리 접근 성공');
        } catch (error) {
            console.log('public/data 디렉토리가 없습니다. 기본 데이터만 사용합니다.');
            return knowledgeData;
        }

        // data 디렉토리의 모든 텍스트 파일 읽기
        const files = await fs.readdir(dataDir);
        console.log('발견된 파일들:', files);
        
        const textFiles = files.filter(file => 
            file.endsWith('.txt') || file.endsWith('.md')
        );

        console.log(`발견된 텍스트 파일: ${textFiles.length}개`);

        for (const file of textFiles) {
            try {
                const filePath = path.join(dataDir, file);
                console.log(`파일 읽기 시도: ${filePath}`);
                
                const content = await fs.readFile(filePath, 'utf8');
                console.log(`파일 ${file} 읽기 성공, 크기: ${content.length}자`);
                
                // 파일 내용을 청크로 분할 (각 청크는 최대 1000자)
                const chunks = splitIntoChunks(content, 1000);
                
                chunks.forEach((chunk, index) => {
                    if (chunk.trim().length > 50) { // 의미있는 내용만 포함
                        knowledgeData.push({
                            id: `${file}_${index}`,
                            text: chunk.trim(),
                            category: getCategoryFromFilename(file),
                            tags: extractTagsFromContent(chunk),
                            source: file
                        });
                    }
                });
                
                console.log(`파일 ${file}에서 ${chunks.length}개 청크 로드됨`);
            } catch (error) {
                console.error(`파일 ${file} 읽기 오류:`, error);
            }
        }
        
        console.log(`총 ${knowledgeData.length}개 지식 항목 로드됨`);
        
        // 로드된 데이터 요약 출력
        const categoryCount = {};
        const sourceCount = {};
        knowledgeData.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            if (item.source) {
                sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
            }
        });
        
        console.log('카테고리별 항목 수:', categoryCount);
        console.log('소스별 항목 수:', sourceCount);
        
        return knowledgeData;
        
    } catch (error) {
        console.error('데이터 로딩 오류:', error);
        // 오류 발생 시에도 기본 데이터는 반환
        return getDefaultKnowledge();
    }
}

// 텍스트를 청크로 분할 (현재 사용하지 않음)
function splitIntoChunks(text, maxLength) {
    const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// 파일명에서 카테고리 추출 (현재 사용하지 않음)
function getCategoryFromFilename(filename) {
    const name = filename.toLowerCase();
    
    if (name.includes('창업') || name.includes('startup')) return '창업';
    if (name.includes('운영') || name.includes('operation')) return '운영';
    if (name.includes('인력') || name.includes('hr') || name.includes('직원')) return '인력';
    if (name.includes('마케팅') || name.includes('marketing')) return '마케팅';
    if (name.includes('재무') || name.includes('finance')) return '재무';
    if (name.includes('위생') || name.includes('hygiene')) return '위생';
    if (name.includes('에너지') || name.includes('energy')) return '에너지';
    if (name.includes('트렌드') || name.includes('trend')) return '트렌드';
    if (name.includes('qa') || name.includes('질문')) return 'Q&A';
    if (name.includes('전자책') || name.includes('ebook')) return '전자책내용';
    
    return '기타';
}

// 내용에서 태그 추출 (현재 사용하지 않음)
function extractTagsFromContent(content) {
    const commonTags = [
        '마라탕', '중국음식', // 마라탕 관련 태그를 우선순위로
        '창업', '위치', '메뉴', '원가', '가격', '인력', '직원', '교육',
        '마케팅', 'SNS', '배달', '트렌드', '재무', '투자', '수익',
        '위생', '안전', 'HACCP', '에너지', '비용', '인덕션',
        '칼국수', '외식업', '음식점', '운영', '관리'
    ];
    
    return commonTags.filter(tag => content.includes(tag));
}

// 기본 지식 데이터 (현재 사용하지 않음)
function getDefaultKnowledge() {
    return [
        {
            id: '1',
            text: '외식업 창업 시 가장 중요한 것은 위치 선정입니다. 유동인구, 경쟁업체 분석, 접근성을 종합적으로 고려해야 합니다. 특히 주차 공간과 대중교통 접근성이 매출에 직접적인 영향을 미칩니다.',
            category: '창업',
            tags: ['위치', '창업', '분석']
        },
        {
            id: '2',
            text: '메뉴 원가율은 일반적으로 30-40%를 유지하는 것이 적정합니다. 식재료 비용, 인건비, 임대료, 공과금을 고려한 가격 설정이 중요하며, 정기적인 원가 분석이 필요합니다.',
            category: '운영',
            tags: ['원가', '메뉴', '가격']
        },
        {
            id: '3',
            text: '외식업 인력 관리의 핵심은 체계적인 교육과 적절한 보상 체계입니다. 신입 직원 교육 프로그램, 업무 매뉴얼, 성과 기반 인센티브 시스템을 구축하는 것이 중요합니다.',
            category: '인력',
            tags: ['인력', '교육', '관리']
        },
        {
            id: '4',
            text: '최신 외식업 트렌드는 배달 서비스 확대, 건강식 메뉴 인기, 디지털 주문 시스템 도입입니다. 특히 MZ세대를 타겟으로 하는 브랜드는 온라인 마케팅과 디지털 전환이 필수입니다.',
            category: '트렌드',
            tags: ['트렌드', '배달', '디지털']
        },
        {
            id: '5',
            text: '외식업 재무 관리는 초기 투자비, 운영비, 수익성 분석이 핵심입니다. 월별 손익계산서 작성, 현금흐름 관리, 세무 신고 준비를 체계적으로 해야 합니다.',
            category: '재무',
            tags: ['재무', '투자', '수익성']
        },
        {
            id: '6',
            text: '식품위생 관리의 핵심은 HACCP 시스템 도입과 정기적인 위생 교육입니다. 식재료 보관, 조리 과정, 위생 관리 체크리스트를 구축하고 직원 교육을 정기적으로 실시해야 합니다.',
            category: '위생',
            tags: ['위생', 'HACCP', '안전']
        },
        {
            id: '7',
            text: '외식업 마케팅은 온라인과 오프라인을 병행하는 것이 효과적입니다. SNS 마케팅, 배달 플랫폼 활용, 지역 커뮤니티 참여, 고객 리뷰 관리가 중요합니다.',
            category: '마케팅',
            tags: ['마케팅', 'SNS', '고객관리']
        },
        {
            id: '8',
            text: '칼국수 전문점의 에너지 비용은 일반적으로 월 50-100만원 정도입니다. 인덕션 사용 시 가스비 대비 30-40% 절약 효과가 있으며, 초기 설치비는 200-500만원 정도입니다.',
            category: '에너지',
            tags: ['에너지', '비용', '인덕션', '칼국수']
        },
        {
            id: '9',
            text: '마라탕집 창업 시 초기 투자비는 3,000-5,000만원 정도이며, 월 매출 목표는 1,500-3,000만원입니다. 신선한 재료 공급망 확보, 매운맛 단계별 조절 시스템, 배달 서비스 연동이 성공의 핵심입니다. 특히 젊은 층을 타겟으로 하는 경우 SNS 마케팅과 포장 서비스가 필수적입니다.',
            category: '창업',
            tags: ['마라탕', '창업', '투자', '매출', '재료', '배달']
        },
        {
            id: '10',
            text: '마라탕 메뉴 구성은 기본 국물과 다양한 재료 선택이 핵심입니다. 고기류, 해산물, 채소류를 균형있게 구성하고, 매운맛 5단계 조절 시스템을 구축하세요. 원가율은 35-45%를 유지하며, 포장 서비스와 배달 연동으로 매출을 증대시킬 수 있습니다.',
            category: '운영',
            tags: ['마라탕', '메뉴', '원가', '포장', '배달']
        }
    ];
}
*/

// 동적 지식 데이터 로드 (현재 사용하지 않음)
/*
let restaurantKnowledge = [];
*/

// 초기 데이터 로드 (현재 사용하지 않음)
/*
async function initializeKnowledge() {
    restaurantKnowledge = await loadKnowledgeFromFiles();
    console.log('지식 데이터 초기화 완료');
}

// 서버 시작 시 데이터 로드
initializeKnowledge().catch(console.error);
*/

// 키워드 추출 함수 (현재 사용하지 않음)
/*
function extractKeywords(text) {
    const keywords = [
        '마라탕', '중국음식', // 마라탕 관련 키워드를 우선순위로
        '창업', '위치', '메뉴', '원가', '가격', '인력', '직원', '교육',
        '마케팅', 'SNS', '배달', '트렌드', '재무', '투자', '수익',
        '위생', '안전', 'HACCP', '에너지', '비용', '인덕션',
        '칼국수', '외식업', '음식점', '운영', '관리'
    ];
    
    const extracted = keywords.filter(keyword => text.includes(keyword));
    console.log('키워드 추출 결과:', extracted);
    return extracted;
}
*/

// 관련 지식 검색 함수 (현재 사용하지 않음)
/*
function searchRelevantKnowledge(keywords, knowledge) {
    try {
        // 키워드가 없으면 기본 지식 반환
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            console.log('키워드가 없어 기본 지식 반환');
            return knowledge[0] ? knowledge[0].text : '외식업에 대한 기본 정보입니다.';
        }
        
        console.log('검색할 키워드:', keywords);
        console.log('지식 데이터 개수:', knowledge.length);
        
        const relevantDocs = knowledge.filter(doc => 
            keywords.some(keyword => 
                doc.text.includes(keyword) || 
                (doc.tags && doc.tags.includes(keyword)) ||
                (doc.category && doc.category.includes(keyword))
            )
        );
        
        console.log('관련 문서 개수:', relevantDocs.length);
        
        // 관련도 순으로 정렬 (키워드 매칭 개수 기준)
        relevantDocs.sort((a, b) => {
            const aScore = keywords.filter(k => 
                a.text.includes(k) || (a.tags && a.tags.includes(k)) || (a.category && a.category.includes(k))
            ).length;
            const bScore = keywords.filter(k => 
                b.text.includes(k) || (b.tags && b.tags.includes(k)) || (b.category && b.category.includes(k))
            ).length;
            return bScore - aScore;
        });
        
        const result = relevantDocs.slice(0, 3).map(doc => doc.text).join('\n\n');
        console.log('관련 지식 검색 결과 길이:', result.length);
        return result;
        
    } catch (error) {
        console.error('지식 검색 오류:', error);
        return knowledge[0] ? knowledge[0].text : '외식업에 대한 기본 정보입니다.';
    }
}
*/

// 기본 응답 함수
function getDefaultResponse(userMessage) {
    const responses = {
        '창업': '외식업 창업을 고려하고 계시는군요! 먼저 시장 조사부터 시작하는 것이 좋습니다. 유동인구, 경쟁업체, 타겟 고객층을 분석해보세요. 초기 투자비용과 운영비용도 꼼꼼히 계산해보시기 바랍니다.',
        '비용': '외식업 비용은 크게 초기 투자비와 운영비로 나뉩니다. 초기 투자비에는 임대보증금, 인테리어, 설비 구매비가 포함되고, 운영비에는 임대료, 인건비, 재료비, 공과금이 있습니다.',
        '메뉴': '메뉴 구성은 원가 계산이 핵심입니다. 식재료 원가율을 30-40%로 유지하고, 인건비와 운영비를 고려한 적정 가격을 설정하세요. 시즌별 메뉴 변경도 고려해보세요.',
        '마케팅': '외식업 마케팅은 온라인과 오프라인을 병행하는 것이 효과적입니다. SNS 마케팅, 배달 플랫폼 활용, 지역 커뮤니티 참여 등을 통해 브랜드 인지도를 높여보세요.',
        '인력': '직원 채용 시에는 업무 경험과 인성을 모두 고려하세요. 체계적인 교육 프로그램을 마련하고, 적절한 보상 체계를 구축하여 이직률을 낮추는 것이 중요합니다.',
        '에너지': '에너지 비용 절약을 위해서는 인덕션 도입을 고려해보세요. 가스비 대비 30-40% 절약 효과가 있으며, 초기 설치비는 200-500만원 정도입니다.',
        '위생': '식품위생 관리는 HACCP 시스템 도입과 정기적인 위생 교육이 핵심입니다. 식재료 보관, 조리 과정, 위생 관리 체크리스트를 구축하세요.',
        '칼국수': '칼국수 전문점 운영 시에는 메뉴 다양화와 계절별 메뉴 개발이 중요합니다. 또한 배달 서비스와 포장 서비스를 적극 활용하여 매출을 증대시킬 수 있습니다.',
        '위치': '위치 선정은 외식업 성공의 핵심입니다. 유동인구, 경쟁업체, 접근성, 주차 공간을 종합적으로 분석하여 최적의 위치를 선택하세요.',
        '원가': '원가 관리는 수익성 향상의 핵심입니다. 식재료 원가율을 30-40%로 유지하고, 정기적인 원가 분석을 통해 가격 경쟁력을 확보하세요.',
        '마라탕': '마라탕집 창업의 핵심은 신선한 재료 공급망 확보와 매운맛 조절 시스템입니다. 초기 투자비는 3,000-5,000만원 정도이며, 월 매출 1,500-3,000만원을 목표로 할 수 있습니다. 특히 젊은 층을 타겟으로 하는 경우 SNS 마케팅과 배달 서비스 연동이 필수적입니다. 매운맛 단계별 옵션 제공과 다양한 재료 선택으로 고객 만족도를 높이세요.',
        '중국음식': '중국음식점 운영의 핵심은 원재료의 신선도와 조리법의 일관성입니다. 마라탕, 탕수육, 짜장면 등 인기 메뉴의 표준화된 레시피를 구축하고, 정기적인 직원 교육을 통해 품질을 유지해야 합니다. 또한 한국인의 입맛에 맞는 현지화도 고려해야 합니다.'
    };
    
    // 키워드 매칭 우선순위 설정
    const priorityKeywords = ['마라탕', '중국음식', '창업', '비용', '메뉴', '마케팅'];
    
    for (const keyword of priorityKeywords) {
        if (userMessage.includes(keyword)) {
            return responses[keyword];
        }
    }
    
    // 일반 키워드 매칭
    for (const [keyword, response] of Object.entries(responses)) {
        if (userMessage.includes(keyword)) {
            return response;
        }
    }
    
    return '외식업에 대한 구체적인 질문을 해주시면 더 자세한 답변을 드릴 수 있습니다. 창업, 비용, 메뉴, 마케팅, 인력 관리, 에너지 비용 등 궁금한 부분이 있으시면 언제든 물어보세요!';
}

// 챗봇 응답 생성 함수
async function generateChatbotResponse(userMessage) {
    try {
        console.log('Gemini API 호출 시작');
        console.log('사용자 메시지:', userMessage);
        
        // Gemini API 호출
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // 더 빠른 응답을 위해 flash 모델 사용
            generationConfig: {
                maxOutputTokens: 500, // 토큰 수 제한으로 응답 속도 향상
                temperature: 0.7
            }
        });
        
        // 간단하고 명확한 프롬프트
        const prompt = `당신은 외식업 전문가입니다. 다음 질문에 대해 실용적이고 도움이 되는 답변을 한국어로 200-300자 내외로 해주세요.

질문: "${userMessage}"

답변:`;

        console.log('Gemini API 프롬프트 전송');
        
        // 타임아웃 설정 (8초)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('API 호출 타임아웃')), 8000);
        });
        
        const apiPromise = model.generateContent(prompt);
        
        const result = await Promise.race([apiPromise, timeoutPromise]);
        const response = await result.response;
        const responseText = response.text();
        
        console.log('Gemini API 응답 받음, 길이:', responseText.length);
        return responseText;
        
    } catch (error) {
        console.error('챗봇 응답 생성 오류:', error);
        
        // 타임아웃 오류인 경우 기본 응답으로 대체
        if (error.message.includes('타임아웃')) {
            console.log('타임아웃 발생, 기본 응답으로 대체');
            return getDefaultResponse(userMessage);
        }
        
        return "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
}

// Netlify Function 핸들러
exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/.netlify/functions/api', '');
        console.log('요청된 경로:', path);
        console.log('HTTP 메서드:', event.httpMethod);
        console.log('원본 경로:', event.path);
        console.log('요청 본문:', event.body);
        
        // 챗봇 API - 직접 경로 매칭
        if ((path === '/chatbot/chat' || path === '/api/chatbot/chat') && event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { message } = body;
            
            console.log('요청 본문:', body);
            console.log('추출된 메시지:', message);
            
            if (!message) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: '메시지가 필요합니다.' })
                };
            }

            // Gemini API로 응답 생성 (API 키가 있는 경우)
            let response;
            console.log('Gemini API 키 확인:', !!process.env.GEMINI_API_KEY);
            console.log('Gemini API 키 길이:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
            
            if (process.env.GEMINI_API_KEY) {
                console.log('Gemini API 호출 시도');
                response = await generateChatbotResponse(message);
            } else {
                console.log('기본 응답 사용');
                response = getDefaultResponse(message);
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    response,
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // API 상태 확인 엔드포인트 - 직접 경로 매칭
        if (path === '/api/status' && event.httpMethod === 'GET') {
            const status = {
                gemini: {
                    available: !!process.env.GEMINI_API_KEY,
                    keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
                },
                pinecone: {
                    available: !!(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME),
                    apiKeyLength: process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY.length : 0,
                    indexName: process.env.PINECONE_INDEX_NAME || 'not_set'
                },
                timestamp: new Date().toISOString()
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status: status
                })
            };
        }
        
        // 현재 로드된 데이터 정보 조회 엔드포인트 (현재 사용하지 않음)
        /*
        if (path === '/api/data-info' && event.httpMethod === 'GET') {
            const categoryCount = {};
            const sourceCount = {};
            
            restaurantKnowledge.forEach(item => {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
                if (item.source) {
                    sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
                }
            });
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    totalItems: restaurantKnowledge.length,
                    categories: categoryCount,
                    sources: sourceCount,
                    lastUpdated: new Date().toISOString()
                })
            };
        }
        */

        // Gemini API 테스트 엔드포인트
        if (path === '/api/test-gemini' && event.httpMethod === 'POST') {
            try {
                if (!process.env.GEMINI_API_KEY) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'GEMINI_API_KEY가 설정되지 않았습니다.'
                        })
                    };
                }

                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                
                const result = await model.generateContent('안녕하세요. 간단한 테스트입니다.');
                const response = await result.response;
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Gemini API 연결 성공',
                        response: response.text()
                    })
                };
            } catch (error) {
                console.error('Gemini API 테스트 오류:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Gemini API 테스트 실패',
                        details: error.message
                    })
                };
            }
        }

        // 404 에러
        console.log('매칭되는 엔드포인트가 없음');
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'API 엔드포인트를 찾을 수 없습니다.' })
        };

    } catch (error) {
        console.error('Function 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: '서버 오류가 발생했습니다.',
                response: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            })
        };
    }
}; 