// ========== OWNER AUTH CONFIG ==========
const OWNER_PASSWORD = "@radheradhe";

// ========== DOM ELEMENTS ==========
const loginOverlay = document.getElementById('loginOverlay');
const mainApp = document.getElementById('mainApp');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const guestBtn = document.getElementById('guestBtn');
const loginError = document.getElementById('loginError');
const addNoteBtn = document.getElementById('addNoteBtn');
const logoutBtn = document.getElementById('logoutBtn');
const notesGrid = document.getElementById('notesGrid');
const viewerBadge = document.getElementById('viewerBadge');

// ========== STATE ==========
let notes = [];
let isOwner = false;

// ========== LOCALSTORAGE KEY ==========
const STORAGE_KEY = 'pastel_notes_app';

// ========== INITIAL SETUP ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app');
    loginOverlay.style.display = 'flex';
    mainApp.classList.add('hidden');
    passwordInput.value = '';
    loginError.textContent = '';
    viewerBadge.classList.add('hidden');
    loadNotesFromStorage();
});

// ========== OWNER LOGIN HANDLER ==========
function handleOwnerLogin() {
    console.log('Owner login attempt');
    const entered = passwordInput.value.trim();
    if (entered === OWNER_PASSWORD) {
        console.log('Owner login successful');
        isOwner = true;
        loginOverlay.style.display = 'none';
        mainApp.classList.remove('hidden');
        viewerBadge.classList.add('hidden');
        renderNotes();
        passwordInput.value = '';
        loginError.textContent = '';
    } else {
        console.log('Owner login failed');
        loginError.textContent = '❌ wrong password · try again';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

loginBtn.addEventListener('click', handleOwnerLogin);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleOwnerLogin();
    }
});

// ========== GUEST LOGIN HANDLER ==========
guestBtn.addEventListener('click', function() {
    console.log('Guest login');
    isOwner = false;
    loginOverlay.style.display = 'none';
    mainApp.classList.remove('hidden');
    viewerBadge.classList.remove('hidden');
    renderNotes();
    passwordInput.value = '';
    loginError.textContent = '';
});

// ========== LOGOUT HANDLER ==========
logoutBtn.addEventListener('click', function() {
    console.log('Logout');
    isOwner = false;
    mainApp.classList.add('hidden');
    loginOverlay.style.display = 'flex';
    viewerBadge.classList.add('hidden');
    passwordInput.value = '';
    loginError.textContent = '';
});

// ========== NOTES CORE FUNCTIONS ==========
function loadNotesFromStorage() {
    console.log('Loading notes from storage');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            notes = JSON.parse(stored);
            console.log('Loaded notes:', notes);
        } catch (e) {
            console.error('Error parsing notes:', e);
            notes = [];
        }
    } else {
        console.log('No stored notes, creating defaults');
        notes = [
            { id: '1', text: '🌸 drink more water today\n\nremember to stay hydrated! it helps with skin and energy.' },
            { id: '2', text: '📖 finish anime episode\n\nwatch episode 12 of Spy x Family tonight. Anya is so cute!' },
            { id: '3', text: '🎀 buy strawberry milk\n\nget from the new cafe downtown. they have the best pastries too.' }
        ];
        saveNotesToStorage();
    }
}

function saveNotesToStorage() {
    console.log('Saving notes to storage:', notes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
    console.log('Rendering notes, isOwner:', isOwner);
    if (!notesGrid) {
        console.error('Notes grid not found');
        return;
    }
    
    notesGrid.innerHTML = '';

    if (notes.length === 0) {
        notesGrid.innerHTML = '<div class="no-notes">✨ no notes yet · add one! ✨</div>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.id = note.id;

        const textarea = document.createElement('textarea');
        textarea.className = 'note-text';
        textarea.value = note.text;
        textarea.placeholder = 'write your thought...';
        
        if (!isOwner) {
            textarea.setAttribute('readonly', true);
            textarea.style.minHeight = Math.max(180, Math.min(400, 30 + note.text.length * 0.5)) + 'px';
        }

        if (isOwner) {
            let timeout;
            textarea.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    note.text = e.target.value;
                    saveNotesToStorage();
                }, 400);
            });
            
            textarea.addEventListener('focus', function() {
                this.style.minHeight = Math.max(300, Math.min(600, 50 + this.value.length * 0.8)) + 'px';
            });
            
            textarea.addEventListener('blur', function() {
                this.style.minHeight = Math.max(180, Math.min(400, 30 + this.value.length * 0.5)) + 'px';
            });
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'note-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn edit-btn';
        editBtn.setAttribute('aria-label', 'edit note');
        const editImg = document.createElement('img');
        editImg.src = 'images/edit.png';
        editImg.alt = 'edit';
        editImg.onerror = function() { this.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23906b86%22><path d=%22M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z%22/></svg>'; };
        editBtn.appendChild(editImg);
        
        if (isOwner) {
            editBtn.addEventListener('click', () => {
                textarea.focus();
                textarea.style.minHeight = Math.max(300, Math.min(600, 50 + textarea.value.length * 0.8)) + 'px';
            });
        } else {
            editBtn.disabled = true;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete-btn';
        deleteBtn.setAttribute('aria-label', 'delete note');
        const deleteImg = document.createElement('img');
        deleteImg.src = 'images/delete.png';
        deleteImg.alt = 'delete';
        deleteImg.onerror = function() { this.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23906b86%22><path d=%22M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z%22/></svg>'; };
        deleteBtn.appendChild(deleteImg);
        
        if (isOwner) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('delete this note?')) {
                    notes = notes.filter(n => n.id !== note.id);
                    saveNotesToStorage();
                    renderNotes();
                }
            });
        } else {
            deleteBtn.disabled = true;
        }

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        card.appendChild(textarea);
        card.appendChild(actionsDiv);
        notesGrid.appendChild(card);
    });
}

// ========== ADD NEW NOTE ==========
function addNewNote() {
    console.log('Add new note clicked, isOwner:', isOwner);
    if (!isOwner) {
        console.log('Cannot add note - not owner');
        return;
    }
    
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 8);
    const newNote = {
        id: newId,
        text: '♡ new note...\n\nwrite something cute here...'
    };
    notes.push(newNote);
    saveNotesToStorage();
    renderNotes();

    setTimeout(() => {
        const cards = document.querySelectorAll('.note-card');
        const lastCard = cards[cards.length - 1];
        if (lastCard) {
            const textarea = lastCard.querySelector('.note-text');
            if (textarea) {
                textarea.style.minHeight = '300px';
                textarea.focus();
                textarea.select();
            }
        }
    }, 50);
}

addNoteBtn.addEventListener('click', addNewNote);

// ========== STYLE FOR NO NOTES MESSAGE AND DYNAMIC TEXTAREA ==========
const style = document.createElement('style');
style.textContent = `
    .no-notes {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #b691a8;
        font-size: 1.6rem;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(5px);
        border-radius: 60px;
        border: 2px dashed #ffbfd7;
    }
    
    .note-text {
        transition: min-height 0.3s ease;
        scrollbar-width: thin;
        scrollbar-color: #ffbfd7 #ffeef5;
    }
    
    .note-text::-webkit-scrollbar {
        width: 6px;
    }
    
    .note-text::-webkit-scrollbar-track {
        background: #ffeef5;
        border-radius: 10px;
    }
    
    .note-text::-webkit-scrollbar-thumb {
        background: #ffbfd7;
        border-radius: 10px;
    }
    
    .note-text::-webkit-scrollbar-thumb:hover {
        background: #ffa5c3;
    }
    
    @media (max-width: 767px) {
        .no-notes {
            font-size: 1.3rem;
            padding: 40px 15px;
        }
    }
`;
document.head.appendChild(style);

// ========== DEVICE-SPECIFIC ADJUSTMENTS ==========
function adjustForDevice() {
    const width = window.innerWidth;
    
    if (width < 768) {
        document.body.style.fontSize = '14px';
    } else if (width >= 768 && width < 992) {
        document.body.style.fontSize = '15px';
    } else {
        document.body.style.fontSize = '16px';
    }
}

window.addEventListener('load', adjustForDevice);
window.addEventListener('resize', adjustForDevice);

// ========== FALLBACK FOR IMAGES ==========
function handleImageError(img) {
    if (img.src.includes('notes.png')) {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ffb6c1"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white">📝</text></svg>';
    } else if (img.src.includes('edit.png')) {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23906b86"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    } else if (img.src.includes('delete.png')) {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23906b86"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
    }
}

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() { handleImageError(this); });
});