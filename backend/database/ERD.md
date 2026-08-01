# DuoFest Database Design (MySQL)

Logical ERD. All tables use a big-integer surrogate primary key (`id`) unless
noted. Public resources additionally expose a `uuid` (char(36), unique, indexed)
so IDs are never leaked in URLs or tickets. Foreign keys are inlined with the
`foreignId(...)->constrained()` helpers in the migrations; on-delete behaviour is
shown below each relationship.

## Mermaid ER diagram

```mermaid
erDiagram
    COLLEGES ||--o{ USERS : "has"
    COLLEGES ||--o{ EVENTS : "hosts"
    COLLEGES ||--o{ ANNOUNCEMENTS : "publishes"

    EVENT_CATEGORIES ||--o{ EVENTS : "classifies"

    USERS ||--o{ EVENTS : "organizes"
    USERS ||--o{ REGISTRATIONS : "registers"
    USERS ||--o{ VOLUNTEERS : "volunteers"
    USERS ||--o{ ATTENDANCE : "attends"
    USERS ||--o{ CERTIFICATES : "earns"
    USERS ||--o{ ANNOUNCEMENTS : "authors"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ USERS : "checked_in_by"
    USERS ||--o{ USERS : "assigned_by"

    EVENTS ||--o{ REGISTRATIONS : "has"
    EVENTS ||--o{ VOLUNTEERS : "needs"
    EVENTS ||--o{ ATTENDANCE : "records"
    EVENTS ||--o{ ANNOUNCEMENTS : "announces"

    REGISTRATIONS ||--o{ CERTIFICATES : "grants"
    REGISTRATIONS ||--o{ ATTENDANCE : "links"

    ROLES ||--o{ ROLE_HAS_PERMISSIONS : "grants"
    PERMISSIONS ||--o{ ROLE_HAS_PERMISSIONS : "granted_to"
    USERS ||--o{ MODEL_HAS_ROLES : "assigned"
    ROLES ||--o{ MODEL_HAS_ROLES : "to_users"
    USERS ||--o{ MODEL_HAS_PERMISSIONS : "direct"
    PERMISSIONS ||--o{ MODEL_HAS_PERMISSIONS : "direct_to_users"

    COLLEGES {
        bigint id PK
        char36 uuid UK
        string name
        string code UK
        boolean is_active
    }
    EVENT_CATEGORIES {
        bigint id PK
        char36 uuid UK
        string name
        string slug UK
        boolean is_active
    }
    USERS {
        bigint id PK
        char36 uuid UK
        string email UK
        string firebase_uid UK
        string phone UK
        bigint college_id FK
        boolean is_active
    }
    EVENTS {
        bigint id PK
        char36 uuid UK
        bigint college_id FK
        bigint organizer_id FK
        bigint event_category_id FK
        string slug UK
        string status
        timestamp starts_at
    }
    REGISTRATIONS {
        bigint id PK
        char36 uuid UK
        bigint event_id FK
        bigint user_id FK
        string ticket_number UK
        string status
        bigint checked_in_by FK
    }
    VOLUNTEERS {
        bigint id PK
        char36 uuid UK
        bigint event_id FK
        bigint user_id FK
        bigint assigned_by FK
        string status
        decimal hours_volunteered
    }
    ATTENDANCE {
        bigint id PK
        char36 uuid UK
        bigint event_id FK
        bigint user_id FK
        bigint registration_id FK
        bigint checked_in_by FK
        timestamp attended_at
    }
    CERTIFICATES {
        bigint id PK
        char36 uuid UK
        bigint registration_id FK
        bigint user_id FK
        string certificate_number UK
        string status
    }
    ANNOUNCEMENTS {
        bigint id PK
        char36 uuid UK
        bigint college_id FK
        bigint event_id FK
        bigint created_by FK
        boolean is_published
    }
    NOTIFICATIONS {
        char36 id PK
        string type
        string notifiable_type
        bigint notifiable_id
        timestamp read_at
    }
    ROLES {
        bigint id PK
        string name
        string guard_name
    }
    PERMISSIONS {
        bigint id PK
        string name
        string guard_name
    }
    ROLE_HAS_PERMISSIONS {
        bigint role_id PK,FK
        bigint permission_id PK,FK
    }
    MODEL_HAS_ROLES {
        bigint role_id PK,FK
        string model_type
        bigint model_id PK
    }
    MODEL_HAS_PERMISSIONS {
        bigint permission_id PK,FK
        string model_type
        bigint model_id PK
    }
```

## Tables

### users
- PK `id`; UK `email`, `firebase_uid`, `phone`, `uuid`.
- `college_id` FK → `colleges.id`, `ON DELETE SET NULL` (keep accounts if the college goes away).
- `is_active` + `blocked_at` gate access via the `EnsureUserIsActive` middleware.
- Spatie assigns roles/permissions through `model_has_roles` / `model_has_permissions`.

### roles, permissions, role_has_permissions, model_has_roles, model_has_permissions
Spatie `laravel-permission` tables, seeded with the `api` guard. Kept stock.

### colleges
- PK `id`; UK `code`, `uuid`; index `city`.
- 1:N with `users`, `events`, `announcements`.

### event_categories
- PK `id`; UK `slug`, `uuid`; index `(is_active, sort_order)`.
- 1:N with `events` (nullable FK, `ON DELETE SET NULL`).

### events
- PK `id`; UK `slug`, `uuid`; index `status`, `(college_id, status)`, `(starts_at, ends_at)`, `event_category_id`.
- `college_id` FK → `colleges` `ON DELETE CASCADE`.
- `organizer_id` FK → `users` `ON DELETE SET NULL`.
- `event_category_id` FK → `event_categories` `ON DELETE SET NULL`.
- `status` enum values: draft, published, upcoming, live, completed, cancelled.
- `registration_count` is a cached counter maintained by `RegistrationService`.

### registrations
- PK `id`; UK `ticket_number`, `uuid`, composite `(event_id, user_id)`.
- `event_id` FK → `events` `ON DELETE CASCADE`; `user_id` FK → `users` `ON DELETE CASCADE`.
- `checked_in_by` FK → `users` `ON DELETE SET NULL`.
- Composite unique `(event_id, user_id)` enforces one registration per attendee.
- `status` enum values: pending, confirmed, checked_in, cancelled, refunded.

### volunteers
- PK `id`; UK `uuid`, composite `(event_id, user_id)`.
- `event_id` FK → `events` `ON DELETE CASCADE`; `user_id` FK → `users` `ON DELETE CASCADE`.
- `assigned_by` FK → `users` `ON DELETE SET NULL`.
- `status` enum values: assigned, accepted, completed, cancelled.
- Replaces the old `volunteer_slots` + `volunteer_slot_user` pair: one normalized
  row per (event, user) carries the role, shift window and hours worked.

### attendance
- PK `id`; UK `uuid`, composite `(event_id, user_id)`.
- `event_id`/`user_id` FK → `events`/`users` `ON DELETE CASCADE`.
- `registration_id` FK → `registrations` `ON DELETE SET NULL` (optional ticket link).
- `checked_in_by` FK → `users` `ON DELETE SET NULL`.
- `status` enum values: present, late, excused.

### certificates
- PK `id`; UK `certificate_number`, `uuid`.
- `registration_id` FK → `registrations` `ON DELETE CASCADE` (certificate lives with its registration).
- `user_id` FK → `users` `ON DELETE CASCADE` (convenience denormalization for "my certificates").
- `status` enum values: issued, revoked.

### announcements
- PK `id`; UK `uuid`.
- `college_id` / `event_id` nullable FKs → `colleges` / `events` `ON DELETE SET NULL`.
  NULLs mean the announcement targets the whole platform or the other scope.
- `created_by` FK → `users` `ON DELETE SET NULL`.
- `type` enum values: info, warning, important, update.

### notifications
- PK `id` (uuid, no auto-increment).
- Canonical Laravel database-notification table; `notifiable` is a polymorphic FK
  (morph `notifiable_type`/`notifiable_id`) pointing at `users`.

### activity_logs
- PK `id`; index `type`, `(subject_type, subject_id)`, `(causer_id, type)`.
- `subject` is polymorphic (any model that uses `LogsActivity`).
- `causer_id` FK → `users` `ON DELETE SET NULL`; audit trail for model + request events.

## Design rules applied

- **Normalization**: no duplicated FK columns except the two documented
  denormalizations (`certificates.user_id`, `events.registration_count`) which
  exist for query performance and are maintained by the service layer.
- **Foreign keys**: declared on every cross-table reference with explicit
  `ON DELETE` behaviour.
- **Indexes**: every FK is indexed; every `WHERE`/`ORDER BY`/`JOIN` column used by
  the app has a covering index; composite indexes mirror actual query patterns.
- **UUIDs**: `uuid` on every public resource so routes and tickets can reference
  records without leaking sequential IDs.
