// 새로운 JavaScript 파일

// 설정값을 저장할 객체
let settings = {};

// 페이지 로드 시 저장된 설정값 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// 설정값 불러오기
function loadSettings() {
    const savedSettings = localStorage.getItem('calculatorSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    } else {
        // 기본값 설정 (엑셀 데이터 기반)
        settings = {
            businessDaysPerMonth: 30.42, // 엑셀: 30.416666666666668
            seatsPerPyeong: 0.8, // 엑셀: 20평에 16석 = 0.8석/평
            turnoverCafe: 2.5, // 엑셀: 2.5회/일
            turnoverRestaurant: 2.5, // 엑셀: 2.5회/일
            turnoverOther: 2.5, // 엑셀: 2.5회/일
            priceCafe: 18000, // 엑셀: 1.8만원 = 18,000원
            priceRestaurant: 18000, // 엑셀: 1.8만원 = 18,000원
            priceOther: 18000, // 엑셀: 1.8만원 = 18,000원
            deliveryRatioCafe: 31.03, // 엑셀: 31.03%
            deliveryRatioRestaurant: 31.03, // 엑셀: 31.03%
            deliveryRatioOther: 31.03, // 엑셀: 31.03%
            deliveryOrdersPerDay: 18, // 엑셀: 18건/일
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
            baseRent: 3300000, // 엑셀: 330만원
            baseLaborCost: 8120000, // 엑셀: 812만원 (2.8명 기준)
            baseRawMaterialCost: 9526500, // 엑셀: 952.65만원 (매출의 30%)
            baseOtherExpenses: 1500000, // 엑셀: 150만원
            baseDeposit: 36000000, // 엑셀: 3,600만원
            baseGoodwill: 36000000, // 엑셀: 3,600만원
            baseInterior: 20000000, // 엑셀: 200만원/평
            baseEquipment: 5000000, // 엑셀: 500만원
            basePreRent: 3300000, // 엑셀: 330만원
            basePreLabor: 2900000, // 엑셀: 290만원
            baseOther: 1000000 // 엑셀: 100만원
        };
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const form = document.getElementById('calculatorForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculate(e);
        });
    }

    // 입력 필드에 숫자만 입력되도록 제한
    const sizeInput = document.getElementById('size');
    if (sizeInput) {
        sizeInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // PDF 다운로드 버튼
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadPDF();
        });
    }

    // 다시 계산 버튼
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetCalculator();
        });
    }
}

// 상수 정의
const CONSTANTS = {
  BUSINESS_DAYS_PER_MONTH: () => settings.businessDaysPerMonth,
  SEATS_PER_PYEONG: () => settings.seatsPerPyeong,
  TURNOVER_RATES: {
    '카페': () => settings.turnoverCafe,
    '음식점': () => settings.turnoverRestaurant,
    '기타': () => settings.turnoverOther
  },
  PRICE_PER_CUSTOMER: {
    '카페': () => settings.priceCafe,
    '음식점': () => settings.priceRestaurant,
    '기타': () => settings.priceOther
  },
  LOCATION_FACTORS: {
    '고급 상권': {
      investment: () => settings.locationHighInvestment,
      expense: () => settings.locationHighExpense
    },
    '일반 상권': {
      investment: () => settings.locationMediumInvestment,
      expense: () => settings.locationMediumExpense
    },
    '저렴 상권': {
      investment: () => settings.locationLowInvestment,
      expense: () => settings.locationLowExpense
    }
  },
  FLOOR_FACTORS: {
    '1': {
      investment: () => settings.floor1Investment,
      expense: () => settings.floor1Expense
    },
    '2': {
      investment: () => settings.floor2Investment,
      expense: () => settings.floor2Expense
    },
    '3': {
      investment: () => settings.floor3Investment,
      expense: () => settings.floor3Expense
    }
  },
  DELIVERY_RATIO: {
    '카페': () => settings.deliveryRatioCafe / 100,
    '음식점': () => settings.deliveryRatioRestaurant / 100,
    '기타': () => settings.deliveryRatioOther / 100
  },
  DELIVERY_ORDER_PER_DAY: {
    '카페': () => settings.deliveryOrdersPerDay,
    '음식점': () => settings.deliveryOrdersPerDay,
    '기타': () => settings.deliveryOrdersPerDay
  },
  DELIVERY_COST_RATIO: {
    '카페': 0.15,
    '음식점': 0.2,
    '기타': 0.1
  },
  DELIVERY_PLATFORM_FEE: {
    '카페': 0.08,
    '음식점': 0.1,
    '기타': 0.05
  },
  // 기본 금액 상수 추가
  BASE_RENT: () => settings.baseRent,
  BASE_LABOR_COST: () => settings.baseLaborCost,
  BASE_RAW_MATERIAL_COST: () => settings.baseRawMaterialCost,
  BASE_OTHER_EXPENSES: () => settings.baseOtherExpenses,
  BASE_INVESTMENT: {
    deposit: () => settings.baseDeposit,
    goodwill: () => settings.baseGoodwill,
    interior: () => settings.baseInterior,
    equipment: () => settings.baseEquipment,
    preRent: () => settings.basePreRent,
    preLabor: () => settings.basePreLabor,
    other: () => settings.baseOther
  }
};

// 초기 투자비용 항목 정의 (엑셀 데이터 기반)
const COST_ITEMS = {
  deposit: { name: "보증금", baseAmount: 36000000, description: "임대보증금 (만원 단위)" },
  goodwill: { name: "권리금", baseAmount: 36000000, description: "영업, 시설, 바닥" },
  interior: { name: "인테리어", baseAmount: 40000000, description: "평당 인테리어 (200만원/평)" },
  equipment: { name: "이동집기 및 설비", baseAmount: 5000000, description: "주방 설비, 의탁자 등" },
  aircon: { name: "냉난방기", baseAmount: 4000000, description: "4 way x 1 / 1 way x 1" },
  initialGoods: { name: "초도물품비", baseAmount: 3000000, description: "식자재, 소모품 등 잡기" },
  preRent: { name: "오픈 전 임차료", baseAmount: 3300000, description: "오픈 전 임차료 (1개월)" },
  preLabor: { name: "오픈 전 인건비", baseAmount: 2900000, description: "오픈 전 인건비 (1개월)" },
  marketing: { name: "초기 마케팅 비용", baseAmount: 1000000, description: "초기 투자 비용 1% x 3개월" },
  etc: { name: "기타 초기 비용", baseAmount: 1000000, description: "중개보수, 식기, 포스, 인터넷 등" }
};

// 월 매출/지출 항목 정의
const MONTHLY_ITEMS = {
  sales: {
    seatSales: {
      name: "좌석 매출",
      description: "매장 내 고객 매출",
      baseAmount: 0,
      factors: {
        businessType: { name: "업종", value: 1.0 },
        size: { name: "규모", value: 1.0 },
        location: { name: "상권", value: 1.0 }
      }
    },
    deliverySales: {
      name: "배달 매출",
      description: "배달 플랫폼 매출",
      baseAmount: 0,
      factors: {
        businessType: { name: "업종", value: 1.0 },
        deliveryRatio: { name: "배달 비율", value: 1.0 }
      }
    }
  },
  expenses: {
    rent: {
      name: "임대료",
      description: "월 임대료",
      baseAmount: 1000000,
      factors: {
        location: { name: "상권", value: 1.0 },
        size: { name: "규모", value: 1.0 }
      }
    },
    laborCost: {
      name: "인건비",
      description: "직원 급여 및 복리후생비",
      baseAmount: 3000000,
      factors: {
        businessType: { name: "업종", value: 1.0 },
        size: { name: "규모", value: 1.0 }
      }
    },
    rawMaterialCost: {
      name: "원재료비",
      description: "식재료 및 소모품 비용",
      baseAmount: 2000000,
      factors: {
        businessType: { name: "업종", value: 1.0 },
        sales: { name: "매출", value: 1.0 }
      }
    },
    utilityCost: {
      name: "공과금",
      description: "전기, 가스, 수도, 인터넷 등",
      baseAmount: 300000,
      factors: {
        size: { name: "규모", value: 1.0 }
      }
    },
    marketingCost: {
      name: "마케팅비",
      description: "광고, 홍보, 이벤트 비용",
      baseAmount: 200000,
      factors: {
        businessType: { name: "업종", value: 1.0 }
      }
    },
    insuranceCost: {
      name: "보험료",
      description: "사업자 보험, 화재보험 등",
      baseAmount: 100000,
      factors: {
        size: { name: "규모", value: 1.0 }
      }
    },
    maintenanceCost: {
      name: "유지보수비",
      description: "설비 유지보수, 청소 등",
      baseAmount: 150000,
      factors: {
        size: { name: "규모", value: 1.0 }
      }
    },
    deliveryCost: {
      name: "배달 비용",
      description: "배달 플랫폼 수수료 및 배달비",
      baseAmount: 0,
      factors: {
        businessType: { name: "업종", value: 1.0 },
        deliverySales: { name: "배달 매출", value: 1.0 }
      }
    },
    otherExpenses: {
      name: "기타 경비",
      description: "사무용품, 교통비, 기타 소모품",
      baseAmount: 100000,
      factors: {
        businessType: { name: "업종", value: 1.0 }
      }
    }
  }
};

// 계산 함수
function calculate(event) {
  try {
    // 로딩 스피너 표시
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultSection = document.getElementById('resultSection');
    
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (resultSection) resultSection.style.display = 'none';

    // 입력값 가져오기
    const location = document.getElementById('location').value;
    const businessType = document.getElementById('businessType').value;
    const size = parseInt(document.getElementById('size').value);
    const floor = document.getElementById('floor').value;

    // 계산 수행
    const investment = calculateInvestment(location, businessType, size, floor);
    const sales = calculateSales(location, businessType, size);
    const expenses = calculateExpenses(location, businessType, size, floor, sales);

    // 결과 업데이트
    updateResults(investment, sales, expenses, { location, businessType, size, floor });

    // 로딩 스피너 숨기고 결과 표시
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resultSection) {
      resultSection.style.display = 'block';
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }

  } catch (error) {
    console.error('계산 중 오류 발생:', error);
    alert('계산 중 오류가 발생했습니다. 다시 시도해주세요.');
    
    // 로딩 스피너 숨기기
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
  }
}

// 초기 투자비용 계산 (엑셀 데이터 기반)
function calculateInvestment(location, businessType, size, floor) {
  const locationFactor = CONSTANTS.LOCATION_FACTORS[location].investment();
  const floorFactor = CONSTANTS.FLOOR_FACTORS[floor].investment();
  
  let totalInvestment = 0;
  const breakdown = [];

  // 각 비용 항목 계산 (엑셀 데이터 기반)
  Object.keys(COST_ITEMS).forEach(key => {
    const item = COST_ITEMS[key];
    let amount = item.baseAmount;
    
    // 평당 계산이 필요한 항목들
    if (key === 'interior') {
      // 엑셀: 200만원/평 × 실제 평수
      amount = CONSTANTS.BASE_INVESTMENT.interior() * size;
    }
    
    // 상권 및 층수 가중치 적용
    if (key === 'deposit' || key === 'goodwill' || key === 'interior') {
      amount *= locationFactor;
      amount *= floorFactor;
    }
    
    // 업종별 조정
    if (businessType === '카페') {
      if (key === 'interior') amount *= 0.8;
      else if (key === 'equipment') amount *= 0.7;
    } else if (businessType === '음식점') {
      if (key === 'interior') amount *= 1.2;
      else if (key === 'equipment') amount *= 1.3;
    }

    totalInvestment += amount;
    breakdown.push({
      name: item.name,
      amount: amount,
      description: item.description
    });
  });

  return {
    total: totalInvestment,
    breakdown: breakdown
  };
}

// 월 매출 계산
function calculateSales(location, businessType, size) {
  const locationFactor = CONSTANTS.LOCATION_FACTORS[location].expense();
  const turnoverRate = CONSTANTS.TURNOVER_RATES[businessType]();
  const pricePerCustomer = CONSTANTS.PRICE_PER_CUSTOMER[businessType]();
  const seats = Math.floor(size * CONSTANTS.SEATS_PER_PYEONG());
  const businessDays = CONSTANTS.BUSINESS_DAYS_PER_MONTH();
  
  // 좌석 매출 계산
  const seatSales = seats * turnoverRate * pricePerCustomer * businessDays * locationFactor;
  
  // 배달 매출 계산
  const deliveryRatio = CONSTANTS.DELIVERY_RATIO[businessType]();
  const deliveryOrdersPerDay = CONSTANTS.DELIVERY_ORDER_PER_DAY[businessType]();
  const deliverySales = deliveryOrdersPerDay * pricePerCustomer * businessDays * deliveryRatio;
  
  const totalSales = seatSales + deliverySales;
  
  return {
    seatSales: seatSales,
    deliverySales: deliverySales,
    totalSales: totalSales,
    seats: seats,
    turnoverRate: turnoverRate,
    pricePerCustomer: pricePerCustomer
  };
}

// 월 지출 계산 (엑셀 데이터 기반)
function calculateExpenses(location, businessType, size, floor, sales) {
  const locationFactor = CONSTANTS.LOCATION_FACTORS[location].expense();
  const floorFactor = CONSTANTS.FLOOR_FACTORS[floor].expense();
  
  let totalExpense = 0;
  const breakdown = [];

  // 월 지출 항목 계산 (엑셀 데이터 기반)
  const expenses = [
    { 
      name: "월 임대료", 
      amount: CONSTANTS.BASE_RENT() * locationFactor * floorFactor, 
      description: "관리비, 부가세 포함 (엑셀: 330만원)" 
    },
    { 
      name: "인건비(세전)", 
      amount: CONSTANTS.BASE_LABOR_COST() * locationFactor, 
      description: "직원 급여 (엑셀: 812만원, 2.8명 기준)" 
    },
    { 
      name: "4대보험", 
      amount: CONSTANTS.BASE_LABOR_COST() * locationFactor * 0.11, 
      description: "인건비의 11% (엑셀: 89.32만원)" 
    },
    { 
      name: "식자재 원가", 
      amount: sales.totalSales * 0.3, 
      description: "매출의 30% (엑셀: 952.65만원)" 
    },
    { 
      name: "배달 수수료", 
      amount: sales.deliverySales * 0.15, 
      description: "배달 매출의 15% (엑셀: 147.825만원)" 
    },
    { 
      name: "기타(판관비)", 
      amount: CONSTANTS.BASE_OTHER_EXPENSES() * locationFactor, 
      description: "가스, 전기, 수도, 소모품 등 (엑셀: 150만원)" 
    },
    { 
      name: "마케팅", 
      amount: CONSTANTS.BASE_RENT() * locationFactor * 0.003, 
      description: "월 임대료의 0.3% (엑셀: 39.66만원)" 
    }
  ];

  expenses.forEach(item => {
    totalExpense += item.amount;
    breakdown.push(item);
  });

  return {
    totalExpense: totalExpense,
    breakdown: breakdown
  };
}

// 결과 업데이트
function updateResults(investment, sales, expenses, inputData) {
  // 총 투자비용 업데이트
  const totalCostElement = document.getElementById('totalCost');
  if (totalCostElement) {
    totalCostElement.textContent = formatCurrency(investment.total);
  }

  // 월 운영비용 업데이트
  const monthlyCostElement = document.getElementById('monthlyCost');
  if (monthlyCostElement) {
    monthlyCostElement.textContent = formatCurrency(expenses.totalExpense);
  }

  // 상세 비용 분석 테이블 업데이트
  const costBreakdownElement = document.getElementById('costBreakdown');
  if (costBreakdownElement) {
    costBreakdownElement.innerHTML = '';
    
    // 초기 투자비용 항목들
    investment.breakdown.forEach(item => {
      const row = document.createElement('tr');
      const tooltipText = ITEM_DESCRIPTIONS[item.name] || item.description;
      row.innerHTML = `
        <td>${createTooltip(item.name, tooltipText)}</td>
        <td>${formatCurrency(item.amount)}</td>
        <td>${item.description}</td>
      `;
      costBreakdownElement.appendChild(row);
    });

    // 구분선 추가
    const separatorRow = document.createElement('tr');
    separatorRow.innerHTML = '<td colspan="3" style="background-color: rgba(255, 124, 67, 0.1); padding: 10px; text-align: center; font-weight: bold; color: #ff7c43;">월 운영비용</td>';
    costBreakdownElement.appendChild(separatorRow);

    // 월 운영비용 항목들
    expenses.breakdown.forEach(item => {
      const row = document.createElement('tr');
      const tooltipText = ITEM_DESCRIPTIONS[item.name] || item.description;
      row.innerHTML = `
        <td>${createTooltip(item.name, tooltipText)}</td>
        <td>${formatCurrency(item.amount)}</td>
        <td>${item.description}</td>
      `;
      costBreakdownElement.appendChild(row);
    });
  }

  // 참조표 추가
  const resultSection = document.getElementById('resultSection');
  if (resultSection) {
    // 기존 참조표 제거
    const existingReferenceTable = resultSection.querySelector('.reference-table');
    if (existingReferenceTable) {
      existingReferenceTable.remove();
    }
    
    // 새로운 참조표 추가
    const referenceTableHTML = createReferenceTable(investment, sales, expenses, inputData);
    resultSection.insertAdjacentHTML('beforeend', referenceTableHTML);
  }
}

// 통화 포맷팅 (천 단위 콤마 및 억 단위 표시)
function formatCurrency(amount) {
  // 원 단위를 만원 단위로 변환
  const manwon = amount / 10000;
  
  // 1억 이상인 경우 (1억 = 10000만원)
  if (manwon >= 10000) {
    const billion = Math.floor(manwon / 10000);
    const remaining = manwon % 10000;
    
    if (remaining === 0) {
      return `${billion.toLocaleString()}억 만원`;
    } else {
      return `${billion.toLocaleString()}억 ${Math.floor(remaining).toLocaleString()}만원`;
    }
  }
  
  // 1억 미만인 경우
  return `${Math.floor(manwon).toLocaleString()}만원`;
}

// PDF 다운로드
function downloadPDF() {
  const resultSection = document.getElementById('resultSection');
  if (!resultSection) return;

  const opt = {
    margin: 1,
    filename: '창업비용계산결과.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(resultSection).save();
}

// 계산기 리셋
function resetCalculator() {
  document.getElementById('calculatorForm').reset();
  document.getElementById('size').value = '30';
  document.getElementById('resultSection').style.display = 'none';
}

// 2. 월 지출 항목 보강
function calculateMonthlyExpenses(params) {
  const { rent, labor, sales, deliverySales, initialInvestment } = params;
  return [
    { name: "월 임대료", amount: rent, description: "관리비, 부가세 포함" },
    { name: "인건비(세전)", amount: labor, description: "직원 급여" },
    { name: "4대보험", amount: labor * 0.11, description: "인건비의 11%" },
    { name: "식자재 원가", amount: sales * 0.3, description: "매출의 30%" },
    { name: "배달 수수료", amount: deliverySales * 0.15, description: "배달 매출의 15%" },
    { name: "기타(판관비)", amount: 150, description: "가스, 전기, 수도, 소모품 등" },
    { name: "마케팅", amount: initialInvestment * 0.003, description: "초기 투자 비용의 0.3%" }
  ];
}

// 3. 매출/수익성 계산식 보강
function calculateAll(params) {
  // 입력값
  const { seats, turnover, price, businessDays, deliveryPerDay, initialInvestment, rent, labor } = params;
  // 매출
  const seatSales = seats * turnover * price * businessDays;
  const deliverySales = deliveryPerDay * price * businessDays;
  const totalSales = seatSales + deliverySales;
  // 월 지출
  const monthlyExpenses = calculateMonthlyExpenses({ rent, labor, sales: totalSales, deliverySales, initialInvestment });
  const totalExpense = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
  // 수익성
  const operatingProfit = totalSales - totalExpense;
  const netProfit = operatingProfit * 0.7; // 세금 등 30% 차감
  const BEP = netProfit > 0 ? initialInvestment / netProfit : null;
  const annualROI = initialInvestment > 0 ? (netProfit * 12) / initialInvestment : null;
  return {
    seatSales, deliverySales, totalSales, monthlyExpenses, totalExpense, operatingProfit, netProfit, BEP, annualROI
  };
}

// 참조표 생성 함수 (엑셀 데이터 기반)
function createReferenceTable(investment, sales, expenses, inputData) {
  const location = inputData.location;
  const businessType = inputData.businessType;
  const size = inputData.size;
  const floor = inputData.floor;
  
  const locationFactor = CONSTANTS.LOCATION_FACTORS[location];
  const floorFactor = CONSTANTS.FLOOR_FACTORS[floor];
  
  // 기본값들 (엑셀 데이터 기반)
  const baseRent = CONSTANTS.BASE_RENT();
  const baseLabor = CONSTANTS.BASE_LABOR_COST();
  const baseOther = CONSTANTS.BASE_OTHER_EXPENSES();
  const baseInterior = CONSTANTS.BASE_INVESTMENT.interior();
  
  return `
    <div class="reference-table">
      <h4>📊 계산 참조표 (엑셀 데이터 기반)</h4>
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light">
            <tr>
              <th>구분</th>
              <th>계산식</th>
              <th>값</th>
              <th>결과</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="5"><strong>초기 투자비용</strong></td>
              <td>상권 가중치</td>
              <td>${location} (${locationFactor.investment()}배)</td>
              <td>-</td>
            </tr>
            <tr>
              <td>층수 가중치</td>
              <td>${floor}층 (${floorFactor.investment()}배)</td>
              <td>-</td>
            </tr>
            <tr>
              <td>인테리어 (평당)</td>
              <td>${baseInterior.toLocaleString()}원/평 × ${size}평</td>
              <td>${(baseInterior * size).toLocaleString()}원</td>
            </tr>
            <tr>
              <td>기본 투자비용</td>
              <td>보증금 3,600만원 + 권리금 3,600만원 + 기타</td>
              <td>${formatCurrency(investment.total)}</td>
              <td>-</td>
            </tr>
            <tr>
              <td>총 투자비용</td>
              <td>기본비용 × 상권가중치 × 층수가중치</td>
              <td>${formatCurrency(investment.total)}</td>
              <td>-</td>
            </tr>
            <tr>
              <td rowspan="6"><strong>월 매출</strong></td>
              <td>좌석수</td>
              <td>${size}평 × ${CONSTANTS.SEATS_PER_PYEONG()}석/평</td>
              <td>${sales.seats}석</td>
            </tr>
            <tr>
              <td>회전율</td>
              <td>${businessType} (${sales.turnoverRate}회/일)</td>
              <td>-</td>
            </tr>
            <tr>
              <td>객단가</td>
              <td>${businessType} (${sales.pricePerCustomer.toLocaleString()}원)</td>
              <td>-</td>
            </tr>
            <tr>
              <td>영업일수</td>
              <td>월 ${CONSTANTS.BUSINESS_DAYS_PER_MONTH()}일</td>
              <td>-</td>
            </tr>
            <tr>
              <td>배달 매출</td>
              <td>${CONSTANTS.DELIVERY_ORDER_PER_DAY[businessType]()}건/일 × ${sales.pricePerCustomer.toLocaleString()}원 × ${CONSTANTS.BUSINESS_DAYS_PER_MONTH()}일</td>
              <td>${formatCurrency(sales.deliverySales)}</td>
            </tr>
            <tr>
              <td>월 매출</td>
              <td>좌석매출 + 배달매출</td>
              <td>${formatCurrency(sales.totalSales)}</td>
              <td>-</td>
            </tr>
            <tr>
              <td rowspan="5"><strong>월 지출</strong></td>
              <td>월 임대료</td>
              <td>${baseRent.toLocaleString()}원 × ${locationFactor.expense()} × ${floorFactor.expense()}</td>
              <td>${formatCurrency(expenses.breakdown.find(e => e.name === "월 임대료")?.amount || 0)}</td>
            </tr>
            <tr>
              <td>인건비</td>
              <td>${baseLabor.toLocaleString()}원 × ${locationFactor.expense()} (2.8명 기준)</td>
              <td>${formatCurrency(expenses.breakdown.find(e => e.name === "인건비(세전)")?.amount || 0)}</td>
            </tr>
            <tr>
              <td>4대보험</td>
              <td>인건비 × 11%</td>
              <td>${formatCurrency(expenses.breakdown.find(e => e.name === "4대보험")?.amount || 0)}</td>
            </tr>
            <tr>
              <td>기타 경비</td>
              <td>${baseOther.toLocaleString()}원 × ${locationFactor.expense()}</td>
              <td>${formatCurrency(expenses.breakdown.find(e => e.name === "기타(판관비)")?.amount || 0)}</td>
            </tr>
            <tr>
              <td>총 월 지출</td>
              <td>모든 지출 항목 합계</td>
              <td>${formatCurrency(expenses.totalExpense)}</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 툴팁 생성 함수
function createTooltip(text, tooltipText) {
  return `<span class="tooltip-container" title="${tooltipText}">${text} <i class="fas fa-info-circle text-muted"></i></span>`;
}

// 상세 설명 데이터 (엑셀 데이터 기반)
const ITEM_DESCRIPTIONS = {
  // 초기 투자비용 항목
  "보증금": "임대차 계약 시 임대인에게 지급하는 보증금으로, 계약 종료 시 반환받을 수 있습니다. (엑셀 기준: 3,600만원)",
  "권리금": "기존 점포의 영업권, 시설, 고객층 등을 인수받는 대가로 지급하는 비용입니다. (엑셀 기준: 3,600만원)",
  "인테리어": "매장 내부 시설 공사 비용으로, 평당 200만원 기준으로 계산됩니다. (엑셀 기준: 200만원/평)",
  "이동집기 및 설비": "주방 설비, 의자, 테이블 등 매장 운영에 필요한 기구류 비용입니다. (엑셀 기준: 500만원)",
  "냉난방기": "에어컨, 히터 등 냉난방 설비 설치 비용입니다. (엑셀 기준: 400만원)",
  "초도물품비": "개업 시 필요한 식자재, 소모품, 포장재 등 초기 물품 구매 비용입니다. (엑셀 기준: 300만원)",
  "오픈 전 임차료": "매장 오픈 전 임대료 선지급 비용입니다. (엑셀 기준: 330만원)",
  "오픈 전 인건비": "매장 오픈 전 직원 고용 및 급여 비용입니다. (엑셀 기준: 290만원)",
  "초기 마케팅 비용": "개업 홍보, 광고, 이벤트 등 초기 마케팅 활동 비용입니다. (엑셀 기준: 100만원)",
  "기타 초기 비용": "중개수수료, 식기류, POS기, 인터넷 설치 등 기타 초기 비용입니다. (엑셀 기준: 100만원)",
  
  // 월 운영비용 항목
  "월 임대료": "매월 지급하는 임대료로, 관리비와 부가세가 포함됩니다. (엑셀 기준: 330만원)",
  "인건비(세전)": "직원 급여 및 복리후생비로, 세전 금액 기준입니다. (엑셀 기준: 812만원, 2.8명 기준)",
  "4대보험": "국민연금, 건강보험, 고용보험, 산재보험으로 인건비의 11%를 차지합니다. (엑셀 기준: 89.32만원)",
  "식자재 원가": "음식 제조에 필요한 식재료 비용으로, 매출의 30%를 차지합니다. (엑셀 기준: 952.65만원)",
  "배달 수수료": "배달 플랫폼 수수료로, 배달 매출의 15%를 차지합니다. (엑셀 기준: 147.825만원)",
  "기타(판관비)": "가스, 전기, 수도, 소모품 등 기타 운영 경비입니다. (엑셀 기준: 150만원)",
  "마케팅": "광고, 홍보, 이벤트 등 마케팅 활동 비용으로, 월 임대료의 0.3%입니다. (엑셀 기준: 39.66만원)"
};
