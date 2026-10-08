# QuickNotes Data Model

## Entities

### users
- `id` INTEGER PRIMARY KEY
- `name` TEXT NOT NULL
- `email` TEXT NOT NULL UNIQUE
- `created_at` TEXT NOT NULL

### notes
- `id` INTEGER PRIMARY KEY
- `user_id` INTEGER NOT NULL, FK to `users.id`
- `title` TEXT NOT NULL
- `body` TEXT NOT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

### tags
- `id` INTEGER PRIMARY KEY
- `name` TEXT NOT NULL UNIQUE

### note_tags
- `note_id` INTEGER NOT NULL, FK to `notes.id`
- `tag_id` INTEGER NOT NULL, FK to `tags.id`
- composite primary key: (`note_id`, `tag_id`)

## Relationships

A user can own many notes, while each note belongs to one user: this is a **one-to-many** relationship.

Notes and tags have a **many-to-many** relationship: a note can have many tags and a tag can belong to many notes. `note_tags` is the join table that represents this relationship and prevents duplicate note/tag pairs through its composite primary key.

## SQLite CREATE TABLE statements

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## Example SQL queries

### Notes for one user
```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 7
ORDER BY created_at DESC;
```

### Notes and their owners (JOIN)
```sql
SELECT notes.id, notes.title, users.name AS owner
FROM notes
JOIN users ON notes.user_id = users.id
ORDER BY notes.created_at DESC;
```

### Tags attached to a note
```sql
SELECT tags.name
FROM tags
JOIN note_tags ON tags.id = note_tags.tag_id
WHERE note_tags.note_id = 101;
```

## Index

Add an index on `notes(user_id, created_at)` because listing a user's notes ordered by creation time is a frequent query.

```sql
CREATE INDEX idx_notes_user_created
ON notes(user_id, created_at);
```

## SQL or NoSQL?

I would choose **SQL** because QuickNotes has structured relationships, foreign keys, many-to-many tags, and transactional requirements. SQL constraints protect data integrity and JOINs make related data straightforward to query. NoSQL could scale horizontally well, but its flexible schema is less valuable here than the relational guarantees of SQL.
