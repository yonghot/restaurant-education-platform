const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");
// Pinecone 연동을 위한 패키지 (필요시 설치)
// const { Pinecone } = require('@pinecone-database/pinecone');

// Pinecone 설정 (환경변수에서 가져오기)
// const pinecone = new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY,
// });
// const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

// 텍스트 파일에서 데이터 자동 로드 함수
async function loadKnowledgeFromFiles() {
    const knowledgeData = [];
    
    try {
        // Netlify Functions 환경에서 올바른 경로 설정
        let dataDir;
        if (process.env.NETLIFY_DEV) {
            // 로컬 개발 환경
            dataDir = path.join(__dirname, '..', 'public', 'data');
        } else {
            // Netlify Functions 환경
            dataDir = path.join(process.cwd(), 'public', 'data');
        }
        
        console.log('데이터 디렉토리 경로:', dataDir);
        console.log('현재 작업 디렉토리:', process.cwd());
        console.log('__dirname:', __dirname);
        
        // data 디렉토리 존재 확인
        try {
            await fs.access(dataDir);
            console.log('public/data 디렉토리 접근 성공');
        } catch (error) {
            console.log('public/data 디렉토리가 없습니다. 다른 경로 시도...');
            
            // 대체 경로 시도
            const altDataDir = path.join(process.cwd(), '..', 'public', 'data');
            console.log('대체 경로 시도:', altDataDir);
            
            try {
                await fs.access(altDataDir);
                console.log('대체 경로 접근 성공');
                dataDir = altDataDir;
            } catch (altError) {
                console.log('대체 경로도 실패. 기본 데이터만 사용합니다.');
                return knowledgeData;
            }
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
                
                // 파일 내용을 청크로 분할 (각 청크는 최대 2000자)
                const chunks = splitIntoChunks(content, 2000);
                
                chunks.forEach((chunk, index) => {
                    if (chunk.trim().length > 100) { // 의미있는 내용만 포함
                        knowledgeData.push({
                            id: `${file}_${index}`,
                            text: chunk.trim(),
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
        return knowledgeData;
        
    } catch (error) {
        console.error('데이터 로딩 오류:', error);
        return [];
    }
}

// 텍스트를 청크로 분할
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

// 키워드 추출 함수
function extractKeywords(text) {
    const keywords = [
        '마라탕', '중국음식', '창업', '위치', '메뉴', '원가', '가격', '인력', '직원', '교육',
        '마케팅', 'SNS', '배달', '트렌드', '재무', '투자', '수익', '위생', '안전', 'HACCP', 
        '에너지', '비용', '인덕션', '칼국수', '외식업', '음식점', '운영', '관리', '상권',
        '매출', '적자', '손익', '프랜차이즈', '직영', '대출', '투자', '실패', '성공'
    ];
    
    const extracted = keywords.filter(keyword => text.includes(keyword));
    console.log('키워드 추출 결과:', extracted);
    return extracted;
}

// 관련 지식 검색 함수
function searchRelevantKnowledge(keywords, knowledge) {
    try {
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            console.log('키워드가 없어 전체 지식 반환');
            return knowledge.slice(0, 3).map(doc => doc.text).join('\n\n');
        }
        
        console.log('검색할 키워드:', keywords);
        console.log('지식 데이터 개수:', knowledge.length);
        
        const relevantDocs = knowledge.filter(doc => 
            keywords.some(keyword => doc.text.includes(keyword))
        );
        
        console.log('관련 문서 개수:', relevantDocs.length);
        
        // 관련도 순으로 정렬 (키워드 매칭 개수 기준)
        relevantDocs.sort((a, b) => {
            const aScore = keywords.filter(k => a.text.includes(k)).length;
            const bScore = keywords.filter(k => b.text.includes(k)).length;
            return bScore - aScore;
        });
        
        const result = relevantDocs.slice(0, 3).map(doc => doc.text).join('\n\n');
        console.log('관련 지식 검색 결과 길이:', result.length);
        return result;
        
    } catch (error) {
        console.error('지식 검색 오류:', error);
        return knowledge.slice(0, 2).map(doc => doc.text).join('\n\n');
    }
}

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

// 동적 지식 데이터 로드
let restaurantKnowledge = [];

// 초기 데이터 로드
async function initializeKnowledge() {
    restaurantKnowledge = await loadKnowledgeFromFiles();
    console.log('지식 데이터 초기화 완료');
}

// 서버 시작 시 데이터 로드
initializeKnowledge().catch(console.error);

// 챗봇 응답 생성 함수
async function generateChatbotResponse(userMessage) {
    try {
        console.log('Gemini API 호출 시작');
        console.log('사용자 메시지:', userMessage);
        console.log('현재 로드된 지식 데이터 개수:', restaurantKnowledge.length);
        
        // 관련 지식 검색
        const keywords = extractKeywords(userMessage);
        const relevantKnowledge = searchRelevantKnowledge(keywords, restaurantKnowledge);
        
        console.log('관련 지식 길이:', relevantKnowledge.length);
        console.log('관련 지식 미리보기:', relevantKnowledge.substring(0, 200) + '...');
        
        // Gemini API 호출
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // 더 빠른 응답을 위해 flash 모델 사용
            generationConfig: {
                maxOutputTokens: 800, // 토큰 수 증가 (더 상세한 답변)
                temperature: 0.7
            }
        });
        
        // 데이터 파일 내용을 포함한 프롬프트
        const prompt = `당신은 외식업 전문가입니다. 다음 참고 자료를 바탕으로 사용자의 질문에 대해 실용적이고 구체적인 답변을 한국어로 300-500자 내외로 해주세요.

참고 자료:
${relevantKnowledge}

사용자 질문: "${userMessage}"

답변 요구사항:
- 참고 자료의 내용을 바탕으로 구체적이고 실용적인 조언 제공
- 필요시 구체적인 수치나 사례 포함
- 친근하고 도움이 되는 톤 유지
- 외식업 창업자나 운영자가 실무에서 활용할 수 있는 내용으로 구성

답변:`;

        console.log('Gemini API 프롬프트 전송');
        console.log('프롬프트 길이:', prompt.length);
        
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
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const path = event.path.replace("/.netlify/functions/api", "");
    console.log("요청된 경로:", path);
    console.log("HTTP 메서드:", event.httpMethod);
    console.log("원본 경로:", event.path);
    console.log("요청 본문:", event.body);

    // 챗봇 API - 직접 경로 매칭
    if (
      (path === "/chatbot/chat" || path === "/api/chatbot/chat") &&
      event.httpMethod === "POST"
    ) {
      const body = JSON.parse(event.body);
      const { message } = body;

      console.log("요청 본문:", body);
      console.log("추출된 메시지:", message);

      if (!message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "메시지가 필요합니다." }),
        };
      }

      // 관련 지식 검색
      const keywords = extractKeywords(message);
      const relevantKnowledge = searchRelevantKnowledge(keywords, restaurantKnowledge);
      
      // Gemini API로 응답 생성 (API 키가 있는 경우)
      let response;
      console.log("Gemini API 키 확인:", !!process.env.GEMINI_API_KEY);
      console.log(
        "Gemini API 키 길이:",
        process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      );

      if (process.env.GEMINI_API_KEY) {
        console.log("Gemini API 호출 시도");
        response = await generateChatbotResponse(message);
      } else {
        console.log("기본 응답 사용");
        response = getDefaultResponse(message);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response,
          knowledge: relevantKnowledge,
          keywords: keywords,
          timestamp: new Date().toISOString()
        }),
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
            data: {
                loadedItems: restaurantKnowledge.length,
                lastUpdated: new Date().toISOString()
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

    // 데이터 새로고침 엔드포인트
    if (path === '/api/refresh-data' && event.httpMethod === 'POST') {
        console.log('데이터 새로고침 요청 받음');
        
        try {
            // 데이터 재로드
            restaurantKnowledge = await loadKnowledgeFromFiles();
            
            console.log(`데이터 새로고침 성공: ${restaurantKnowledge.length}개 항목`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: '데이터가 성공적으로 새로고침되었습니다.',
                    dataCount: restaurantKnowledge.length,
                    timestamp: new Date().toISOString()
                })
            };
        } catch (error) {
            console.error('데이터 새로고침 중 오류:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: '데이터 새로고침 중 오류가 발생했습니다.',
                    error: error.message,
                    timestamp: new Date().toISOString()
                })
            };
        }
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
    if (path === "/api/test-gemini" && event.httpMethod === "POST") {
      try {
        if (!process.env.GEMINI_API_KEY) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "GEMINI_API_KEY가 설정되지 않았습니다.",
            }),
          };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result =
          await model.generateContent("안녕하세요. 간단한 테스트입니다.");
        const response = await result.response;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Gemini API 연결 성공",
            response: response.text(),
          }),
        };
      } catch (error) {
        console.error("Gemini API 테스트 오류:", error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Gemini API 테스트 실패",
            details: error.message,
          }),
        };
      }
    }

    // 404 에러
    console.log("매칭되는 엔드포인트가 없음");
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "API 엔드포인트를 찾을 수 없습니다." }),
    };
  } catch (error) {
    console.error("Function 오류:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "서버 오류가 발생했습니다.",
        response:
          "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      }),
    };
  }
};
