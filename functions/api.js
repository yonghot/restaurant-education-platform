const { GoogleGenerativeAI } = require('@google/generative-ai');

// 외식업 관련 지식 데이터베이스
const restaurantKnowledge = [
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
        tags: ['에너지', '비용', '인덕션']
    }
];

// 키워드 추출 함수
function extractKeywords(text) {
    const keywords = [
        '창업', '위치', '메뉴', '원가', '가격', '인력', '직원', '교육',
        '마케팅', 'SNS', '배달', '트렌드', '재무', '투자', '수익',
        '위생', '안전', 'HACCP', '에너지', '비용', '인덕션',
        '칼국수', '외식업', '음식점', '운영', '관리'
    ];
    
    return keywords.filter(keyword => text.includes(keyword));
}

// 관련 지식 검색 함수
function searchRelevantKnowledge(query) {
    try {
        const keywords = extractKeywords(query);
        const relevantDocs = restaurantKnowledge.filter(doc => 
            keywords.some(keyword => 
                doc.text.includes(keyword) || 
                doc.tags.includes(keyword) ||
                doc.category.includes(keyword)
            )
        );
        
        // 관련도 순으로 정렬 (키워드 매칭 개수 기준)
        relevantDocs.sort((a, b) => {
            const aScore = keywords.filter(k => 
                a.text.includes(k) || a.tags.includes(k) || a.category.includes(k)
            ).length;
            const bScore = keywords.filter(k => 
                b.text.includes(k) || b.tags.includes(k) || b.category.includes(k)
            ).length;
            return bScore - aScore;
        });
        
        return relevantDocs.slice(0, 3).map(doc => doc.text).join('\n\n');
        
    } catch (error) {
        console.error('지식 검색 오류:', error);
        return restaurantKnowledge[0].text; // 기본 지식 반환
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
        '원가': '원가 관리는 수익성 향상의 핵심입니다. 식재료 원가율을 30-40%로 유지하고, 정기적인 원가 분석을 통해 가격 경쟁력을 확보하세요.'
    };
    
    for (const [keyword, response] of Object.entries(responses)) {
        if (userMessage.includes(keyword)) {
            return response;
        }
    }
    
    return '외식업에 대한 구체적인 질문을 해주시면 더 자세한 답변을 드릴 수 있습니다. 창업, 비용, 메뉴, 마케팅, 인력 관리, 에너지 비용 등 궁금한 부분이 있으시면 언제든 물어보세요!';
}

// Gemini API를 사용한 응답 생성
async function generateChatbotResponse(userMessage, knowledge) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `당신은 요알남 외식업 교육 플랫폼의 AI 챗봇입니다. 
        외식업 창업과 운영에 대한 전문적인 조언을 제공하는 것이 목표입니다.

        다음은 외식업 관련 지식 데이터베이스에서 검색된 관련 정보입니다:
        ${knowledge}

        사용자 질문: ${userMessage}

        다음 지침에 따라 답변해주세요:
        1. 친근하고 전문적인 톤을 유지하세요
        2. 구체적이고 실용적인 조언을 제공하세요
        3. 필요시 예시나 단계별 가이드를 포함하세요
        4. 한국어로 답변하세요
        5. 답변은 200-400자 내외로 작성하세요
        6. 외식업 초보자도 이해할 수 있도록 설명하세요
        7. 제공된 지식 정보를 바탕으로 답변하세요

        답변:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error('Gemini API 오류:', error);
        // API 오류 시 기본 응답 반환
        return getDefaultResponse(userMessage);
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
        
        // 챗봇 API
        if (path === '/chatbot/chat' && event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { message } = body;
            
            if (!message) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: '메시지가 필요합니다.' })
                };
            }

            // 관련 지식 검색
            const relevantKnowledge = searchRelevantKnowledge(message);
            
            // Gemini API로 응답 생성 (API 키가 있는 경우)
            let response;
            if (process.env.GEMINI_API_KEY) {
                response = await generateChatbotResponse(message, relevantKnowledge);
            } else {
                response = getDefaultResponse(message);
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    response,
                    knowledge: relevantKnowledge
                })
            };
        }
        
        // 지식 데이터베이스 조회 API
        if (path === '/chatbot/knowledge' && event.httpMethod === 'GET') {
            const { category } = event.queryStringParameters || {};
            
            let filteredKnowledge = restaurantKnowledge;
            if (category) {
                filteredKnowledge = restaurantKnowledge.filter(doc => 
                    doc.category === category
                );
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ knowledge: filteredKnowledge })
            };
        }

        // 404 에러
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