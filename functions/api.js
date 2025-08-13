const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");

// Pinecone 관련 환경변수 체크
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

// Pinecone 사용 가능 여부 체크
const USE_PINECONE = !!(PINECONE_API_KEY && PINECONE_ENVIRONMENT && PINECONE_INDEX_NAME);

let pinecone, index;
if (USE_PINECONE) {
    try {
        const { Pinecone } = require("@pinecone-database/pinecone");
        pinecone = new Pinecone({
            apiKey: PINECONE_API_KEY,
            environment: PINECONE_ENVIRONMENT
        });
        index = pinecone.index(PINECONE_INDEX_NAME);
        console.log('Pinecone 초기화 성공');
        console.log('Pinecone 환경:', PINECONE_ENVIRONMENT);
        console.log('Pinecone 인덱스:', PINECONE_INDEX_NAME);
    } catch (error) {
        console.error('Pinecone 초기화 실패:', error.message);
        console.error('Pinecone 초기화 오류 상세:', error);
    }
} else {
    console.log('Pinecone 환경변수 없음, 키워드 기반 검색 사용');
    console.log('PINECONE_API_KEY:', !!PINECONE_API_KEY);
    console.log('PINECONE_ENVIRONMENT:', PINECONE_ENVIRONMENT);
    console.log('PINECONE_INDEX_NAME:', PINECONE_INDEX_NAME);
}

// 기존 임베디드 지식 데이터 (fallback용)
const embeddedKnowledge = [
    {
        id: "qa_1",
        text: "어떤 상권, 어떤 메뉴든 성수기 비수기는 있음. 그건 계절일수도 있고, 대학가 앞이면 방학일거임. 대학교 앞에서 대학생한테 장사하는데 방학때 손님이 없는건 너무 당연한거임. 메인 타겟이 줄었다면 타겟을 바꾸거나 확장해야만 함. 근처에 주거단지가 있다면 안하던 배달을 하든가, 사무실이 많다면 회사원 타겟의 마케팅을 하든가. 평소 하던 마케팅을 그냥 추가적으로 더 하는건 메인 타겟이 없는 상황에선 무의미한 일임.",
        source: "요알남 무물보 Q&A"
    },
    {
        id: "qa_2", 
        text: "프차의 핵심은 장사가 잘 되느냐 마냐는 당연한거고, 그보다 시스템을 얼마나 쉽게 짜서 비전문가도 금방 배워서 창업할수 있게 하느냐임. 현재 운영중인 매장의 시스템이 진짜로 비전문가가 배우기에도 충분히 쉽게 짜여져 있다면 프차 '전환' 이라는게 말이 되지만, 셰프나 소믈리에 같은 전문 인력이 필요한 컨셉과 메뉴라면 '전환'이 아니라 프차를 위한 새로운 브랜드를 만들어야함.",
        source: "요알남 무물보 Q&A"
    },
    {
        id: "qa_3",
        text: "배달 매장은 뭐 여러 디테일한 방법들이 있다면 있긴 하지만, 사실 큰 틀에서는 할 수 있는게 많지 않음. 동일 지역 동일 메뉴의 상위권 배달매장과 비교해서 맛, 양, 구성, 플레이팅, 가격, 서비스 등이 큰 차이가 나지 않게 세팅한 '다음' 배달 앱 내에서 유료 마케팅 실행. 그런데 이걸 반복하고 개선하면서 1등 매장이 되었다고 해도 영원하지 않고, 인근 상권의 규모 자체가 충분히 크지 않다면 1등이어도 매출이 충분치 않을 수 있음.",
        source: "요알남 무물보 Q&A"
    },
    {
        id: "qa_4",
        text: "특정 타겟에만 의존하는 작고 좁은 폐쇄적 상권에서는 어떤 이유든 메인 타겟이 줄어들면 사실상 뾰족한 수가 없음. 그러니 진입하기 전부터 그러한 상황을 충분히 예상, 대비, 각오 해야함. 홍대, 연대, 건대앞처럼 대학가이면서도 핫플이라면 다행이고, 핫플까진 아니더라도 주변에 아파트 단지나 오피스 단지가 충분치는 않아도 있긴 있다면 이제는 학생이 아닌 다른 타겟을 봐야함.",
        source: "요알남 무물보 Q&A"
    },
    {
        id: "ebook_1",
        text: "외식업을 시작하려는 많은 사람들이 간과하는 것이 있다. 외식업도 '사업'이라는 것. 우리 모두는 사업에 대한 경험이 사실상 전무하다. 직장 생활로 겪는 간접경험 따위는 실제로 본인이 직접 자본과 사람을 끌어오고 법인을 설립하고 사업체를 구성하여 수많은 문제를 맞닥뜨리며 끊임없이 개선해 나가는 일련의 과정들을 직접 겪는 것에 비하면 아예 무의미한 수준이다.",
        source: "전자책 내용"
    },
    {
        id: "ebook_2",
        text: "외식업이 다른 사업에 비해 힘든 이유: 1. 초기 투자 비용이 적지 않다는 점, 2. 몸이 고된 현장직이라는 점, 3. 생산성 있게 음식을 지속적으로 생산해야 하는 제조업인 동시에, 4. 수많은 고객의 니즈와 비위를 맞춰야 하는 서비스업이기도 하다는 점. 위와 같은 이유가 그러한 말을 듣는 주된 이유일 것으로 지목될 수는 있겠으나, 사실, 어떤 종류의 사업이든 관련 경험이 전무한 우리들에게는 충분히 어렵다.",
        source: "전자책 내용"
    }
];

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

// 키워드 추출 함수 (fallback용)
function extractKeywords(text) {
    const keywords = [
        '창업', '위치', '메뉴', '원가', '가격', '인력', '직원', '교육',
        '마케팅', 'SNS', '배달', '트렌드', '재무', '투자', '수익', '위생', '안전', 'HACCP', 
        '에너지', '비용', '인덕션', '칼국수', '외식업', '음식점', '운영', '관리', '상권',
        '매출', '적자', '손익', '프랜차이즈', '직영', '대출', '투자', '실패', '성공'
    ];
    
    const extracted = keywords.filter(keyword => text.includes(keyword));
    console.log('키워드 추출 결과:', extracted);
    return extracted;
}

// 관련 지식 검색 함수 (fallback용)
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
        '창업': '외식업 창업하려면 일단 시장 조사부터 해야 함. 유동인구, 경쟁업체, 타겟 고객층 분석이 기본이고, 초기 투자비용과 운영비용도 꼼꼼히 계산해봐야 함. 그냥 "열심히 하면 되겠지" 하는 마음으로 시작하면 어려울 수 있어. 내가 생각하기에는 상권 분석부터 제대로 하고, 원가율 관리할 수 있는 메뉴 구성부터 확실히 잡고 시작하는 게 좋음.',
        '비용': '외식업 비용은 크게 초기 투자비와 운영비로 나뉨. 초기에는 임대보증금, 인테리어, 설비 구매비가 들어가고, 운영비에는 임대료, 인건비, 재료비, 공과금이 있음. 원가율 30-40% 유지하는 게 기본임. 내가 추천하는 방향은 마케팅 비용을 매출의 1-3%로 유지하고, 정기적인 원가 분석으로 수익성을 관리하는 거임.',
        '메뉴': '메뉴 구성할 때는 원가 계산이 핵심임. 식재료 원가율 30-40% 유지하고, 인건비와 운영비 고려해서 적정 가격 설정해야 함. 시즌별 메뉴 변경도 고려해보고. 그냥 맛있으면 된다는 생각보다는 체계적으로 접근하는 게 좋음. 내가 생각하기에는 원가 관리가 안 되는 메뉴는 아예 제거하고, 수익성 있는 메뉴에 집중하는 게 좋음.',
        '마케팅': '외식업 마케팅은 온라인과 오프라인 병행하는 게 효과적임. SNS 마케팅, 배달 플랫폼 활용, 지역 커뮤니티 참여 등으로 브랜드 인지도 높여야 함. 하지만 마케팅만으로는 한계가 있고, 기본기가 탄탄해야 함. 내가 추천하는 방향은 마케팅 비용을 매출의 1-3%로 유지하고, ROI를 정기적으로 체크해서 효율적인 채널에 집중하는 거임.',
        '인력': '직원 채용할 때는 업무 경험과 인성 모두 봐야 함. 체계적인 교육 프로그램 마련하고, 적절한 보상 체계 구축해서 이직률 낮춰야 함. 좋은 직원은 정말 소중하니까 잘 대우하는 게 중요함. 내가 생각하기에는 직원 교육에 투자하고, 이직률 낮추는 게 매장 운영의 핵심이라고 생각함.',
        '에너지': '에너지 비용 절약하려면 인덕션 도입 고려해봐야 함. 가스비 대비 30-40% 절약 효과 있고, 초기 설치비는 200-500만원 정도임. 하지만 전기세 인상도 고려해서 계산해봐야 함. 내가 추천하는 방향은 장기적으로 봤을 때 인덕션 도입이 수익성에 도움이 될 거임.',
        '위생': '식품위생 관리는 HACCP 시스템 도입하고 정기적인 위생 교육 해야 함. 식재료 보관, 조리 과정, 위생 관리 체크리스트 구축하는 게 기본임. 위생 문제 생기면 매장에 큰 타격이 올 수 있음. 내가 생각하기에는 위생 관리에 투자하는 게 가장 중요한 투자라고 생각함.',
        '칼국수': '칼국수 전문점 운영할 때는 메뉴 다양화와 계절별 메뉴 개발이 중요함. 배달 서비스와 포장 서비스 적극 활용해서 매출 증대시켜야 함. 하지만 기본 맛이 안 되면 다른 것들도 소용없음. 내가 추천하는 방향은 기본 맛을 확실히 잡고, 그 다음에 마케팅과 서비스 확장을 하는 거임.',
        '위치': '위치 선정이 외식업 성공의 핵심임. 유동인구, 경쟁업체, 접근성, 주차 공간 종합적으로 분석해서 최적의 위치 선택해야 함. 위치 잘못 잡으면 나중에 정말 어려워질 수 있음. 내가 생각하기에는 위치 선정에 가장 많은 시간을 투자하는 게 좋음. 상권이 전부라고 생각함.',
        '원가': '원가 관리는 수익성 향상의 핵심임. 식재료 원가율 30-40% 유지하고, 정기적인 원가 분석해서 가격 경쟁력 확보해야 함. 원가 관리 못 하면 수익 내기 어려워질 수 있음. 내가 추천하는 방향은 매일매일 원가를 체크하고, 가격 변동에 민감하게 대응하는 거임.',
        '마라탕': '마라탕집 창업의 핵심은 신선한 재료 공급망 확보와 매운맛 조절 시스템임. 초기 투자비 3,000-5,000만원 정도이고, 월 매출 1,500-3,000만원 목표로 할 수 있음. 젊은 층 타겟이면 SNS 마케팅과 배달 서비스 연동 필수임. 내가 생각하기에는 원가율 30-40% 유지하면서 매운맛 단계별 옵션 제공하는 시스템을 구축하는 게 좋음.',
        '중국음식': '중국음식점 운영의 핵심은 원재료 신선도와 조리법 일관성임. 마라탕, 탕수육, 짜장면 등 인기 메뉴 표준화된 레시피 구축하고, 정기적인 직원 교육으로 품질 유지해야 함. 한국인 입맛에 맞는 현지화도 고려해야 하고. 내가 추천하는 방향은 원가율 30-40% 유지하면서 한국인 입맛에 맞게 현지화하는 거임.'
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
    
    // 더 유연한 기본 응답
    const generalResponses = [
        '외식업에 대한 구체적인 질문을 해주시면 더 자세한 답변을 드릴 수 있음. 창업, 비용, 메뉴, 마케팅, 인력 관리, 에너지 비용 등 궁금한 부분이 있으시면 언제든 물어보세요. 내가 생각하기에는 구체적인 질문을 해주는 게 가장 도움이 된다고 생각함.',
        '외식업 관련해서 궁금한 게 있으면 편하게 물어보세요. 창업 준비부터 운영까지 다양한 부분에 대해 조언해드릴 수 있음. 내가 생각하기에는 실제 경험을 바탕으로 한 조언이 가장 도움이 될 거야.',
        '외식업에 대해 궁금한 점이 있으시면 언제든 물어보세요. 창업, 운영, 마케팅 등 어떤 부분이든 도움을 드릴 수 있음. 내가 생각하기에는 구체적인 상황을 알려주시면 더 정확한 조언을 드릴 수 있을 거야.'
    ];
    
    // 랜덤하게 응답 선택
    const randomIndex = Math.floor(Math.random() * generalResponses.length);
    return generalResponses[randomIndex];
}

// Gemini 임베딩 생성 함수
async function getEmbedding(text) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API 키가 없습니다.');
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// searchRelevantChunks 함수는 Pinecone 분기 없이 키워드 기반 검색만 남기고 정리
async function searchRelevantChunks(query, topK = 8) {
    // Pinecone 분기 제거, 키워드 기반 검색만 사용
    const keywords = extractKeywords(query);
    return searchRelevantKnowledge(keywords, embeddedKnowledge);
}

// Gemini 답변 생성
async function generateChatbotResponse(userMessage) {
    try {
        console.log('챗봇 응답 생성 시작');
        console.log('Pinecone 사용 여부:', USE_PINECONE);
        
        // 1. 의미 기반 검색 (Pinecone 또는 fallback) - 더 많은 컨텍스트
        const relevantKnowledge = await searchRelevantChunks(userMessage, 12);
        
        console.log('관련 지식 길이:', relevantKnowledge.length);
        console.log('관련 지식 미리보기:', relevantKnowledge.substring(0, 200) + '...');

        // 2. 프롬프트 구성 - 더 유연하고 자연스러운 답변 유도
        const prompt = `당신은 외식업 전문가 '요알남'입니다. 아래 참고 자료를 바탕으로 자연스럽고 유연하게 답변하세요.

[참고 자료]
${relevantKnowledge}

[질문]
${userMessage}

[답변 가이드라인]
1. **요알남의 어조**: 솔직하고 직설적이되 자연스러운 톤, "~임", "~거임", "~야" 같은 구어체 사용
2. **유연한 접근**: 참고 자료에 없는 내용도 일반적인 외식업 상식 범위에서 답변 가능
3. **1인칭 조언**: "내가 생각하기에는...", "나라면 이렇게 할 거야", "내 경험상..." 같은 개인적 관점
4. **현실적 조언**: 과도한 낙관적 표현 지양, 현실적이고 솔직한 분석
5. **구체적 조언**: "이렇게 해라", "이건 피해라" 같은 명확한 방향 제시
6. **자연스러운 답변**: 너무 딱딱하지 않고 대화하듯이 답변

[답변]`;

        // 3. Gemini 호출 - 더 높은 temperature로 다양성 증가
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API 키가 없습니다.');
        }
        
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                maxOutputTokens: 600,  // 답변 길이 제한으로 핵심에 집중
                temperature: 0.9,      // 더 높은 temperature로 다양성 증가
                topP: 0.8,            // 더 다양한 단어 선택
                topK: 40              // 더 넓은 선택 범위
            }
        });
        
        console.log('Gemini API 호출 시작');
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        console.log('Gemini API 응답 받음, 길이:', responseText.length);
        return responseText;
        
    } catch (error) {
        console.error('챗봇 응답 생성 오류:', error);
        return getDefaultResponse(userMessage);
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
      const relevantKnowledge = await searchRelevantChunks(message, 8);
      
      // Gemini API로 응답 생성 (API 키가 있는 경우)
      let response;
      console.log("Gemini API 키 확인:", !!GEMINI_API_KEY);
      console.log(
        "Gemini API 키 길이:",
        GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
      );

      if (GEMINI_API_KEY) {
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
          timestamp: new Date().toISOString()
        }),
      };
    }

    // API 상태 확인 엔드포인트 - 직접 경로 매칭
    if (path === '/api/status' && event.httpMethod === 'GET') {
        const status = {
            gemini: {
                available: !!GEMINI_API_KEY,
                keyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0
            },
            pinecone: {
                available: !!(PINECONE_API_KEY && PINECONE_INDEX_NAME),
                apiKeyLength: PINECONE_API_KEY ? PINECONE_API_KEY.length : 0,
                indexName: PINECONE_INDEX_NAME || 'not_set'
            },
            data: {
                loadedItems: embeddedKnowledge.length,
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
            // restaurantKnowledge = await loadKnowledgeFromFiles(); // This line was removed
            
            console.log(`데이터 새로고침 성공: ${embeddedKnowledge.length}개 항목`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: '데이터가 성공적으로 새로고침되었습니다.',
                    dataCount: embeddedKnowledge.length,
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
        if (!GEMINI_API_KEY) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: "GEMINI_API_KEY가 설정되지 않았습니다.",
            }),
          };
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
