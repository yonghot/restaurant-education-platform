// 최신 콘텐츠 로드
function loadLatestContent() {
    const latestContent = document.getElementById('latestContent');
    // 실제 구현에서는 서버에서 데이터를 가져와야 합니다
    const sampleContent = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">외식업 시작하기: 기본 가이드</h5>
                <p class="card-text">외식업을 시작하기 전에 알아야 할 기본적인 내용들을 소개합니다.</p>
                <a href="courses.html" class="btn btn-primary">자세히 보기</a>
            </div>
        </div>
    `;
    latestContent.innerHTML = sampleContent;
}

// 최근 학습 주제 로드
function loadRecentTopics() {
    const recentTopics = document.getElementById('recentTopics');
    // 실제 구현에서는 서버에서 데이터를 가져와야 합니다
    const sampleTopics = `
        <li class="list-group-item">외식업 시작하기: 기본 가이드</li>
        <li class="list-group-item">메뉴 기획과 가격 책정</li>
        <li class="list-group-item">직원 채용과 교육</li>
    `;
    recentTopics.innerHTML = sampleTopics;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadLatestContent();
    loadRecentTopics();
}); 