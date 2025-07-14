const notesTab = document.getElementById('notes-tab');
const quizzesTab = document.getElementById('quizzes-tab');

const notesSection = document.getElementById('notes-section');
const quizzesSection = document.getElementById('quizzes-section');

const notesContainer = document.getElementById('notes-container');
const addNoteBtn = document.getElementById('add-note-btn');

const quizzesContainer = document.getElementById('quizzes-container');
const addQuizBtn = document.getElementById('add-quiz-btn');

const quizTakingContainer = document.getElementById('quiz-taking-container');

const notesApi = 'http://localhost:3000/notes';
const quizzesApi = 'http://localhost:3000/quizzes';

//  Tab Switching 
notesTab.addEventListener('click', () => {
  notesTab.classList.add('active');
  quizzesTab.classList.remove('active');
  notesSection.classList.add('active');
  quizzesSection.classList.remove('active');
  quizTakingContainer.style.display = 'none';
});

quizzesTab.addEventListener('click', () => {
  quizzesTab.classList.add('active');
  notesTab.classList.remove('active');
  quizzesSection.classList.add('active');
  notesSection.classList.remove('active');
  quizTakingContainer.style.display = 'none';
  fetchQuizzes();
});

// NOTES CRUD 
async function fetchNotes() {
  try {
    const res = await fetch(notesApi);
    const notes = await res.json();
    renderNotes(notes);
  } catch (e) {
    console.error('Error fetching notes:', e);
  }
}

function renderNotes(notes) {
  notesContainer.innerHTML = '';
  if (notes.length === 0) {
    notesContainer.innerHTML = '<p>No notes available.</p>';
    return;
  }
  notes.forEach(note => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    noteEl.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <button class="edit-note-btn">Edit</button>
      <button class="delete-note-btn">Delete</button>
    `;
    notesContainer.appendChild(noteEl);

    noteEl.querySelector('.edit-note-btn').addEventListener('click', () => editNote(note.id));
    noteEl.querySelector('.delete-note-btn').addEventListener('click', () => deleteNote(note.id));
  });
}

addNoteBtn.addEventListener('click', async () => {
  const title = prompt('Enter note title:');
  const content = prompt('Enter note content:');
  if (!title || !content) return alert('Title and content are required.');

  try {
    const res = await fetch(notesApi, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, content })
    });
    if (res.ok) fetchNotes();
  } catch (e) {
    console.error('Error adding note:', e);
  }
});

async function editNote(id) {
  try {
    const res = await fetch(`${notesApi}/${id}`);
    const note = await res.json();
    const newTitle = prompt('Edit title:', note.title);
    const newContent = prompt('Edit content:', note.content);
    if (!newTitle || !newContent) return;

    const updateRes = await fetch(`${notesApi}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: newTitle, content: newContent })
    });
    if (updateRes.ok) fetchNotes();
  } catch (e) {
    console.error('Error editing note:', e);
  }
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  try {
    const res = await fetch(`${notesApi}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchNotes();
  } catch (e) {
    console.error('Error deleting note:', e);
  }
}

// QUIZZES CRUD 
// ============== QUIZZES CRUD (No Choices) ==============
async function fetchQuizzes() {
  try {
    const res = await fetch(quizzesApi);
    const quizzes = await res.json();
    renderQuizzes(quizzes);
  } catch (e) {
    console.error('Error fetching quizzes:', e);
  }
}

function renderQuizzes(quizzes) {
  quizzesContainer.innerHTML = '';
  if (quizzes.length === 0) {
    quizzesContainer.innerHTML = '<p>No quizzes available.</p>';
    return;
  }

  quizzes.forEach(quiz => {
    const quizEl = document.createElement('div');
    quizEl.className = 'quiz';

    let questionsHtml = '';
    if (quiz.questions && quiz.questions.length > 0) {
      questionsHtml = '<ul>';
      quiz.questions.forEach((q, i) => {
        questionsHtml += `<li><strong>Q${i + 1}:</strong> ${q}</li>`;
      });
      questionsHtml += '</ul>';
    } else {
      questionsHtml = '<p><em>No questions added yet.</em></p>';
    }

    quizEl.innerHTML = `
      <h3>${quiz.title}</h3>
      ${questionsHtml}
      <button class="edit-quiz-btn">Edit</button>
      <button class="delete-quiz-btn">Delete</button>
    `;

    quizzesContainer.appendChild(quizEl);

    quizEl.querySelector('.edit-quiz-btn').addEventListener('click', () => editQuiz(quiz.id));
    quizEl.querySelector('.delete-quiz-btn').addEventListener('click', () => deleteQuiz(quiz.id));
  });
}

addQuizBtn.addEventListener('click', async () => {
  const title = prompt('Enter quiz title:');
  if (!title) return alert('Title is required.');

  const questions = [];
  let addMore = true;

  while (addMore) {
    const qText = prompt('Enter question (text only):');
    if (qText) questions.push(qText);
    addMore = confirm('Add another question?');
  }

  try {
    const res = await fetch(quizzesApi, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, questions })
    });
    if (res.ok) fetchQuizzes();
  } catch (e) {
    console.error('Error adding quiz:', e);
  }
});

async function editQuiz(id) {
  try {
    const res = await fetch(`${quizzesApi}/${id}`);
    const quiz = await res.json();
    const newTitle = prompt('Edit quiz title:', quiz.title);
    if (!newTitle) return;

    const questionsText = JSON.stringify(quiz.questions, null, 2);
    const newQuestions = prompt('Edit questions array (as JSON):', questionsText);
    if (!newQuestions) return;

    let questionsParsed;
    try {
      questionsParsed = JSON.parse(newQuestions);
      if (!Array.isArray(questionsParsed)) throw new Error('Must be an array of strings');
    } catch (err) {
      return alert('Invalid JSON: ' + err.message);
    }

    const updateRes = await fetch(`${quizzesApi}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: newTitle, questions: questionsParsed })
    });
    if (updateRes.ok) fetchQuizzes();
  } catch (e) {
    console.error('Error editing quiz:', e);
  }
}

async function deleteQuiz(id) {
  if (!confirm('Delete this quiz?')) return;
  try {
    const res = await fetch(`${quizzesApi}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchQuizzes();
  } catch (e) {
    console.error('Error deleting quiz:', e);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  fetchNotes();
  fetchQuizzes();
});



   
