const checklistForm = document.getElementById('checklistForm');
const resultSection = document.getElementById('resultSection');
const resultTableBody = document.getElementById('resultTableBody');
const totalScoreTd = document.getElementById('totalScore');
const totalPercentileTd = document.getElementById('totalPercentile');
const percentileComment = document.getElementById('percentileComment');

const checklistItems = [
    '감기나 지병으로 고생한 게 살면서 몇 번 안 될 정도로 웬만해서는 잘 아프지 않고 건강하다.',
    '필요하면 2~3일쯤 밤새 일하는 것 정도는 가능하다.',
    '무언가를 배우는데 굳이 선생님이나 학원, 강의가 필요치 않고 혼자서도 어떻게든 잘 터득한다.',
    '문제를  마주하면  무기력하게  회피하기보다는  빠르게  집중하여  해결한다.',
    '무엇이 이득인지 판단하는 것이나, 원가, 인건비, 영업이익 등 각종 숫자 계산에 고루 강하다.',
    '정신적으로 힘든 일이 있어도 크게 스트레스를 받지 않거나, 아무리 힘들 어도 할 일은 한다.',
    '강한  자존심,  철학,  신념이  있더라도,  포기해야  할  때를  알고  과감하게 미련 없이 포기한다.',
    '위기가 오고 있음을 빠르게 감지하고, 적합한 조치를 신속, 정확하게 흔 들림 없이 즉시 실행한다.',
    '성공을 해내야만 하는 본인만의 명확하고 강렬한 동기, 명분, 야망이 있 다.',
    '위의 각 항목에 본인이 해당하는지 아닌지를 헷갈리지 않고 5초 안에 판 단할 수 있다.'
];

checklistForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputs = checklistForm.querySelectorAll('.score-input');
    const scores = Array.from(inputs).map(input => parseInt(input.value, 10));
    if (scores.some(s => isNaN(s) || s < 1 || s > 10)) {
        alert('각 항목에 1~10점 사이의 점수를 입력해 주세요.');
        return;
    }
    try {
        const res = await fetch('/api/checklist/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scores })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '서버 오류');
        showResult(data.result);
    } catch (err) {
        alert('결과를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.\n' + err.message);
    }
});

function showResult(result) {
    checklistForm.style.display = 'none';
    resultSection.style.display = 'block';
    resultTableBody.innerHTML = '';
    checklistItems.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.slice(0, 20)}...</td><td>${result.scores[idx]}</td><td>${result.rankPerItem[idx]}%</td>`;
        resultTableBody.appendChild(tr);
    });
    totalScoreTd.textContent = result.total;
    totalPercentileTd.textContent = result.rankTotal + '%';
    let comment = '';
    if (result.rankTotal >= 90) comment = '사업가 기질이 매우 뛰어납니다!';
    else if (result.rankTotal >= 70) comment = '상위권! 사업가로서의 자질이 충분합니다.';
    else if (result.rankTotal >= 40) comment = '평균 이상입니다. 강점과 약점을 파악해 보세요.';
    else comment = '아직 성장의 여지가 많습니다. 각 항목별로 보완해 보세요!';
    percentileComment.textContent = comment;
} 