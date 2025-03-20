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
questionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 폼 데이터 가져오기
    const subject = inputs.subject.value;
    const title = inputs.title.value;
    const content = inputs.content.value;
    
    // 새 질문 객체 생성
    const question = {
        subject: subject,
        title: title,
        content: content,
        answers: [],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        // 데이터 유효성 검사
        if (!subject || !title || !content) {
            throw new Error('모든 필드를 입력해주세요.');
        }
        
        // Firestore에 질문 추가
        await db.collection('questions').add(question);
        
        // 폼 초기화
        questionForm.reset();
        steps.forEach(step => step.classList.remove('active'));
        steps[0].classList.add('active');
        
        // 성공 알림 표시
        showNotification('질문이 성공적으로 등록되었습니다!');
        
        // 질문 목록 새로고침
        loadQuestions();
    } catch (error) {
        console.error('질문 등록 오류:', error);
        showNotification(error.message || '질문 등록에 실패했습니다.', true);
    }
});

// 질문 목록 로드 함수
async function loadQuestions() {
    try {
        const snapshot = await db.collection('questions')
            .orderBy('timestamp', 'desc')
            .get();
        
        questionsListDiv.innerHTML = '';
        
        snapshot.forEach(doc => {
            const question = doc.data();
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            
            questionElement.innerHTML = `
                <div class="question-header">
                    <span class="question-subject">${question.subject}</span>
                    <span class="question-date">${question.timestamp ? new Date(question.timestamp.toDate()).toLocaleString() : '날짜 없음'}</span>
                </div>
                <div class="question-title">${question.title}</div>
                <div class="question-content">${question.content}</div>
                <div class="answers">
                    ${(question.answers || []).map(answer => `
                        <div class="answer-item">
                            <div class="answer-header">
                                <span class="answer-date">${new Date(answer.timestamp.toDate()).toLocaleString()}</span>
                            </div>
                            <div class="answer-content">${answer.content}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="answer-form">
                    <textarea placeholder="답변을 작성해주세요." class="answer-input"></textarea>
                    <button onclick="addAnswer('${doc.id}')">답변 등록</button>
                </div>
            `;
            
            questionsListDiv.appendChild(questionElement);
        });
    } catch (error) {
        console.error('질문 목록 로드 오류:', error);
        showNotification('질문 목록을 불러오는데 실패했습니다.', true);
    }
}

// 답변 추가 함수
async function addAnswer(questionId) {
    const answerElement = event.target.parentElement.querySelector('.answer-input');
    const answerContent = answerElement.value.trim();
    
    if (!answerContent) {
        showNotification('답변 내용을 입력해주세요.', true);
        return;
    }
    
    try {
        const answer = {
            content: answerContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Firestore 문서 참조 가져오기
        const questionRef = db.collection('questions').doc(questionId);
        
        // 답변 배열에 새 답변 추가
        await questionRef.update({
            answers: firebase.firestore.FieldValue.arrayUnion(answer)
        });
        
        // 입력 필드 초기화
        answerElement.value = '';
        
        // 성공 알림 표시
        showNotification('답변이 성공적으로 등록되었습니다!');
        
        // 질문 목록 새로고침
        loadQuestions();
    } catch (error) {
        console.error('답변 등록 오류:', error);
        const errorMessage = error.code === 'permission-denied' 
            ? '답변 권한이 없습니다.' 
            : '답변 등록에 실패했습니다.';
        showNotification(errorMessage, true);
    }
}

// 실시간 업데이트 설정
function setupRealtimeUpdates() {
    db.collection('questions')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    loadQuestions();
                }
            });
        }, error => {
            console.error('실시간 업데이트 오류:', error);
        });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    setupRealtimeUpdates();
});
