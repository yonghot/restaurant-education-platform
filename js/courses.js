// 교육과정 데이터 (실제 구현에서는 서버에서 가져와야 합니다)
const courses = [
    {
        id: 1,
        title: "외식업 시작하기: 기본 가이드",
        description: "외식업을 시작하기 전에 알아야 할 기본적인 내용들을 소개합니다.",
        content: `
            <h4>외식업 시작하기: 기본 가이드</h4>
            <p>외식업을 시작하기 전에 고려해야 할 주요 사항들입니다:</p>
            <ul>
                <li>사업자 등록 절차</li>
                <li>위생 인증 및 허가</li>
                <li>초기 투자 비용 산정</li>
                <li>메뉴 기획과 가격 책정</li>
                <li>직원 채용과 교육</li>
            </ul>
        `,
        comments: []
    },
    {
        id: 2,
        title: "메뉴 기획과 가격 책정",
        description: "성공적인 메뉴 기획과 적절한 가격 책정 방법을 알아봅니다.",
        content: `
            <h4>메뉴 기획과 가격 책정</h4>
            <p>메뉴 기획과 가격 책정의 핵심 포인트:</p>
            <ul>
                <li>타겟 고객층 분석</li>
                <li>원가 계산 방법</li>
                <li>가격 전략 수립</li>
                <li>메뉴 구성의 균형</li>
            </ul>
        `,
        comments: []
    }
];

// 교육과정 목록 로드
function loadCourses() {
    const courseList = document.getElementById('courseList');
    let coursesHTML = '';

    courses.forEach(course => {
        coursesHTML += `
            <div class="col-md-6">
                <div class="card course-card" onclick="openCourse(${course.id})">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                    </div>
                </div>
            </div>
        `;
    });

    courseList.innerHTML = coursesHTML;
}

// 교육과정 상세 보기
function openCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const courseContent = document.getElementById('courseContent');
    courseContent.innerHTML = course.content;

    // 댓글 로드
    loadComments(courseId);

    // 모달 표시
    const courseModal = new bootstrap.Modal(document.getElementById('courseModal'));
    courseModal.show();
}

// 댓글 로드
function loadComments(courseId) {
    const comments = document.getElementById('comments');
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    let commentsHTML = '';
    course.comments.forEach(comment => {
        commentsHTML += `
            <div class="comment">
                <p>${comment.text}</p>
                <small class="text-muted">${comment.author} - ${comment.date}</small>
            </div>
        `;
    });

    comments.innerHTML = commentsHTML;
}

// 댓글 작성
function submitComment() {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text) return;

    // 실제 구현에서는 서버에 댓글을 저장해야 합니다
    const newComment = {
        text: text,
        author: '사용자', // 실제 구현에서는 로그인한 사용자 정보를 사용해야 합니다
        date: new Date().toLocaleDateString()
    };

    // 임시로 첫 번째 교육과정에 댓글 추가
    courses[0].comments.push(newComment);
    loadComments(1);

    // 입력 필드 초기화
    commentInput.value = '';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
}); 