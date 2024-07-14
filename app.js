const tasks = [
    { id: 1, name: 'タスク1' },
    { id: 2, name: 'タスク2' },
    { id: 3, name: 'タスク3' },
    { id: 4, name: 'タスク4' },
    { id: 5, name: 'タスク5' },
    { id: 6, name: 'タスク6' },
    { id: 7, name: 'タスク7' },
    { id: 8, name: 'タスク8' },
    { id: 9, name: 'タスク9' },
    { id: 10, name: 'タスク10' },
];

let activeTask = null;
let taskLog = [];

document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks');
    
    tasks.forEach(task => {
        const button = document.createElement('button');
        button.textContent = task.name;
        button.onclick = () => handleTaskButton(task.id);
        tasksContainer.appendChild(button);
    });

    document.getElementById('export').onclick = exportToCSV;
});

function handleTaskButton(taskId) {
    const now = new Date();
    const jstTime = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    if (activeTask) {
        // 既存のタスクを終了
        taskLog.push({
            taskId: activeTask,
            endTime: jstTime
        });
        deactivateButton(activeTask);
    }

    if (activeTask !== taskId) {
        // 新しいタスクを開始
        activeTask = taskId;
        taskLog.push({
            taskId: taskId,
            startTime: jstTime
        });
        activateButton(taskId);
        updateCurrentTaskDisplay(taskId, jstTime);
    } else {
        activeTask = null;
        updateCurrentTaskDisplay(null, '');
    }

    updateLogDisplay();
}

function activateButton(taskId) {
    const button = document.querySelector(`#tasks button:nth-child(${taskId})`);
    button.classList.add('active');
}

function deactivateButton(taskId) {
    const button = document.querySelector(`#tasks button:nth-child(${taskId})`);
    button.classList.remove('active');
}

function updateCurrentTaskDisplay(taskId, time) {
    const taskNameElement = document.getElementById('current-task-name');
    const taskTimeElement = document.getElementById('current-task-time');

    if (taskId) {
        const taskName = tasks.find(t => t.id === taskId).name;
        taskNameElement.textContent = `現在のタスク: ${taskName}`;
        taskTimeElement.textContent = `開始時刻: ${time}`;
    } else {
        taskNameElement.textContent = 'タスク未選択';
        taskTimeElement.textContent = '';
    }
}

function updateLogDisplay() {
    const logContainer = document.getElementById('log');
    logContainer.innerHTML = taskLog.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId).name;
        return `<p>${task}: ${entry.startTime || ''} - ${entry.endTime || ''}</p>`;
    }).join('');
}

function exportToCSV() {
    const csvContent = 'data:text/csv;charset=utf-8,' + taskLog.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId).name;
        return `${task},${entry.startTime || ''},${entry.endTime || ''}`;
    }).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// PWA設定
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }, error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}