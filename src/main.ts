interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

const noteTitleInput = document.getElementById('noteTitleInput') as HTMLInputElement;
const noteContentInput = document.getElementById('noteContentInput') as HTMLTextAreaElement;
const saveNoteButton = document.getElementById('saveNoteButton') as HTMLButtonElement;
const notesListContainer = document.getElementById('notesList') as HTMLDivElement;
const noNotesMessage = document.getElementById('noNotesMessage') as HTMLParagraphElement;
const messageBox = document.getElementById('messageBox') as HTMLDivElement;

let notes: Note[] = [];
let editingNoteId: string | null = null;

const LOCAL_STORAGE_NOTES_KEY = 'typescript-notes-app';

function generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function showMessage(message: string, type: 'success' | 'error'): void {
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;
    setTimeout(() => {
        messageBox.classList.remove('show');
        messageBox.classList.remove(type);
    }, 5000);
}

function saveNotes(): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notes));
        showMessage('Notes saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving notes to local storage:', error);
        showMessage('Failed to save notes. Storage might be full or inaccessible.', 'error');
    }
}

function loadNotes(): void {
    try {
        const storedNotes = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
        if (storedNotes) {
            const parsedNotes = JSON.parse(storedNotes) as Note[];
            notes = parsedNotes.filter(note =>
                typeof note.id === 'string' &&
                typeof note.title === 'string' &&
                typeof note.content === 'string' &&
                typeof note.createdAt === 'string' &&
                typeof note.updatedAt === 'string'
            );
        }
    } catch (error) {
        console.error('Error loading notes from local storage:', error);
        showMessage('Failed to load notes. Your saved data might be corrupted.', 'error');
        notes = [];
    }
}

function renderNoteCard(note: Note): void {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.dataset.noteId = note.id;

    noteCard.innerHTML = `
        <div class="note-header">
            <h3 class="note-title">${note.title || 'Untitled Note'}</h3>
            <span class="note-date">Created: ${formatDate(note.createdAt)}</span>
        </div>
        <p class="note-content">${note.content}</p>
        <span class="note-date text-right">Updated: ${formatDate(note.updatedAt)}</span>
        <div class="note-actions">
            <button class="action-button edit" data-id="${note.id}">Edit</button>
            <button class="action-button delete" data-id="${note.id}">Delete</button>
        </div>
    `;

    const editButton = noteCard.querySelector('.action-button.edit') as HTMLButtonElement;
    const deleteButton = noteCard.querySelector('.action-button.delete') as HTMLButtonElement;

    editButton.addEventListener('click', () => editNote(note.id));
    deleteButton.addEventListener('click', () => deleteNote(note.id));

    notesListContainer.prepend(noteCard);
}

function renderNotes(): void {
    notesListContainer.innerHTML = '';

    if (notes.length === 0) {
        noNotesMessage.style.display = 'block';
    } else {
        noNotesMessage.style.display = 'none';
        const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        sortedNotes.forEach(note => renderNoteCard(note));
    }
}

function saveNote(): void {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title && !content) {
        showMessage('Please enter a title or content for your note.', 'error');
        return;
    }

    const now = new Date().toISOString();

    if (editingNoteId) {
        const noteIndex = notes.findIndex(note => note.id === editingNoteId);
        if (noteIndex > -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title,
                content: content,
                updatedAt: now,
            };
            showMessage('Note updated successfully!', 'success');
        }
        editingNoteId = null;
        saveNoteButton.textContent = 'Save Note';
    } else {
        const newNote: Note = {
            id: generateUniqueId(),
            title: title,
            content: content,
            createdAt: now,
            updatedAt: now,
        };
        notes.push(newNote);
        showMessage('Note added successfully!', 'success');
    }

    saveNotes();
    clearForm();
    renderNotes();
}

function editNote(id: string): void {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        noteTitleInput.value = noteToEdit.title;
        noteContentInput.value = noteToEdit.content;
        editingNoteId = id;
        saveNoteButton.textContent = 'Update Note';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function deleteNote(id: string): void {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
    showMessage('Note deleted successfully!', 'success');
    if (editingNoteId === id) {
        clearForm();
        editingNoteId = null;
        saveNoteButton.textContent = 'Save Note';
    }
}

function clearForm(): void {
    noteTitleInput.value = '';
    noteContentInput.value = '';
}

saveNoteButton.addEventListener('click', saveNote);

window.addEventListener('load', () => {
    loadNotes();
    renderNotes();
});
