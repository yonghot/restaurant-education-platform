// 요알남 AI 챗봇 JavaScript
class YoalnamChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.conversationHistory = [];
        this.isTyping = false;
        
        this.initializeEventListeners();
        this.loadConversationHistory();
    }
    
    initializeEventListeners() {
        // 전송 버튼 클릭 이벤트
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // 엔터 키 이벤트
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 입력 필드 포커스 이벤트
        this.messageInput.addEventListener('focus', () => {
            this.scrollToBottom();
        });
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // 사용자 메시지 표시
        this.addUserMessage(message);
        this.messageInput.value = '';
        
        // 타이핑 인디케이터 표시
        this.showTypingIndicator();
        
        try {
            // 백엔드 API 호출
            const response = await this.callChatbotAPI(message);
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            console.error('챗봇 API 호출 오류:', error);
            this.hideTypingIndicator();
            this.addBotMessage('죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    async callChatbotAPI(message) {
        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.error('API 호출 오류:', error);
            // API 오류 시 모의 응답 반환
            return this.getMockResponse(message);
        }
    }
    
    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-text">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // 대화 기록 저장
        this.conversationHistory.push({ role: 'user', content: message });
        this.saveConversationHistory();
    }
    
    addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-text">${this.formatMessage(message)}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // 대화 기록 저장
        this.conversationHistory.push({ role: 'assistant', content: message });
        this.saveConversationHistory();
    }
    
    formatMessage(message) {
        // 마크다운 스타일 포맷팅
        return this.escapeHtml(message)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    saveConversationHistory() {
        try {
            localStorage.setItem('yoalnam_chat_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('대화 기록 저장 오류:', error);
        }
    }
    
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('yoalnam_chat_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // 최근 10개 메시지만 표시
                const recentMessages = this.conversationHistory.slice(-10);
                recentMessages.forEach(msg => {
                    if (msg.role === 'user') {
                        this.addUserMessage(msg.content);
                    } else {
                        this.addBotMessage(msg.content);
                    }
                });
            }
        } catch (error) {
            console.error('대화 기록 로드 오류:', error);
        }
    }
    
    // 개발용 모의 응답 (API 오류 시 사용)
    getMockResponse(userMessage) {
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
}

// 챗봇 초기화
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new YoalnamChatbot();
}); 