# QuickNotes App

QuickNotes is a lightweight, responsive note-taking web app built with HTML, CSS, and vanilla JavaScript. It lets you create notes, assign them to categories, search your collection, and delete notes when they are no longer needed. Notes are stored in your browser using `localStorage`, so they remain available after a refresh on the same browser and device.

## Features

- Add notes with Personal, Work, or Study categories.
- Validate note text so it cannot be empty or longer than 200 characters.
- Search notes by their text or category.
- Delete individual notes.
- Display a correct count for zero, one, or multiple notes.
- Save notes in `localStorage` and restore them after refreshing.
- Show the date and time each note was created.
- Responsive card layout for desktop and mobile screens.
- Safe rendering with DOM methods and `textContent`.

## How to run locally

1. Clone or download this repository.
2. Keep `index.html`, `style.css`, and `script.js` together in the repository root.
3. Open `index.html` in a modern web browser.

For a local development server, you can open the project folder in VS Code and use the Live Server extension, or run a simple server from the project directory:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## What I learned

- How to build a semantic HTML form and connect labels to their inputs.
- How to use CSS Flexbox, card styling, category classes, and media queries to create a responsive interface.
- How to manage an array of note objects and update the page with `querySelector`, `createElement`, and `textContent`.
- How to validate user input and implement add, delete, and search features.
- How to use `JSON.stringify`, `JSON.parse`, and `localStorage` to persist data between page refreshes.
- Why rendering user-provided text with `textContent` is safer than inserting it with `innerHTML`.

## Data and privacy

Notes are stored locally in the browser that you use. They are not uploaded to a server. Clearing browser site data can remove saved notes, and notes do not automatically sync across devices.
