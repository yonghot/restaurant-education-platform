// 퀴즈 데이터 (실제 구현에서는 서버에서 가져와야 합니다)
const quizzes = [
    {
        id: 1,
        title: "외식업 시작하기 퀴즈",
        questions: [
            {
                question: "외식업을 시작하기 전에 필요한 가장 중요한 허가증은?",
                options: [
                    "사업자등록증",
                    "위생교육수료증",
                    "식품위생업소신고증",
                    "건강검진서"
                ],
                correctAnswer: 2
            },
            {
                question: "메뉴 가격을 책정할 때 고려해야 할 가장 중요한 요소는?",
                options: [
                    "경쟁업체의 가격",
                    "원재료비",
                    "인건비",
                    "임대료"
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 2,
        title: "메뉴 기획 퀴즈",
        questions: [
            {
                question: "메뉴 기획 시 가장 먼저 해야 할 일은?",
                options: [
                    "원재료 구매처 선정",
                    "가격 책정",
                    "타겟 고객층 분석",
                    "메뉴판 디자인"
                ],
                correctAnswer: 2
            }
        ]
    }
];

// 퀴즈 목록 로드
function loadQuizzes() {
    const quizList = document.getElementById('quizList');
    let quizzesHTML = '';

    quizzes.forEach(quiz => {
        quizzesHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${quiz.title}</h5>
                    <button class="btn btn-primary" onclick="startQuiz(${quiz.id})">퀴즈 시작</button>
                </div>
            </div>
        `;
    });

    quizList.innerHTML = quizzesHTML;
}

// 퀴즈 시작
function startQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const quizContent = document.getElementById('quizContent');
    let questionsHTML = '';

    quiz.questions.forEach((question, index) => {
        questionsHTML += `
            <div class="mb-4">
                <h5>문제 ${index + 1}</h5>
                <p>${question.question}</p>
                <div class="quiz-options">
                    ${question.options.map((option, optionIndex) => `
                        <div class="quiz-option" onclick="selectAnswer(${index}, ${optionIndex})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    quizContent.innerHTML = questionsHTML;

    // 모달 표시
    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
    quizModal.show();
}

// 답변 선택
function selectAnswer(questionIndex, optionIndex) {
    const options = document.querySelectorAll(`.quiz-option`);
    const startIndex = questionIndex * 4;
    
    // 선택된 문제의 옵션들만 처리
    for (let i = 0; i < 4; i++) {
        options[startIndex + i].classList.remove('selected');
    }
    
    options[startIndex + optionIndex].classList.add('selected');
}

// 퀴즈 제출
function submitQuiz() {
    const selectedAnswers = document.querySelectorAll('.quiz-option.selected');
    if (selectedAnswers.length === 0) {
        alert('모든 문제에 답변해주세요.');
        return;
    }

    // 실제 구현에서는 서버에 답변을 제출하고 결과를 받아와야 합니다
    alert('퀴즈가 제출되었습니다!');
    
    // 모달 닫기
    const quizModal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
    quizModal.hide();
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadQuizzes();
}); 