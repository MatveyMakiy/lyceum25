const spinnerGif = 'https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif'
export function blockAddInput(isBlocked) {
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

export function blockCheckbox(checkboxElement, isBlocked) {
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

export function blockDelete(deleteButton, isBlocked) {
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