const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

let notes = [];

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function renderNotes(list) {
  notesList.innerHTML = "";

  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No notes available.";
    notesList.appendChild(emptyItem);
    return;
  }

  list.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id, deleteBtn));

    item.append(title, body, deleteBtn);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  loadBtn.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const response = await fetch(`${API_URL}?_limit=10`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    notes = await response.json();
    renderNotes(notes);
    setStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    console.error(error);
    notes = [];
    renderNotes(notes);
    setStatus("Sorry, we couldn't load the notes. Please try again.", "error");
  } finally {
    loadBtn.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("A title is required.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("Title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitBtn.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const created = await response.json();
    notes.unshift(created);
    renderNotes(notes);
    setStatus(`Note created (status ${response.status}, id ${created.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we couldn't create the note. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteNote(id, deleteBtn) {
  deleteBtn.disabled = true;
  loadBtn.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // JSONPlaceholder simulates DELETE and does not permanently persist this change.
    // We remove the note locally so the UI accurately reflects this successful request.
    notes = notes.filter((note) => note.id !== id);
    renderNotes(notes);
    setStatus(`Note deleted (status ${response.status}).`, "success");
  } catch (error) {
    console.error(error);
    setStatus("Sorry, we couldn't delete the note. Please try again.", "error");
    deleteBtn.disabled = false;
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
