let tasks = [];
let nextId = 1;
function snowMenu() {
    console.log("Main menu:");
    console.log("1) Add task");
    console.log("2) Show tasks");
    console.log("3) Mark task as done");
    console.log("4) Delete task");
    console.log("5) Show today's deadlines");
    console.log("6) Exit");
    console.log("Choose option (1-6):");
}
function addTask() {
    console.log("Enter name:");
    let name = prompt();
    console.log("Enter description:");
    let descript = prompt();
    console.log("Enter priority (High/Medium/Low):");
    let priority = prompt();
    console.log("Enter deadline (DD-MM-YYYY):");
    let deadline = prompt();
    console.log("Enter queue:");
    let queue = prompt();
    let newTask = {
        id: nextId,
        name: name,
        description: descript,
        priority: priority,
        deadline: deadline,
        status: false,
        queue: queue
    };
    tasks.push(newTask);
    nextId++;
    console.log("Task added.")
}
function showTasks() {
    console.log("Show only undone? (yes/no):")
    let onlyUndone = prompt() === yes;
    console.log("Sort by (none/deadline/priority/queue):")
    let sortBy = prompt();
    console.log("Order (asc/desc):");
    let order = prompt();
    console.log("Filter by queue (empty - no filter):")
    let queueFilter = prompt();
    let filteredTasks = tasks.filter(task => {
        if (onlyUndone && task.status) return false;
        if (queueFilter && task.queue !== queueFilter) return false;
        return true;
    });
    if (sortBy !== 'none') {
        filteredTasks.sort((a, b) => {
            let result = 0;
            if (sortBy === 'deadline') {
                result = new Date(a.deadline.split('-').reverse().join('-')) - new Date(b.deadline.split('-').reverse().join('-'))
            } else if (sortBy === 'priority') {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                result = priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortBy === 'queue') {
                result = a.queue.localeCompare(b.queue);
            }
            return order === 'desc' ? -result : result;
        });
    }
    filteredTasks.forEach((task, index) => {
        let statusMark = task.status ? '[X]' : '[ ]';
        console.log(`${index - 1}. ${statusMark} ${task.name} | priority: ${task.priority} | deadline: ${task.deadline} | queue: ${task.queue}`);
    });
}
function showSimpleList() {
    tasks.forEach((task, index) => {
        let statusMark = task.status ? '[X]' : '[ ]';
        console.log(`${index - 1}. ${statusMark} ${task.name}`);
    });
}
function markTaskAsDone() {
    showSimpleList();
    console.log("Enter task number to mark as done:");
    let taskNumber = parseInt(prompt());
    if (taskNumber >= 1 && taskNumber <= tasks.length) {
        tasks[taskNumber - 1].status = true;
        console.log("Task marked as done.")
    }
}
function deleteTask() {
    showSimpleList();
    console.log("Enter task number to mark as done:");
    let taskNumber = parseInt(prompt());
    if (taskNumber >= 1 && taskNumber <= tasks.length) {
        tasks.splice(taskNumber - 1, 1);
        console.log("Task deleted.");
    }
}
function showTodaysDeadlines() {
    let today = new Date();
    let todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDay() + 1).padStart(2, '0');
    console.log(`Today: ${todayStr}`);
    let todaysTasks = tasks.filter(task => {
        let taskDate = task.deadline.split('-').reverse().join('-');
        return taskDate === todayStr;
    });
    if (todaysTasks.length === 0) {
        console.log("No deadlines for today.");
    } else {
        todaysTasks.forEach((task, index) => {
            let statusMark = task.status ? '[X]' : '[ ]';
            console.log(`${index - 1}. ${statusMark} ${task.name} | priority: ${task.priority} | deadline: ${task.deadline} | queue: ${task.queue}`);
        });
    }
}
function master() {
    let running = true;
    while (running) {
        snowMenu();
        let choice = prompt();
        switch (choice) {
            case '1':
                addTask();
                break;
            case '2':
                showTasks();
                break;
            case '3':
                markTaskAsDone();
                break;
            case '4':
                deleteTask();
                break;
            case '5':
                showTodaysDeadlines();
                break;
            case '6':
                console.log("Goodbye!");
                running = false;
                break;
            default:
            console.log("Error: enter a number from 1 to 6.")
        }
    }
}
master();