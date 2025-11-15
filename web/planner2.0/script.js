const tasks = [];
let counter = 0;
const taskInput = document.getElementById('taskInput')
const addBut = document.getElementById('addBut')
const taskList = document.getElementById('taskList')
const countTs = document.getElementById('count')
const filterRad = document.querySelectorAll('input[name="filter"]')
const spinnerGif = 'https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif'
function someDelay(action, type, element) {
    const delay = Math.floor(Math.random() * 3000) + 2000;
    if (type === 'add') {
        blockAddInput(true);
    } else if (type === 'checkbox' && element) {
        blockCheckbox(element, true);
    } else if (type === 'delete' && element) {
        blockDelete(element, true);
    }
    setTimeout(() => {
        action();
        if (type === 'add') {
        blockAddInput(false);
    } else if (type === 'checkbox' && element) {
        blockCheckbox(element, false);
    } else if (type === 'delete' && element) {
        blockDelete(element, false);
    }
    }, delay)
}
function blockAddInput(isBlocked) {
    if (isBlocked) {
        addBut.dataset.originalText = addBut.innerHTML;
        addBut.innerHTML = `<img src="${spinnerGif}" width = "20" height = "20">`;
    } else {
        addBut.innerHTML = '+';
    }
    taskInput.disabled = isBlocked;
    addBut.disabled = isBlocked;
    taskInput.classList.toggle('loading', isBlocked);
    addBut.classList.toggle('loading', isBlocked)
}
function blockCheckbox(checkboxElement, isBlocked) {
    const li = checkboxElement.closest('li');
    if (li && isBlocked) {
        li.dataset.checkboxChecked = checkboxElement.checked;
        li.classList.add('loading');
        const spinner = document.createElement('img');
        spinner.src = spinnerGif;
        spinner.width = 20;
        spinner.height = 20;
        spinner.className = 'loading';
        checkboxElement.style.display = 'none';
        checkboxElement.parentNode.insertBefore(spinner, checkboxElement);
        const trashBut = li.querySelector('.trash-bin');
        if (trashBut) {
            trashBut.disabled = true;
            trashBut.classList.toggle('loading', true);
        }
    } else if (li) {
        const spinner = li.querySelector(`img[src="${spinnerGif}"]`);
        if (spinner) {
            spinner.parentNode.removeChild(spinner);
            const checkbox = li.querySelector('input[type="checkbox"]');
            const taskId = Number(li.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (checkbox && task) {
                checkbox.checked = task.done;
                checkbox.style.display = 'inline-block';
                checkbox.classList.toggle('loading', false);
            }
            li.classList.remove('loading');
            const trashBut = li.querySelector('.trash-bin');
            if (trashBut) {
                trashBut.disabled = false;
                trashBut.classList.toggle('loading', false);
            }
        }
    }
}
function blockDelete(deleteButton, isBlocked) {
    const li = deleteButton.closest('li');
    if (li && isBlocked) {
        li.classList.add('loading');
        const spinner = document.createElement('img');
        spinner.src = spinnerGif;
        spinner.width = 20;
        spinner.height = 20;
        spinner.className = 'loading';
        deleteButton.style.display = 'none';
        deleteButton.parentNode.insertBefore(spinner, deleteButton);
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.disabled = true;
            checkbox.classList.toggle('loading', true);
        }
    } else if (li) {
        const spinner = li.querySelector(`img[src="${spinnerGif}"]`);
        if (spinner) {
            const trashBtn = document.createElement('button');
            trashBtn.className = 'trash-bin';
            trashBtn.innerHTML = '🗑️';
            trashBtn.classList.toggle('loading', false);
            spinner.parentNode.replaceChild(trashBtn, spinner);
            li.classList.remove('loading');
            const checkbox = li.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.disabled = false;
                checkbox.classList.toggle('loading', false);
            }
        }
    }
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
    }, 'add', null)
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
    if (checkbox && !checkbox.disabled ) checkbox.checked = task.done;
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
        }, 'delete', e.target)
    }
})
taskList.addEventListener ('change', function(e) {
    if (e.target.type === 'checkbox') {
        const id  = Number(e.target.closest('li').dataset.id);
        const task = tasks.find(t => t.id === id);
        if (task) {
            someDelay(() => {
                task.done = !task.done;
                renderTasks();
            }, 'checkbox', e.target)
        }
    }
})
addButState(); 
renderTasks();