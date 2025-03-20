// 질문과 답변을 저장할 배열
let questions = [];

// DOM 요소 가져오기
const questionForm = document.getElementById('questionForm');
const questionsListDiv = document.getElementById('questionsList');
const notification = document.getElementById('notification');

// 알림 표시 함수
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.className = `notification${isError ? ' error' : ''}`;
    
    // 알림 표시
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3초 후 알림 숨기기
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 프로세스 단계 관리
const steps = document.querySelectorAll('.step');
const inputs = {
    subject: document.getElementById('subject'),
    title: document.getElementById('title'),
    content: document.getElementById('content')
};

function updateSteps(currentInput) {
    let stepNumber;
    
    switch(currentInput) {
        case 'subject':
            stepNumber = 1;
            break;
        case 'title':
            stepNumber = 2;
            break;
        case 'content':
            stepNumber = 3;
            break;
    }
    
    steps.forEach(step => {
        const stepData = parseInt(step.dataset.step);
        if (stepData <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// 입력 필드 이벤트 리스너
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('focus', () => updateSteps(key));
    inputs[key].addEventListener('input', () => updateSteps(key));
});

// 폼 제출 이벤트 처리
questionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 폼 데이터 가져오기
    const subject = inputs.subject.value;
    const title = inputs.title.value;
    const content = inputs.content.value;
    
    // 새 질문 객체 생성
    const question = {
        id: Date.now(),
        subject: subject,
        title: title,
        content: content,
        answers: [],
        timestamp: new Date().toLocaleString()
    };
    
    // 질문을 배열에 추가
    questions.unshift(question);
    
    // 질문 목록 업데이트
    updateQuestionsList();
    
    // 폼 초기화
    questionForm.reset();
    steps.forEach(step => step.classList.remove('active'));
    steps[0].classList.add('active');
    
    // 성공 알림 표시
    showNotification('질문이 성공적으로 등록되었습니다!');
});

// 질문 목록 업데이트 함수
function updateQuestionsList() {
    questionsListDiv.innerHTML = '';
    
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        
        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-subject">${question.subject}</span>
                <span class="question-date">${question.timestamp}</span>
            </div>
            <div class="question-title">${question.title}</div>
            <div class="question-content">${question.content}</div>
            <div class="answers">
                ${question.answers.map(answer => `
                    <div class="answer-item">
                        <div class="answer-header">
                            <span class="answer-date">${answer.timestamp}</span>
                        </div>
                        <div class="answer-content">${answer.content}</div>
                    </div>
                `).join('')}
            </div>
            <div class="answer-form">
                <textarea placeholder="답변을 작성해주세요." class="answer-input"></textarea>
                <button onclick="addAnswer(${question.id})">답변 등록</button>
            </div>
        `;
        
        questionsListDiv.appendChild(questionElement);
    });
}

// 답변 추가 함수
function addAnswer(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const answerElement = event.target.parentElement.querySelector('.answer-input');
    const answerContent = answerElement.value.trim();
    
    if (answerContent) {
        const answer = {
            content: answerContent,
            timestamp: new Date().toLocaleString()
        };
        
        question.answers.push(answer);
        updateQuestionsList();
        answerElement.value = '';
        
        // 성공 알림 표시
        showNotification('답변이 성공적으로 등록되었습니다!');
    } else {
        // 오류 알림 표시
        showNotification('답변 내용을 입력해주세요.', true);
    }
}

// 로컬 스토리지에서 데이터 불러오기
function loadFromLocalStorage() {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }
}

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

// 질문이나 답변이 추가될 때마다 로컬 스토리지 업데이트
const originalPush = Array.prototype.push;
Array.prototype.push = function() {
    const result = originalPush.apply(this, arguments);
    saveToLocalStorage();
    return result;
};

const originalUnshift = Array.prototype.unshift;
Array.prototype.unshift = function() {
    const result = originalUnshift.apply(this, arguments);
    saveToLocalStorage();
    return result;
};

// 페이지 로드 시 저장된 데이터 불러오기
loadFromLocalStorage();
