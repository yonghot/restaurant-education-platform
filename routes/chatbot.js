const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pinecone 초기화
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

// 외식업 관련 지식 데이터베이스 (실제로는 Pinecone에 저장된 데이터)
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

// 챗봇 응답 생성 API
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: '메시지가 필요합니다.' });
        }

        // 관련 지식 검색
        const relevantKnowledge = await searchRelevantKnowledge(message);
        
        // Gemini API로 응답 생성
        const response = await generateChatbotResponse(message, relevantKnowledge);
        
        res.json({ 
            response,
            knowledge: relevantKnowledge
        });
        
    } catch (error) {
        console.error('챗봇 API 오류:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            response: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주시기 바랍니다.'
        });
    }
});

// 관련 지식 검색 함수
async function searchRelevantKnowledge(query) {
    try {
        // Pinecone 벡터 검색 (실제 구현 시)
        // const index = pinecone.index(process.env.PINECONE_INDEX);
        // const queryResponse = await index.query({
        //     vector: await textToVector(query),
        //     topK: 3,
        //     includeMetadata: true
        // });
        
        // 현재는 키워드 기반 검색으로 대체
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

// Gemini API를 사용한 응답 생성
async function generateChatbotResponse(userMessage, knowledge) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `당신은 요알남 외식업 교육 플랫폼의 AI 챗봇입니다. 
        외식업 창업과 운영에 대한 전문적인 조언을 제공하는 것이 목표입니다.

        다음은 외식업 관련 지식 데이터베이스에서 검색된 관련 정보입니다:
        ${knowledge}

        사용자 질문: ${userMessage}

        다음 지침에 따라 답변해주세요:
        1. 반드시 존댓말(경어체)을 사용하세요. "~입니다", "~하시기 바랍니다", "~하시는 것을 권장드립니다" 등의 표현을 사용하세요
        2. "~하세요", "~해보세요" 대신 "~하시기 바랍니다", "~해보시기 바랍니다"를 사용하세요
        3. "~입니다"로 문장을 끝내세요. "~이에요", "~야" 등의 반말은 절대 사용하지 마세요
        4. 상대방을 존중하는 어조를 유지하세요
        5. 구체적이고 실용적인 조언을 제공하세요
        6. 한국어로 답변하세요
        7. 답변은 150-250자 내외로 간결하게 작성하세요
        8. 외식업 초보자도 이해할 수 있도록 명확하게 설명하세요
        9. 제공된 지식 정보를 바탕으로 답변하세요
        10. 불필요한 반복이나 장황한 설명을 피하세요

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

// 기본 응답 함수 (API 오류 시 사용)
function getDefaultResponse(userMessage) {
    const responses = {
        '창업': '외식업 창업을 고려하고 계시는군요. 시장 조사부터 시작하시는 것을 권장드립니다. 유동인구, 경쟁업체, 타겟 고객층 분석이 우선되어야 합니다. 초기 투자비용과 운영비용도 꼼꼼히 계산해보시기 바랍니다.',
        '비용': '외식업 비용은 초기 투자비와 운영비로 구분됩니다. 초기 투자비에는 임대보증금, 인테리어, 설비 구매비가 포함되고, 운영비에는 임대료, 인건비, 재료비, 공과금이 있습니다.',
        '메뉴': '메뉴 구성 시 원가 계산이 핵심입니다. 식재료 원가율을 30-40%로 유지하고, 인건비와 운영비를 고려한 적정 가격을 설정하시기 바랍니다. 시즌별 메뉴 변경도 고려해보세요.',
        '마케팅': '외식업 마케팅은 온라인과 오프라인을 병행하는 것이 효과적입니다. SNS 마케팅, 배달 플랫폼 활용, 지역 커뮤니티 참여를 통해 브랜드 인지도를 높이실 수 있습니다.',
        '인력': '직원 채용 시 업무 경험과 인성을 모두 고려하시기 바랍니다. 체계적인 교육 프로그램을 마련하고, 적절한 보상 체계를 구축하여 이직률을 낮추는 것이 중요합니다.',
        '에너지': '에너지 비용 절약을 위해 인덕션 도입을 고려해보시기 바랍니다. 가스비 대비 30-40% 절약 효과가 있으며, 초기 설치비는 200-500만원 정도입니다.',
        '위생': '식품위생 관리는 HACCP 시스템 도입과 정기적인 위생 교육이 핵심입니다. 식재료 보관, 조리 과정, 위생 관리 체크리스트를 구축하시기 바랍니다.'
    };
    
    for (const [keyword, response] of Object.entries(responses)) {
        if (userMessage.includes(keyword)) {
            return response;
        }
    }
    
    return '외식업에 대한 구체적인 질문을 해주시면 더 자세한 답변을 드릴 수 있습니다. 창업, 비용, 메뉴, 마케팅, 인력 관리, 에너지 비용 등 궁금한 부분이 있으시면 언제든 물어보시기 바랍니다.';
}

// 지식 데이터베이스 조회 API
router.get('/knowledge', (req, res) => {
    try {
        const { category } = req.query;
        
        let filteredKnowledge = restaurantKnowledge;
        if (category) {
            filteredKnowledge = restaurantKnowledge.filter(doc => 
                doc.category === category
            );
        }
        
        res.json({ knowledge: filteredKnowledge });
    } catch (error) {
        console.error('지식 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router; 