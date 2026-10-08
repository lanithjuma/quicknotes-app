# QuickNotes Architecture

## Functional requirements

- Users can create, read, update, and delete notes.
- Users can list and filter their notes.
- Users can add tags to notes.
- The API validates input, including a required title with a maximum length of 100 characters.
- Authentication and authorization protect private notes.
- The system records creation and update timestamps.
- Background work such as notifications and search indexing can run asynchronously.

## Non-functional requirements

- High availability with no single application-server failure taking down the service.
- Low latency for common read operations.
- Horizontal scalability for application servers and workers.
- Strong data integrity for note ownership and relationships.
- HTTPS, authentication, authorization, validation, rate limiting, and secure database access.
- Monitoring, logging, backups, retry handling, and disaster recovery.

## Load estimate for 1 million users

Assumptions:
- 1,000,000 registered users.
- 10% daily active users = 100,000 DAU.
- Each active user reads 20 note/feed pages per day.
- Each active user creates 1 note per day.
- Average stored note data including metadata/index allowance: 4 KB.
- 365 days/year and 5x peak traffic.

### Reads

`100,000 × 20 = 2,000,000 reads/day`

Average: `2,000,000 / 86,400 ≈ 23 reads/second`

Peak: `23 × 5 ≈ 116 reads/second`

### Writes

`100,000 × 1 = 100,000 writes/day`

Average: `100,000 / 86,400 ≈ 1.16 writes/second`

Peak: `1.16 × 5 ≈ 5.8 writes/second`

### Storage

`100,000 × 4 KB = 400,000 KB ≈ 0.4 GB/day`

`0.4 GB × 365 ≈ 146 GB/year`

Planning estimate: **23 reads/s average (116 peak), 1.16 writes/s average (5.8 peak), and about 146 GB/year of note data.** Backups, replicas, logs, indexes, and future attachments require additional capacity.

## Architecture diagram

```text
                           ┌──────────────────┐
                           │      Client      │
                           │ Browser / Mobile │
                           └────────┬─────────┘
                                    │
                           ┌────────▼─────────┐
                           │       DNS        │
                           └────────┬─────────┘
                                    │
                           ┌────────▼─────────┐
                           │       CDN        │
                           └────────┬─────────┘
                                    │
                           ┌────────▼─────────┐
                           │  Load Balancer   │
                           └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
             ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
             │ App Server 1│ │ App Server 2│ │ App Server N│
             └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
                    └───────────────┼───────────────┘
                                    │
                           ┌────────▼─────────┐
                           │      Cache       │
                           └────────┬─────────┘
                                    │
                           ┌────────▼─────────┐
                           │   Primary DB     │
                           │      Writes      │
                           └────────┬─────────┘
                                    │ replication
                           ┌────────▼─────────┐
                           │   Read Replica   │
                           │      Reads       │
                           └──────────────────┘

                    asynchronous background work
                                    │
                           ┌────────▼─────────┐
                           │      Queue       │
                           └────────┬─────────┘
                                    │
                           ┌────────▼─────────┐
                           │      Worker      │
                           └──────────────────┘
```

## Component responsibilities

- **Client:** Provides the user interface and sends API requests.
- **DNS:** Maps the service domain to the appropriate network entry point.
- **CDN:** Serves cacheable static assets close to users and reduces origin traffic.
- **Load balancer:** Distributes requests across healthy app servers.
- **App servers:** Run authentication, validation, authorization, business logic, and API handlers.
- **Cache:** Keeps frequently requested note data available without querying the database every time.
- **Primary database:** Stores authoritative relational data and handles writes.
- **Read replica:** Serves eligible read queries to increase read capacity.
- **Queue:** Decouples slow, non-critical background work from user requests.
- **Worker:** Processes queued jobs such as notifications or search indexing.

## GET /notes flow

1. The client requests `GET /api/v1/notes`.
2. DNS resolves the service domain.
3. The CDN serves suitable cached content or forwards the request.
4. The load balancer selects a healthy app server.
5. The app server authenticates and validates the request.
6. The app server checks the cache.
7. On a cache hit, the cached notes are returned.
8. On a cache miss, the app server queries the read replica.
9. The result is placed in the cache with an appropriate TTL.
10. The response is returned to the client.

## POST /notes flow

1. The client sends `POST /api/v1/notes` with title and body.
2. DNS, CDN, and load balancer route the request to a healthy app server.
3. The app server authenticates and authorizes the user.
4. The server validates the title and request body.
5. The new note is written transactionally to the primary database.
6. Related cache entries are invalidated or refreshed.
7. Non-critical work is placed on the queue.
8. A worker processes the queued job independently.
9. The API returns `201 Created` with the new note.

## Trade-offs

### Cache vs freshness

Caching improves latency and reduces database load, but data can become stale; use TTLs and targeted invalidation after writes.

### Read replica vs consistency

Read replicas increase read capacity but can lag behind the primary; route consistency-sensitive reads to the primary when necessary.

### Queue vs immediate processing

Queues make API requests faster and background work independently scalable, but jobs are not completed immediately and need retries/monitoring.

### CDN vs control

A CDN reduces latency and origin traffic, but cache rules and invalidation add complexity; private note data should not be publicly cached.

## Avoiding single points of failure

At least two app servers sit behind the load balancer, so one application instance can fail without stopping the service. Health checks remove unhealthy servers from rotation. The primary database should have automated backups and a tested failover strategy, while the read replica provides additional read capacity. Queue and worker capacity should also be deployed redundantly so one worker failure does not stop background processing. Cache and infrastructure components should use highly available/replicated configurations where supported.
