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

// Pull-to-Refreshを無効にするためのJavaScriptコード
window.addEventListener('load', () => {
    if ('ontouchstart' in window) {
        let lastTouchY = 0;
        let preventPullToRefresh = false;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            lastTouchY = e.touches[0].clientY;
            preventPullToRefresh = window.pageYOffset === 0;
        });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchYDelta = touchY - lastTouchY;
            lastTouchY = touchY;

            if (preventPullToRefresh) {
                preventPullToRefresh = false;
                if (touchYDelta > 0) {
                    e.preventDefault();
                    return;
                }
            }
        }, { passive: false });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks');
    
    tasks.forEach(task => {
        const button = document.createElement('button');
        button.textContent = task.name;
        button.onclick = (event) => {
            event.preventDefault(); // ボタンを押してもスクロールされないようにする
            handleTaskButton(task.id);
        };
        tasksContainer.appendChild(button);
    });

    document.getElementById('export').onclick = exportToCSV;
    document.getElementById('reset').onclick = () => location.reload(); // リセットボタンの動作を追加

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            const updateNotification = document.createElement('div');
                            updateNotification.innerHTML = `
                                <div style="position: fixed; bottom: 10px; right: 10px; background: #ff9800; color: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
                                    新しいバージョンがあります。<button id="reload">更新</button>
                                </div>
                            `;
                            document.body.appendChild(updateNotification);

                            document.getElementById('reload').addEventListener('click', () => {
                                installingWorker.postMessage({ action: 'skipWaiting' });
                            });
                        }
                    }
                };
            };
        });
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }
});

function handleTaskButton(taskId) {
    const now = new Date();
    const jstTime = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    if (activeTask) {
        // 既存のタスクを終了
        taskLog.push({
            taskId: activeTask,
            time: jstTime,
            action: '終了'
        });
        deactivateButton(activeTask);
    }

    if (activeTask !== taskId) {
        // 新しいタスクを開始
        activeTask = taskId;
        taskLog.push({
            taskId: taskId,
            time: jstTime,
            action: '開始'
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
        return `<p>${task}: ${entry.time} - ${entry.action}</p>`;
    }).join('');
}

function exportToCSV() {
    const csvHeader = 'タスク名,ボタン押下時刻,開始/終了\n';
    const csvContent = taskLog.map(entry => {
        const task = tasks.find(t => t.id === entry.taskId).name;
        return `${task},${entry.time},${entry.action}`;
    }).join('\n');
    
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvHeader + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}