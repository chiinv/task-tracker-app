const tasks = [
    { id: 1, name: 'タスク1' },
    { id: 2, name: 'タスク2' },
    { id: 3, name: 'タスク3' },
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
    
    if (activeTask) {
        // 既存のタスクを終了
        taskLog.push({
            taskId: activeTask,
            endTime: now.toISOString()
        });
        deactivateButton(activeTask);
    }

    if (activeTask !== taskId) {
        // 新しいタスクを開始
        activeTask = taskId;
        taskLog.push({
            taskId: taskId,
            startTime: now.toISOString()
        });
        activateButton(taskId);
    } else {
        activeTask = null;
    }
}

function activateButton(taskId) {
    const button = document.querySelector(`#tasks button:nth-child(${taskId})`);
    button.style.backgroundColor = '#ccc';
}

function deactivateButton(taskId) {
    const button = document.querySelector(`#tasks button:nth-child(${taskId})`);
    button.style.backgroundColor = '';
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