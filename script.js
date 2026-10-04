const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const emptyState = document.querySelector("#empty-state");

const STORAGE_KEY = "quicknotes-app-notes";
const validCategories = ["personal", "work", "study"];

let notes = loadNotes();

function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (!savedNotes) return [];

    const parsedNotes = JSON.parse(savedNotes);
    if (!Array.isArray(parsedNotes)) return [];

    // Keep only notes with the fields and categories this app supports.
    return parsedNotes.filter((note) =>
      note &&
      (typeof note.id === "string" || typeof note.id === "number") &&
      typeof note.text === "string" &&
      typeof note.createdAt === "string" &&
      validCategories.includes(note.category)
    );
  } catch (error) {
    console.error("Could not load saved notes:", error);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Could not save notes:", error);
    showError("Your notes could not be saved in this browser.");
  }
}

function showError(message = "") {
  errorMessage.textContent = message;
}

function updateCount(count) {
  if (count === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (count === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${count} notes.`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query) ||
    note.category.toLowerCase().includes(query)
  );

  // Rebuild the list safely using DOM methods and textContent.
  notesList.replaceChildren();

  for (const note of visibleNotes) {
    const item = document.createElement("li");
    item.classList.add("note-card", `category-${note.category}`);

    const topRow = document.createElement("div");
    topRow.classList.add("note-card-top");

    const badge = document.createElement("span");
    badge.classList.add("category-badge");
    badge.textContent = note.category;

    const date = document.createElement("time");
    date.classList.add("note-date");
    date.dateTime = note.createdAt;
    date.textContent = formatDate(note.createdAt);

    topRow.append(badge, date);

    const text = document.createElement("p");
    text.classList.add("note-text");
    text.textContent = note.text;

    const actions = document.createElement("div");
    actions.classList.add("note-actions");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete note: ${note.text}`);
    deleteButton.addEventListener("click", () => deleteNote(note.id));

    actions.append(deleteButton);
    item.append(topRow, text, actions);
    notesList.append(item);
  }

  updateCount(notes.length);

  if (notes.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = query
      ? "You have no notes yet. Add your first note above."
      : "No notes yet. Add your first note above.";
  } else if (visibleNotes.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = "No notes match your search.";
  } else {
    emptyState.hidden = true;
  }
}

function addNote(text, category) {
  const cleanedText = text.trim();

  if (cleanedText.length === 0) {
    showError("Please enter a note before adding it.");
    noteInput.focus();
    return;
  }

  if (cleanedText.length > 200) {
    showError("Your note must be 200 characters or fewer.");
    noteInput.focus();
    return;
  }

  if (!validCategories.includes(category)) {
    showError("Please choose a valid category.");
    return;
  }

  const note = {
    id: (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: cleanedText,
    category,
    createdAt: new Date().toISOString()
  };

  notes.unshift(note);
  saveNotes();
  noteForm.reset();
  showError("");
  render();
  noteInput.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  showError("");
  render();
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addNote(noteInput.value, noteCategory.value);
});

searchInput.addEventListener("input", render);

// Initial render displays saved notes after the page loads.
render();
