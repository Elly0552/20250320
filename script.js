// 할 일 목록을 저장할 배열
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 할 일 추가 함수
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(todo);
        saveTodos();
        renderTodos();
        input.value = '';
    }
}

// 할 일 삭제 함수
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// 할 일 완료 상태 토글 함수
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// 할 일 목록을 로컬 스토리지에 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 할 일 목록 렌더링
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item flex items-center justify-between p-3 mb-2 rounded-lg shadow ${todo.completed ? 'bg-gray-300' : 'bg-white'}`;
        
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onclick="toggleTodo(${todo.id})" class="mr-2">
            <span class="${todo.completed ? 'line-through text-gray-500' : ''}">${todo.text}</span>
            <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600" onclick="deleteTodo(${todo.id})">삭제</button>
        `;
        
        todoList.appendChild(li);
    });
}

// Enter 키로 할 일 추가
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 초기 렌더링
renderTodos();
