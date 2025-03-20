document.addEventListener('DOMContentLoaded', () => {
    // 오늘 날짜 표시
    const today = new Date();
    const dateString = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    document.querySelector('.date').textContent = dateString;

    // 급식 데이터 가져오기
    fetchMealData();
});

async function fetchMealData() {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=F10&SD_SCHUL_CODE=7401366&MLSV_YMD=${year}${month}${day}&Type=json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.mealServiceDietInfo && data.mealServiceDietInfo[1]) {
            const mealInfo = data.mealServiceDietInfo[1].row[0];
            const mealList = mealInfo.DDISH_NM.split('<br/>');
            
            displayMealList(mealList);
        } else {
            displayNoMeal();
        }
    } catch (error) {
        console.error('급식 정보를 가져오는데 실패했습니다:', error);
        displayError();
    }
}

function displayMealList(meals) {
    const mealListElement = document.querySelector('.meal-list');
    mealListElement.innerHTML = '';
    
    meals.forEach(meal => {
        const li = document.createElement('li');
        li.textContent = meal.trim();
        mealListElement.appendChild(li);
    });
}

function displayNoMeal() {
    const mealListElement = document.querySelector('.meal-list');
    mealListElement.innerHTML = '<li>오늘은 급식이 없습니다.</li>';
}

function displayError() {
    const mealListElement = document.querySelector('.meal-list');
    mealListElement.innerHTML = '<li>급식 정보를 불러오는데 실패했습니다.</li>';
} 