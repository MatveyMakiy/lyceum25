const tasks = [];
let counter = 0;
const taskInput = document.getElementById('taskInput')
const addBut = document.getElementById('addBut')
const taskList = document.getElementById('taskList')
const countTs = document.getElementById('count')
const filterRad = document.querySelectorAll('input[name="filter"]')
function nextId() {
    return counter++;
}
function addButState() {
    const val = taskInput.value.trim();
    addBut.disabled = (val.length === 0)
}
taskInput.addEventListener('input', addButState);
taskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !addBut.disabled) {
        addBut.click();
    }
    })
addBut.addEventListener ('click', function() {
    const text = taskInput.value.trim();
    if (text === '') return;
    const task = {
        id: nextId(),
        text: text,
        done: false
    }
    tasks.push(task);
    taskInput.value = '';
    addButState();
    renderTasks();
})
filterRad.forEach(r => {
    r.addEventListener('change', renderTasks)
})
function renderTasks() {
    const filter = document.querySelector('input[name="filter"]:checked').value;
    taskList.innerHTML = '';
    const visible = tasks.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'done') return t.done;
        if (filter === 'notdone') return !t.done;
    });
    visible.forEach(task => {
        const li = document.createElement ('li')
        li.dataset.id = task.id;
        if (task.done) li.classList.add('completed');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        const span = document.createElement('span');
        span.className = 'text';
        span.textContent = task.text;
        const delBut = document.createElement('button');
        delBut.className = 'trash-bin';
        delBut.innerHTML = '🗑️'
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBut);
        taskList.appendChild(li);
    })
    const remaining = tasks.filter(t => !t.done).length;
    if (remaining === 0 || remaining > 4) countTs.textContent = 'Осталось' + ' ' + remaining + ' ' + 'задач';
    else if (remaining === 1) countTs.textContent = 'Осталась' + ' ' + remaining + ' ' + 'задача';
    else countTs.textContent = 'Осталось' + ' ' + remaining + ' ' + 'задачи';
}
taskList.addEventListener('click', function (e) {
    const li = e.target.closest('li');
    if (!li) return;
    const id = Number(li.dataset.id);
    if (e.target.classList.contains('trash-bin')) {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            tasks.splice(idx, 1);
            renderTasks();
        }
    }
})
taskList.addEventListener ('change', function(e) {
    if (e.target.type === 'checkbox') {
        const li = e.target.closest('li');
        if (!li) return;
        const id = Number(li.dataset.id);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.done = e.target.checked;
            renderTasks();
        }
    }
})
addButState(); 
renderTasks();