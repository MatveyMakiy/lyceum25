const tasks = [];
let counter = 0;
const taskInput = document.getElementById('taskInput')
const addBut = document.getElementById('addBut')
const taskList = document.getElementById('taskList')
const countTs = document.getElementById('count')
const filterRad = document.querySelectorAll('input[name="filter"]')
function someDelay(action) {
    const delay = Math.floor(Math.random() * 3000) + 2000;
    blockSome(true);
    setTimeout(() => {
        action();
        blockSome(false);
    }, delay)
}
function blockSome(isBlocked) {
    const elements = [
        taskInput,
        addBut,
        ...document.querySelectorAll('.trash-bin'),
        ...document.querySelectorAll('input[type="checkbox"]'),
        ...filterRad
    ];
    elements.forEach(el => {
        el.disabled = isBlocked;
        el.classList.toggle('loading', isBlocked);
    })
}
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
    someDelay (() => {
        const text = taskInput.value.trim();
        if (text === '') return;
        const task = {
            id: nextId(),
            text: text,
            done: false,
            justAdd: true
        }
        tasks.push(task);
        taskInput.value = '';
        addButState();
        renderTasks();
    })
})
filterRad.forEach(r => {
    r.addEventListener('change', renderTasks)
})
function renderTasks() {
    const filter = document.querySelector('input[name="filter"]:checked').value;
    const visibleTasks = tasks.filter(t => 
        filter === 'all' || (filter === 'done' && t.done) || (filter === 'notdone' && !t.done)
    );
    const visibleIds = new Set(visibleTasks.map(t => t.id));
    Array.from(taskList.children).forEach(li => {
        const id = Number(li.dataset.id);
        if (!visibleIds.has(id) && !li.classList.contains('anim-out')) {
            if (!li.classList.contains('anim-out')) {
                li.classList.remove('anim-in');
                li.classList.add('anim-out');
                li.addEventListener('animationend', function onEnd(e) {
                    if (e.animationName === 'goout') {
                        if (li.parentElement) li.parentElement.removeChild(li);
                        li.removeEventListener('animationend', onEnd)
                    }
                })
            }
        }
    })
    visibleTasks.forEach(task => {
    let li = taskList.querySelector(`li[data-id="${task.id}"]`);
    let newVis = false;

    if (!li) {
        li = document.createElement('li');
        li.dataset.id = task.id;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        const span = document.createElement('span');
        span.className = 'text';
        span.textContent = task.text;
        const delBut = document.createElement('button');
        delBut.className = 'trash-bin';
        delBut.innerHTML = '🗑️';
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBut);
        taskList.appendChild(li);
        newVis = true;
    } else if (!li.classList.contains('anim-in') && !li.classList.contains('anim-out')) {
        const wasHid = li.style.display === 'none' || li.offsetParent === null;
        if (wasHid) newVis = true;
    }
    if (newVis) {
        li.classList.add('anim-in');
        li.addEventListener('animationend', function onEnd() {
            li.classList.remove('anim-in');
            li.removeEventListener('animationend', onEnd);
        });
    }
    const checkbox = li.querySelector('input[type="checkbox"]');
    const span = li.querySelector('span.text');
    if (checkbox) checkbox.checked = task.done;
    if (span) span.textContent = task.text;
    li.classList.toggle('completed', task.done);
    if (li.classList.contains('anim-out')) li.classList.remove('anim-out');
});
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
        someDelay(() => {
            const idx = tasks.findIndex(t => t.id === id);
            if (idx !== -1) {
                tasks.splice(idx, 1);
                li.classList.remove('anim-in');
                li.classList.add('anim-out');
                li.addEventListener('animationend', function onEnd(){
                    if (li.parentElement) li.parentElement.removeChild(li);
                    li.removeEventListener('animationend', onEnd);
                    renderTasks();
                })
            }
        })
    }
})
taskList.addEventListener ('change', function(e) {
    if (e.target.type === 'checkbox') {
        const id  = Number(e.target.closest('li').dataset.id);
        const task = tasks.find(t => t.id === id);
        if (task) {
            someDelay(() => {
                task.done = e.target.checked;
                renderTasks();
            })
        }
    }
})
addButState(); 
renderTasks();