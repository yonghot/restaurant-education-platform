// 설정값을 저장할 객체
let settings = {};

// 페이지 로드 시 저장된 설정값 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    updatePreviews();
});

// 설정값 불러오기
function loadSettings() {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        // 저장된 설정값을 입력 필드에 표시
        Object.entries(settings).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
            }
        });
    } else {
        // 기본값 설정
        settings = {
            businessDaysPerMonth: 26,
            seatsPerPyeong: 1.5,
            turnoverCafe: 2,
            turnoverRestaurant: 1.5,
            turnoverOther: 1,
            priceCafe: 15000,
            priceRestaurant: 20000,
            priceOther: 18000,
            deliveryRatioCafe: 10,
            deliveryRatioRestaurant: 20,
            deliveryRatioOther: 15,
            deliveryOrdersPerDay: 10,
            locationHighInvestment: 1.5,
            locationHighExpense: 1.3,
            locationMediumInvestment: 1.2,
            locationMediumExpense: 1.1,
            locationLowInvestment: 1,
            locationLowExpense: 1,
            floor1Investment: 1.2,
            floor1Expense: 1.1,
            floor2Investment: 1,
            floor2Expense: 1,
            floor3Investment: 0.8,
            floor3Expense: 0.9,
            baseRent: 1000000,
            baseLaborCost: 3000000,
            baseRawMaterialCost: 2000000,
            baseOtherExpenses: 1000000,
            baseDeposit: 10000000,
            baseGoodwill: 20000000,
            baseInterior: 1000000,
            baseEquipment: 500000,
            basePreRent: 1000000,
            basePreLabor: 2000000,
            baseOther: 5000000
        };
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모든 입력 필드에 이벤트 리스너 추가
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            settings[e.target.id] = parseFloat(e.target.value) || 0;
            updatePreviews();
        });
    });

    // 저장 버튼 이벤트 리스너
    document.getElementById('saveButton').addEventListener('click', saveSettings);
}

// 설정 저장
function saveSettings() {
    localStorage.setItem('calculatorSettings', JSON.stringify(settings));
    alert('설정이 저장되었습니다.');
}

// 미리보기 업데이트
function updatePreviews() {
    // 월 매출 계산식 미리보기
    document.getElementById('salesFormulaPreview').innerHTML = `
        월 매출 = (좌석수 × 회전율 × 객단가 × 영업일수) + (일일 배달 주문수 × 객단가 × 영업일수)<br>
        - 좌석수 = 면적 × ${settings.seatsPerPyeong}석/평<br>
        - 회전율: 카페 ${settings.turnoverCafe}회/일, 음식점 ${settings.turnoverRestaurant}회/일, 기타 ${settings.turnoverOther}회/일<br>
        - 객단가: 카페 ${settings.priceCafe.toLocaleString()}원, 음식점 ${settings.priceRestaurant.toLocaleString()}원, 기타 ${settings.priceOther.toLocaleString()}원<br>
        - 영업일수: ${settings.businessDaysPerMonth}일/월<br>
        - 배달 비율: 카페 ${settings.deliveryRatioCafe}%, 음식점 ${settings.deliveryRatioRestaurant}%, 기타 ${settings.deliveryRatioOther}%<br>
        - 일일 배달 주문수: ${settings.deliveryOrdersPerDay}건
    `;

    // 월 지출 계산식 미리보기
    document.getElementById('expensesFormulaPreview').innerHTML = `
        월 지출 = (임대료 + 인건비 + 원재료비 + 기타 경비) × 상권 가중치 × 층수 가중치<br>
        - 기본 임대료: ${settings.baseRent.toLocaleString()}원/월<br>
        - 기본 인건비: ${settings.baseLaborCost.toLocaleString()}원/월<br>
        - 기본 원재료비: ${settings.baseRawMaterialCost.toLocaleString()}원/월<br>
        - 기타 경비: ${settings.baseOtherExpenses.toLocaleString()}원/월<br>
        - 상권 가중치: 고급 ${settings.locationHighExpense}배, 일반 ${settings.locationMediumExpense}배, 저렴 ${settings.locationLowExpense}배<br>
        - 층수 가중치: 1층 ${settings.floor1Expense}배, 2층 ${settings.floor2Expense}배, 3층 ${settings.floor3Expense}배
    `;

    // 초기 투자비 계산식 미리보기
    document.getElementById('investmentFormulaPreview').innerHTML = `
        초기 투자비 = (보증금 + 권리금 + 인테리어 + 설비비 + 사전 임대료 + 사전 인건비 + 기타 비용) × 상권 가중치 × 층수 가중치<br>
        - 기본 보증금: ${settings.baseDeposit.toLocaleString()}원<br>
        - 기본 권리금: ${settings.baseGoodwill.toLocaleString()}원<br>
        - 기본 인테리어: ${settings.baseInterior.toLocaleString()}원/평<br>
        - 기본 설비비: ${settings.baseEquipment.toLocaleString()}원/평<br>
        - 사전 임대료: ${settings.basePreRent.toLocaleString()}원<br>
        - 사전 인건비: ${settings.basePreLabor.toLocaleString()}원<br>
        - 기타 비용: ${settings.baseOther.toLocaleString()}원<br>
        - 상권 가중치: 고급 ${settings.locationHighInvestment}배, 일반 ${settings.locationMediumInvestment}배, 저렴 ${settings.locationLowInvestment}배<br>
        - 층수 가중치: 1층 ${settings.floor1Investment}배, 2층 ${settings.floor2Investment}배, 3층 ${settings.floor3Investment}배
    `;
} 