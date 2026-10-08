# QuickNotes REST API Design

This is the production API design the backend team should build; JSONPlaceholder is only the practice API used by the browser client.

## Endpoint table

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/api/v1/notes` | List the authenticated user's notes with pagination. | 200 OK |
| GET | `/api/v1/notes/{id}` | Get one note owned by or visible to the authenticated user. | 200 OK |
| POST | `/api/v1/notes` | Create a new note. | 201 Created |
| PUT | `/api/v1/notes/{id}` | Replace an existing note. | 200 OK |
| PATCH | `/api/v1/notes/{id}` | Partially update an existing note. | 200 OK |
| DELETE | `/api/v1/notes/{id}` | Delete a note. | 204 No Content |
| GET | `/api/v1/notes?tag={tag}` | List notes matching a tag. | 200 OK |

## Create note

Request:
```json
{
  "title": "Meeting notes",
  "body": "Discuss the project timeline.",
  "tagIds": [2, 5]
}
```

Response (`201 Created`):
```json
{
  "id": 101,
  "userId": 7,
  "title": "Meeting notes",
  "body": "Discuss the project timeline.",
  "tagIds": [2, 5],
  "createdAt": "2026-10-09T08:30:00Z",
  "updatedAt": "2026-10-09T08:30:00Z"
}
```

## List notes

Request:
```http
GET /api/v1/notes?limit=10&offset=0
```

Response (`200 OK`):
```json
{
  "items": [
    {
      "id": 101,
      "userId": 7,
      "title": "Meeting notes",
      "body": "Discuss the project timeline.",
      "tagIds": [2, 5],
      "createdAt": "2026-10-09T08:30:00Z",
      "updatedAt": "2026-10-09T08:30:00Z"
    }
  ],
  "limit": 10,
  "offset": 0,
  "total": 1
}
```

## Error codes

- **400 Bad Request:** invalid input, such as a missing title or title longer than 100 characters.
- **401 Unauthorized:** no valid authentication credentials were supplied.
- **403 Forbidden:** the authenticated user is not allowed to modify the requested note.
- **404 Not Found:** the requested note does not exist.
- **500 Internal Server Error:** an unexpected server-side failure occurred.

Example error body:
```json
{
  "error": {
    "code": 404,
    "message": "Note not found.",
    "requestId": "req_12345"
  }
}
```
