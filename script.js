// --- 1. GLOBAL STATE DEFINITIONS ---
let currentTab = 'all-notes';
let mediaRecorder;
let audioChunks = [];
let currentUser = "";

// --- 2. DOM ELEMENT BINDINGS ---
const authOverlay = document.getElementById('auth-overlay');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const displayUser = document.getElementById('display-user');

const micBtn = document.getElementById('mic-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTextArea = document.getElementById('note-text');
const notesList = document.getElementById('notes-list');

const createListBtn = document.getElementById('create-list-btn');
const newListTitleInput = document.getElementById('new-list-title');
const boardsContainer = document.getElementById('boards-container');

// --- 3. LIFECYCLE INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    if (createListBtn) createListBtn.addEventListener('click', handleCreateList);
    if (newListTitleInput) {
        newListTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCreateList();
        });
    }

    const sessionUser = localStorage.getItem('notely_active_user');
    if (sessionUser) initializeDashboard(sessionUser);
});

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        if (!user) return alert("Please type a workspace identifier.");
        localStorage.setItem('notely_active_user', user);
        initializeDashboard(user);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('notely_active_user');
        location.reload();
    });
}

function initializeDashboard(user) {
    currentUser = user;
    if (displayUser) displayUser.textContent = user;
    if (authOverlay) {
        authOverlay.style.opacity = '0';
        setTimeout(() => authOverlay.style.display = 'none', 300);
    }
    loadUserData();
}

// --- 4. DATA PERSISTENCE LAYER ---
function loadUserData() {
    if (!notesList || !boardsContainer) return;
    notesList.innerHTML = "";
    boardsContainer.innerHTML = "";

    const notes = JSON.parse(localStorage.getItem(`notely_notes_${currentUser}`)) || [];
    notes.forEach(note => renderNoteCardDOM(note.text, note.type, note.id));

    const boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    boards.forEach(board => renderBoardDOM(board.title, board.id, board.tasks));

    applyNotesFilter();
}

// --- 5. CATEGORY LIST CONTROLLER ---
function handleCreateList() {
    const title = newListTitleInput.value.trim();
    if (!title) return alert("Please enter a category title first!");
    
    const boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    const newBoard = { id: Date.now().toString(), title, tasks: [] };
    
    boards.push(newBoard);
    localStorage.setItem(`notely_boards_${currentUser}`, JSON.stringify(boards));
    
    renderBoardDOM(newBoard.title, newBoard.id, []);
    newListTitleInput.value = "";
}

function deleteBoardFromStorage(boardId) {
    let boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    boards = boards.filter(b => b.id !== boardId);
    localStorage.setItem(`notely_boards_${currentUser}`, JSON.stringify(boards));
}

// --- 6. TASK MANAGER OPERATIONS ---
function saveTaskToBoardStorage(boardId, taskText) {
    let boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    const newTask = { id: Date.now().toString(), text: taskText, completed: false };
    boards = boards.map(b => b.id === boardId ? { ...b, tasks: [...b.tasks, newTask] } : b);
    localStorage.setItem(`notely_boards_${currentUser}`, JSON.stringify(boards));
    return newTask;
}

function updateTaskInBoardStorage(boardId, taskId, fieldsToUpdate) {
    let boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    boards = boards.map(b => {
        if (b.id === boardId) {
            const updatedTasks = b.tasks.map(t => t.id === taskId ? { ...t, ...fieldsToUpdate } : t);
            return { ...b, tasks: updatedTasks };
        }
        return b;
    });
    localStorage.setItem(`notely_boards_${currentUser}`, JSON.stringify(boards));
}

function deleteTaskFromBoardStorage(boardId, taskId) {
    let boards = JSON.parse(localStorage.getItem(`notely_boards_${currentUser}`)) || [];
    boards = boards.map(b => b.id === boardId ? { ...b, tasks: b.tasks.filter(t => t.id !== taskId) } : b);
    localStorage.setItem(`notely_boards_${currentUser}`, JSON.stringify(boards));
}

function renderBoardDOM(title, boardId, tasks) {
    const board = document.createElement('div');
    board.classList.add('board-column');
    board.setAttribute('data-board-id', boardId);
    board.innerHTML = `
        <h4><span>${title}</span> <button class="delete-board-btn">✕</button></h4>
        <div class="task-input-box">
            <input type="text" placeholder="Add task...">
            <button class="btn btn-primary">+</button>
        </div>
        <ul class="modern-todo-list"></ul>
    `;

    const listUl = board.querySelector('.modern-todo-list');
    const taskInput = board.querySelector('.task-input-box input');
    const addTaskBtn = board.querySelector('.task-input-box button');

    if (tasks) tasks.forEach(t => renderTaskDOM(listUl, boardId, t));

    const handleAddTask = () => {
        const text = taskInput.value.trim();
        if (!text) return;
        const taskObj = saveTaskToBoardStorage(boardId, text);
        renderTaskDOM(listUl, boardId, taskObj);
        taskInput.value = "";
    };

    addTaskBtn.onclick = handleAddTask;
    taskInput.onkeypress = (e) => { if(e.key === 'Enter') handleAddTask(); };

    board.querySelector('.delete-board-btn').onclick = () => {
        deleteBoardFromStorage(boardId);
        board.remove();
    };

    boardsContainer.appendChild(board);
}

function renderTaskDOM(targetUl, boardId, taskObj) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    if(taskObj.completed) li.classList.add('completed');

    li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${taskObj.completed ? 'checked' : ''}>
        <span class="task-text">${taskObj.text}</span>
        <div class="card-actions">
            <button class="edit-task-btn">✏️</button>
            <button class="delete-task-btn">✕</button>
        </div>
    `;

    const checkbox = li.querySelector('.task-checkbox');
    const taskSpan = li.querySelector('.task-text');
    const editTaskBtn = li.querySelector('.edit-task-btn');
    const delTaskBtn = li.querySelector('.delete-task-btn');

    checkbox.onchange = () => {
        const checked = checkbox.checked;
        li.classList.toggle('completed', checked);
        updateTaskInBoardStorage(boardId, taskObj.id, { completed: checked });
    };

    editTaskBtn.onclick = () => {
        const isEditing = taskSpan.getAttribute('contenteditable') === 'true';
        if(!isEditing) {
            taskSpan.setAttribute('contenteditable', 'true');
            taskSpan.focus();
            editTaskBtn.textContent = '💾';
        } else {
            taskSpan.setAttribute('contenteditable', 'false');
            updateTaskInBoardStorage(boardId, taskObj.id, { text: taskSpan.textContent.trim() });
            editTaskBtn.textContent = '✏️';
        }
    };

    delTaskBtn.onclick = () => {
        deleteTaskFromBoardStorage(boardId, taskObj.id);
        li.remove();
    };

    targetUl.appendChild(li);
}

// --- 7. TEXT & CLOUDINARY CLOUD AUDIO ENGINE ---
function saveNoteToStorage(text, type) {
    const notes = JSON.parse(localStorage.getItem(`notely_notes_${currentUser}`)) || [];
    const newNote = { id: Date.now().toString(), text, type };
    notes.push(newNote);
    localStorage.setItem(`notely_notes_${currentUser}`, JSON.stringify(notes));
    renderNoteCardDOM(newNote.text, newNote.type, newNote.id);
}

function updateNoteInStorage(id, newText) {
    let notes = JSON.parse(localStorage.getItem(`notely_notes_${currentUser}`)) || [];
    notes = notes.map(n => n.id === id ? { ...n, text: newText } : n);
    localStorage.setItem(`notely_notes_${currentUser}`, JSON.stringify(notes));
}

function deleteNoteFromStorage(id) {
    let notes = JSON.parse(localStorage.getItem(`notely_notes_${currentUser}`)) || [];
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(`notely_notes_${currentUser}`, JSON.stringify(notes));
}

if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
        const text = noteTextArea.value.trim();
        if (!text) return;
        saveNoteToStorage(text, 'text');
        noteTextArea.value = "";
        applyNotesFilter();
    });
}

if (micBtn) {
    micBtn.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const options = { mimeType: 'audio/webm;codecs=opus' };
                mediaRecorder = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? new MediaRecorder(stream, options)
                    : new MediaRecorder(stream);
                
                audioChunks = [];
                mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
                
                mediaRecorder.onstop = async () => {
                    micBtn.innerHTML = `⚙️ Processing Audio...`;
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        micBtn.innerHTML = `☁️ Uploading to Cloud...`;
                        try {
                            const res = await fetch('/.netlify/functions/upload-audio', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ audio: reader.result })
                            });
                            
                            if (!res.ok) throw new Error(`HTTP Error Status ${res.status}`);
                            
                            const data = await res.json();
                            if (data.url) {
                                // Save the secure Cloudinary link permanently inside local storage!
                                saveNoteToStorage(data.url, 'voice');
                            } else {
                                alert("Cloudinary rejected upload. Check serverless logs.");
                            }
                        } catch (err) {
                            console.error("Cloudinary submission error:", err);
                            alert("Upload failed. If testing on your computer, ensure you run 'netlify dev' in your terminal.");
                        }
                        micBtn.innerHTML = `🎤 Record Audio`;
                        micBtn.classList.remove('recording');
                        applyNotesFilter();
                    };
                };

                mediaRecorder.start();
                micBtn.innerHTML = `🛑 Stop & Save`;
                micBtn.classList.add('recording');
            } catch (err) { alert("Microphone access denied."); }
        } else { mediaRecorder.stop(); }
    });
}

function renderNoteCardDOM(text, type, id) {
    const card = document.createElement('div');
    card.classList.add('note-card');
    card.setAttribute('data-type', type);
    card.setAttribute('data-id', id);
    
    let bodyContent = type === 'text' 
        ? `<p class="editable-text" data-id="${id}">${text}</p>` 
        : `<p>🎙️ Voice Memo Note</p><audio controls src="${text}"></audio>`;

    card.innerHTML = `
        ${bodyContent}
        <div class="card-actions">
            ${type === 'text' ? `<button class="edit-btn">✏️</button>` : ''}
            <button class="delete-btn">✕</button>
        </div>
    `;

    if(type === 'text') {
        const pElement = card.querySelector('.editable-text');
        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const isEditing = pElement.getAttribute('contenteditable') === 'true';
            if(!isEditing) {
                pElement.setAttribute('contenteditable', 'true');
                pElement.focus();
                editBtn.textContent = '💾';
            } else {
                pElement.setAttribute('contenteditable', 'false');
                updateNoteInStorage(id, pElement.textContent.trim());
                editBtn.textContent = '✏️';
            }
        });
    }

    card.querySelector('.delete-btn').onclick = () => {
        deleteNoteFromStorage(id);
        card.remove();
    };

    notesList.appendChild(card);
}

// --- 8. APP TAB ROUTER ---
function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.nav-menu .nav-item').forEach(btn => btn.classList.remove('active'));
    
    const targetedBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (targetedBtn) targetedBtn.classList.add('active');

    const notesWorkspace = document.getElementById('notes-workspace');
    const todoWorkspace = document.getElementById('todo-workspace-view');
    
    if (tabId === 'todo-list-tab') {
        if (notesWorkspace) notesWorkspace.style.display = 'none';
        if (todoWorkspace) todoWorkspace.style.display = 'block';
    } else {
        if (notesWorkspace) notesWorkspace.style.display = 'block';
        if (todoWorkspace) todoWorkspace.style.display = 'none';
        
        const wsTitle = document.getElementById('workspace-title');
        if (wsTitle) wsTitle.textContent = tabId.replace('-', ' ').toUpperCase();
        applyNotesFilter();
    }
}

function applyNotesFilter() {
    document.querySelectorAll('.note-card').forEach(card => {
        const type = card.getAttribute('data-type');
        if (currentTab === 'all-notes' || (currentTab === 'text-notes' && type === 'text') || (currentTab === 'voice-notes' && type === 'voice')) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}