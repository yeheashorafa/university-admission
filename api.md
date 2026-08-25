# API Reference — University Admission Backend

> **Audience:** Frontend developers. No prior backend knowledge required.
> **Base URL:** `https://your-api-host/api/v1`
> **Version:** v1
> **Last updated:** 2026-08-13

---

## 1. Overview

### 1.1 Base URL and versioning

All endpoints live under `/api/v1/`. There is only one version right now. If a future v2 is introduced, it will appear under `/api/v2/`.

### 1.2 Authentication mechanism

This API uses **JWT bearer tokens** provided by `php-open-source-saver/jwt-auth`.

- **Header format:** `Authorization: Bearer {token}`
- The token is obtained from `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.
- Tokens expire after `expires_in` seconds (default 3600 = 1 hour).
- When a token is about to expire, call `POST /api/v1/auth/refresh` to get a new one without forcing the user to log in again.
- On logout, call `POST /api/v1/auth/logout` to invalidate the current token.

### 1.3 Response envelope convention

| Response type                     | Shape                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Auth endpoints**                | `{ "data": { access_token, token_type, expires_in, verified, verification_method, user } }`    |
| **Non-auth endpoints**            | `{ "success": true/false, "message": string?, "data": T, "errors"?: array }`                   |
| **Paginated list**                | `{ "success": true, "data": { "data": [...], "links": {...}, "meta": {...} } }`                |
| **No content (204)**              | Raw `null` with no envelope body                                                               |
| **Validation error (422)**        | `{ "success": false, "message": "Validation failed.", "data": null, "errors": { ... } }`       |
| **Auth error (401)**              | `{ "success": false, "message": "Unauthorized.", "data": null, "errors": null }`               |
| **Forbidden (403)**               | `{ "success": false, "message": "Forbidden.", "data": null, "errors": null }`                  |
| **Not found (404)**               | `{ "success": false, "message": "Not found.", "data": null, "errors": null }`                  |
| **Server error (500)**            | `{ "success": false, "message": "Server error.", "data": null, "errors": null }`               |

> **Note:** Auth endpoints (`register`, `login`, `refresh`, `logout`, `me`) return raw `JsonResource` instances, which Laravel wraps in `{ "data": ... }`. All other endpoints use `ApiResponse`, which returns `{ "success": true/false, "message": ..., "data": ... }`.

### 1.4 Rate limiting

| Group                                               | Limit            |
| --------------------------------------------------- | ---------------- |
| `POST /api/v1/auth/register`                        | 10/min           |
| `POST /api/v1/auth/login`                           | 10/min           |
| `POST /api/v1/auth/email/verification-notification` | 5/min            |
| `POST /api/v1/auth/email/verify/{id}/{hash}`        | 5/min (IP-based) |
| `GET /api/health`                                   | 60/min           |
| All other authenticated endpoints                   | 60/min           |

Rate-limited responses return HTTP 429. Rate limiting is IP-based for unauthenticated endpoints and user/IP-based for authenticated endpoints.

### 1.5 Pagination

All `index`/list endpoints return **paginated** results unless explicitly noted otherwise. The response shape follows Laravel's default:

```json
{
  "data": [ ... ],
  "links": {
    "first": "http://...?page=1",
    "last": "http://...?page=5",
    "prev": null,
    "next": "http://...?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "http://...",
    "per_page": 20,
    "to": 20,
    "total": 100
  }
}
```

Default page size is 20. Some endpoints hardcode `paginate(20)`.

### 1.6 Dates and times

All timestamps returned by the API are **ISO 8601** strings (e.g. `"2026-01-15T10:00:00Z"`). Use `toDateString()` for date-only fields (e.g. `starts_at` on admission cycles).

### 1.7 Security

- **CORS:** Configured via `config/cors.php` with `CORS_ALLOWED_ORIGINS` environment variable. Only specified origins receive `Access-Control-Allow-Origin` headers. Wildcard (`*`) is not used in non-production environments where a specific origin is configured.
- **Rate limiting:** 10 req/min on auth endpoints, 60 req/min on all other authenticated endpoints via `throttle` middleware.
- **JWT:** HS256 algorithm with 1-hour TTL. Tokens expired or invalid return 401.
- **Password hashing:** bcrypt with 12 rounds.

---

## 2. Authentication Flow

### 2.1 Register

**Endpoint:** `POST /api/v1/auth/register`

A new user is created with the `student` role automatically assigned. No email verification is performed.

**Request body:**

| Field                   | Type   | Required | Rules                                        | Description                                     |
| ----------------------- | ------ | -------- | -------------------------------------------- | ----------------------------------------------- |
| `name`                  | string | Yes      | required, string, max:255                    | Full name                                       |
| `email`                 | string | Yes      | required, email, max:255, unique:users,email | Email address                                   |
| `phone`                 | string | Yes      | required, string, max:20, unique:users,phone | Phone number (e.g. `+201234567890`)             |
| `national_id`           | string | Yes      | required, string, max:20                     | National ID (used for Tawjihi matching)         |
| `password`              | string | Yes      | required, confirmed, min:8                   | Password (must include `password_confirmation`) |
| `password_confirmation` | string | Yes      | required, string, min:8                      | Must match `password`                           |

**Example request:**

```json
{
    "name": "Ahmed Khaled",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "password": "securePass123",
    "password_confirmation": "securePass123"
}
```

**Success response (200):**

```json
{
    "data": {
        "message": null,
        "access_token": "eyJ0...",
        "token_type": "Bearer",
        "expires_in": 3600,
        "verified": true,
        "verification_method": "email",
        "user": {
            "id": 1,
            "name": "Ahmed Khaled",
            "email": "ahmed@example.com",
            "phone": "+201234567890",
            "is_verified": true,
            "is_active": true,
            "role": {
                "id": 1,
                "name": "student",
                "guard_name": "web"
            },
            "personal_information": null,
            "social_information": null,
            "addresses": [],
            "emergency_contacts": [],
            "secondary_school_records": [],
            "documents": [],
            "created_at": "2026-01-15T10:00:00Z",
            "updated_at": "2026-01-15T10:00:00Z"
        }
    }
}
```

**Error responses:**

- `422` — validation failure (e.g. email already taken)
- `429` — too many register attempts

### 2.2 Login

**Endpoint:** `POST /api/v1/auth/login`

**Request body:**

| Field      | Type   | Required | Rules           | Description      |
| ---------- | ------ | -------- | --------------- | ---------------- |
| `email`    | string | Yes      | required, email | Registered email |
| `password` | string | Yes      | required        | Password         |

**Example request:**

```json
{
    "email": "ahmed@example.com",
    "password": "securePass123"
}
```

**Success response (200):** Same shape as register, wrapped in `{ "data": ... }`.

**Error responses:**

- `401` — `{ "message": "Invalid credentials." }`
- `429` — too many login attempts

### 2.3 Get current user (me)

**Endpoint:** `GET /api/v1/auth/me`

Requires a valid bearer token.

**Success response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "is_active": true,
    "role": {
      "id": 1,
      "name": "student",
      "guard_name": "web"
    },
    "personal_information": { ... },
    "social_information": { ... },
    "addresses": [],
    "emergency_contacts": [],
    "secondary_school_records": [],
    "documents": [],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

Note: `personal_information`, `social_information`, `addresses`, `emergency_contacts`, `secondary_school_records`, and `documents` are only populated if the controller explicitly loaded them. The `me` endpoint always loads all of these.

**Error responses:**

- `401` — missing or expired token

### 2.4 Refresh token

**Endpoint:** `POST /api/v1/auth/refresh`

Requires a valid (non-revoked) bearer token. Returns a new token with a fresh expiry.

**Success response (200):** Same shape as register/login, wrapped in `{ "data": ... }`.

**Error responses:**

- `401` — token expired or already revoked

### 2.5 Logout

**Endpoint:** `POST /api/v1/auth/logout`

Invalidates the current JWT token on the server side.

**Success response (200):**

```json
{
    "data": {
        "message": "Successfully logged out.",
        "access_token": null,
        "token_type": null,
        "expires_in": null,
        "verified": false,
        "verification_method": null,
        "user": null
    }
}
```

**Error responses:**

- `401` — missing or invalid token

### 2.6 Typical frontend flow

1. User enters credentials → call `POST /api/v1/auth/login`.
2. Store `access_token` in secure storage (e.g. httpOnly cookie or secure storage).
3. On app load, if a token exists, call `GET /api/v1/auth/me` to validate it and retrieve the user's `role`.
4. Route to the correct dashboard based on `role`.
5. Before the token expires, call `POST /api/v1/auth/refresh` to extend the session.
6. On logout, call `POST /api/v1/auth/logout` and clear stored token.

---

## 3. Endpoint Reference

### 3.1 Public (no auth required)

#### 3.1.1 List admission cycles

| Property          | Value                                 |
| ----------------- | ------------------------------------- |
| **Method + URL**  | `GET /api/v1/public/admission-cycles` |
| **Route name**    | `v1.public.admission-cycles.index`    |
| **Auth required** | No                                    |

**Query parameters:**

| Field | Type    | Required | Description                                                              |
| ----- | ------- | -------- | ------------------------------------------------------------------------ |
| `all` | boolean | No       | If `true`, returns all cycles including inactive ones. Default: `false`. |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name": "Fall 2026",
            "academic_year": "2026-2027",
            "semester": "first",
            "starts_at": "2026-09-01",
            "ends_at": "2027-01-31",
            "is_active": true,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

**Notes:** Cached for 1 hour (`public.admission_cycles`). By default only returns active cycles whose date range includes today.

---

#### 3.1.2 List faculties

| Property          | Value                          |
| ----------------- | ------------------------------ |
| **Method + URL**  | `GET /api/v1/public/faculties` |
| **Route name**    | `v1.public.faculties.index`    |
| **Auth required** | No                             |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name_en": "Engineering",
            "name_ar": "الهندسة",
            "description_en": "Faculty of Engineering",
            "description_ar": "كلية الهندسة",
            "is_active": true,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

**Notes:** Cached for 1 hour (`public.faculties`). Only active faculties.

---

#### 3.1.3 List departments in a faculty

| Property          | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/public/faculties/{faculty}/departments` |
| **Route name**    | `v1.public.faculties.departments.index`              |
| **Auth required** | No                                                   |

**Path parameters:**

| Field     | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| `faculty` | integer | Faculty ID (route-model-bound) |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "faculty_id": 1,
            "name_en": "Computer Science",
            "name_ar": "علوم الحاسوب",
            "description_en": "Department of Computer Science",
            "description_ar": "قسم علوم الحاسوب",
            "is_active": true,
            "programs": [],
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

**Notes:** Cached for 1 hour. Only active departments.

---

#### 3.1.4 List programs in a department

| Property          | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Method + URL**  | `GET /api/v1/public/departments/{department}/programs` |
| **Route name**    | `v1.public.departments.programs.index`                 |
| **Auth required** | No                                                     |

**Path parameters:**

| Field        | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| `department` | integer | Department ID (route-model-bound) |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "department_id": 1,
            "name_en": "Computer Science",
            "name_ar": "علوم الحاسوب",
            "description_en": null,
            "description_ar": "برنامج أكاديمي",
            "minimum_average": 70.0,
            "is_active": true,
            "branches": [],
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

**Notes:** Cached for 1 hour. Only active programs.

---

#### 3.1.5 Show a program

| Property          | Value                                   |
| ----------------- | --------------------------------------- |
| **Method + URL**  | `GET /api/v1/public/programs/{program}` |
| **Route name**    | `v1.public.programs.show`               |
| **Auth required** | No                                      |

**Path parameters:**

| Field     | Type    | Description                    |
| --------- | ------- | ------------------------------ |
| `program` | integer | Program ID (route-model-bound) |

**Success response (200):**

```json
{
    "data": {
        "id": 1,
        "department_id": 1,
        "name_en": "Computer Science",
        "name_ar": "علوم الحاسوب",
        "description_en": null,
        "description_ar": "برنامج أكاديمي",
        "minimum_average": 70.0,
        "is_active": true,
        "branches": [
            {
                "id": 1,
                "name": "Scientific",
                "name_en": "Scientific",
                "name_ar": "العلمي",
                "is_active": true,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
        ],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }
}
```

---

#### 3.1.6 List document types

| Property          | Value                               |
| ----------------- | ----------------------------------- |
| **Method + URL**  | `GET /api/v1/public/document-types` |
| **Route name**    | `v1.public.document-types.index`    |
| **Auth required** | No                                  |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name": "transcript",
            "display_name_en": "Academic Transcript",
            "display_name_ar": "كشف الدرجات",
            "description": null,
            "is_required": true,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

**Notes:** Cached for 1 hour (`public.document_types`).

---

### 3.2 Authentication

#### 3.2.1 Register

| Property          | Value                        |
| ----------------- | ---------------------------- |
| **Method + URL**  | `POST /api/v1/auth/register` |
| **Route name**    | `v1.auth.register`           |
| **Auth required** | No                           |
| **Rate limit**    | 10/min                       |

See section 2.1 for full details.

---

#### 3.2.2 Login

| Property          | Value                     |
| ----------------- | ------------------------- |
| **Method + URL**  | `POST /api/v1/auth/login` |
| **Route name**    | `v1.auth.login`           |
| **Auth required** | No                        |
| **Rate limit**    | 10/min                    |

See section 2.2 for full details.

---

#### 3.2.3 Get current user

| Property          | Value                        |
| ----------------- | ---------------------------- |
| **Method + URL**  | `GET /api/v1/auth/me`        |
| **Route name**    | `v1.auth.me`                 |
| **Auth required** | Yes (any authenticated role) |

See section 2.3 for full details.

---

#### 3.2.4 Refresh token

| Property          | Value                          |
| ----------------- | ------------------------------ |
| **Method + URL**  | `POST /api/v1/auth/refresh`    |
| **Route name**    | `v1.auth.refresh`              |
| **Auth required** | Yes (valid, non-revoked token) |

See section 2.4 for full details.

---

#### 3.2.5 Logout

| Property          | Value                      |
| ----------------- | -------------------------- |
| **Method + URL**  | `POST /api/v1/auth/logout` |
| **Route name**    | `v1.auth.logout`           |
| **Auth required** | Yes                        |

See section 2.5 for full details.

---

### 3.3 Student

All student endpoints require the `auth:api` and `active` middleware. The route middleware enforces `role:student`. Additionally, the underlying policies restrict access to the student's own records.

#### 3.3.1 Dashboard

| Property          | Value                           |
| ----------------- | ------------------------------- |
| **Method + URL**  | `GET /api/v1/student/dashboard` |
| **Route name**    | `v1.student.dashboard.index`    |
| **Auth required** | Yes (student)                   |

**Success response (200):**

```json
{
  "user": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "is_active": true,
    "role": {
      "id": 1,
      "name": "student",
      "guard_name": "web"
    },
    "personal_information": { ... },
    "social_information": { ... },
    "addresses": [],
    "emergency_contacts": [],
    "secondary_school_records": [],
    "documents": [],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  },
  "statistics": {
    "total_applications": 2,
    "total_documents": 3,
    "pending_applications": 1,
    "under_review_applications": 1,
    "returned_for_revision_applications": 0,
    "accepted_applications": 0,
    "rejected_applications": 1
  },
  "applications": [],
  "documents": [],
  "admission_cycles": []
}
```

**Notes:** The `statistics` object only contains student-scoped counts. System-wide fields like `total_users`, `total_programs`, etc. are intentionally excluded.

---

#### 3.3.2 Notifications — index

| Property          | Value                               |
| ----------------- | ----------------------------------- |
| **Method + URL**  | `GET /api/v1/student/notifications` |
| **Route name**    | `v1.student.notifications.index`    |
| **Auth required** | Yes (student)                       |

**Success response (200, paginated):**

```json
{
  "data": [
    {
      "id": 1,
      "type": "application_status",
      "message": "Application Submitted",
      "data": {
        "application_id": 1,
        "old_status": "draft",
        "new_status": "submitted",
        "body": "Your application #APP-00000001 status has changed from draft to submitted."
      },
      "read_at": null,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

#### 3.3.3 Notifications — mark as read

| Property          | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/student/notifications/{notification}/read` |
| **Route name**    | `v1.student.notifications.read`                           |
| **Auth required** | Yes (student)                                             |

**Path parameters:**

| Field          | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (200):**

```json
{
  "id": 1,
  "type": "application_status",
  "message": "Application Submitted",
  "data": { ... },
  "read_at": "2026-01-15T10:05:00Z",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:05:00Z"
}
```

**Error responses:**

- `403` — notification belongs to another student
- `404` — notification not found

---

#### 3.3.4 Notifications — mark all as read

| Property          | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/student/notifications/read-all` |
| **Route name**    | `v1.student.notifications.read-all`            |
| **Auth required** | Yes (student)                                  |

**Success response (200):**

```json
{
    "message": "All notifications marked as read."
}
```

---

#### 3.3.5 Notifications — delete

| Property          | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/student/notifications/{notification}` |
| **Route name**    | `v1.student.notifications.destroy`                    |
| **Auth required** | Yes (student)                                         |

**Path parameters:**

| Field          | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (204):** No body.

**Error responses:**

- `403` — notification belongs to another student
- `404` — notification not found

---

#### 3.3.6 Profile — get

| Property          | Value                         |
| ----------------- | ----------------------------- |
| **Method + URL**  | `GET /api/v1/student/profile` |
| **Route name**    | `v1.student.profile.index`    |
| **Auth required** | Yes (student)                 |

**Success response (200):**

```json
{
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "is_active": true,
    "role": {
        "id": 1,
        "name": "student",
        "guard_name": "web"
    },
    "personal_information": {
        "national_id": "1234567890123",
        "first_name_ar": "أحمد",
        "father_name_ar": "محمد",
        "grandfather_name_ar": "علي",
        "family_name_ar": "خليل",
        "gender": "male",
        "nationality": "Palestinian",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    },
    "social_information": {
        "birth_place": "inside_palestine",
        "birth_date": "2000-01-01",
        "first_name_en": "Ahmed",
        "father_name_en": "Mohamed",
        "grandfather_name_en": "Ali",
        "family_name_en": "Khalil",
        "guardian_name": "محمد محمود الخطيب",
        "guardian_national_id": "1234567890123",
        "guardian_relationship": "father",
        "guardian_profession": "teacher",
        "guardian_workplace": "unrwa",
        "guardian_phone": "0597653447",
        "governorate": "Ramallah",
        "city": "Ramallah",
        "neighborhood": "Center",
        "street": "Main Street",
        "phone_landline": "021234567",
        "father_status": "alive",
        "father_is_working": true,
        "mother_is_working": false,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    },
    "addresses": [
        {
            "id": 1,
            "type": "current",
            "governorate": "Ramallah",
            "address_line": "Main Street 123",
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ],
    "emergency_contacts": [
        {
            "id": 1,
            "name": "Mohamed Khaled",
            "relationship": "Father",
            "phone": "+201234567890",
            "is_primary": true,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ],
    "secondary_school_records": [],
    "documents": [],
    "applications": [],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
}
```

**Error responses:**

- `401` — unauthenticated
- `403` — policy forbids viewing another user's profile

---

#### 3.3.7 Profile — update

| Property          | Value                         |
| ----------------- | ----------------------------- |
| **Method + URL**  | `PUT /api/v1/student/profile` |
| **Route name**    | `v1.student.profile.update`   |
| **Auth required** | Yes (student)                 |

**Request body:**

| Field                                      | Type    | Required    | Rules                                                                  | Description                |
| ------------------------------------------ | ------- | ----------- | ---------------------------------------------------------------------- | -------------------------- |
| `name`                                     | string  | No          | nullable, string, max:255                                              | Full name                  |
| `phone`                                    | string  | No          | nullable, string, max:20                                               | Phone number               |
| `personal_information`                     | array   | No          | nullable, array                                                        | Personal info object       |
| `personal_information.national_id`         | string  | No          | nullable, string, max:20, unique:user_personal_information,national_id | National ID                |
| `personal_information.first_name_ar`       | string  | No          | nullable, string, max:255                                              | Arabic first name          |
| `personal_information.father_name_ar`      | string  | No          | nullable, string, max:255                                              | Arabic father's name       |
| `personal_information.grandfather_name_ar` | string  | No          | nullable, string, max:255                                              | Arabic grandfather's name  |
| `personal_information.family_name_ar`      | string  | No          | nullable, string, max:255                                              | Arabic family name         |
| `personal_information.gender`              | string  | No          | nullable, in:male,female                                               | Gender                     |
| `personal_information.nationality`         | string  | No          | nullable, string, max:255                                              | Nationality                |
| `addresses`                                | array   | No          | nullable, array                                                        | List of addresses          |
| `addresses.*.type`                         | string  | Conditional | required_with:addresses, in:current,permanent                          | Address type               |
| `addresses.*.governorate`                  | string  | Conditional | required_with:addresses, string, max:255                               | Governorate                |
| `addresses.*.address_line`                 | string  | Conditional | required_with:addresses, string                                        | Full address line          |
| `emergency_contacts`                       | array   | No          | nullable, array                                                        | List of emergency contacts |
| `emergency_contacts.*.name`                | string  | Conditional | required_with:emergency_contacts, string, max:255                      | Contact name               |
| `emergency_contacts.*.relationship`        | string  | Conditional | required_with:emergency_contacts, string, max:255                      | Relationship               |
| `emergency_contacts.*.phone`               | string  | Conditional | required_with:emergency_contacts, string, max:20                       | Phone number               |
| `emergency_contacts.*.is_primary`          | boolean | No          | nullable, boolean                                                      | Is primary contact         |

**Example request:**

```json
{
    "name": "Ahmed Khaled Updated",
    "personal_information": {
        "national_id": "1234567890123",
        "first_name_ar": "أحمد",
        "father_name_ar": "محمد",
        "grandfather_name_ar": "علي",
        "family_name_ar": "خليل",
        "gender": "male",
        "nationality": "Palestinian"
    },
    "addresses": [
        {
            "type": "current",
            "governorate": "Ramallah",
            "address_line": "Main Street 123"
        }
    ],
    "emergency_contacts": [
        {
            "name": "Mohamed Khaled",
            "relationship": "Father",
            "phone": "+201234567890",
            "is_primary": true
        }
    ]
}
```

**Success response (200):** Same shape as profile get.

**Error responses:**

- `422` — validation failure
- `403` — policy forbids updating another user's profile

---

#### 3.3.8 Social Information — get

| Property          | Value                                    |
| ----------------- | ---------------------------------------- |
| **Method + URL**  | `GET /api/v1/student/social-information` |
| **Route name**    | `v1.student.social-information.show`     |
| **Auth required** | Yes (student)                            |

**Success response (200):**

```json
{
    "birth_place": "inside_palestine",
    "birth_date": "2000-01-01",
    "first_name_en": "Ahmed",
    "father_name_en": "Mohamed",
    "grandfather_name_en": "Ali",
    "family_name_en": "Khalil",
    "guardian_name": "محمد محمود الخطيب",
    "guardian_national_id": "1234567890123",
    "guardian_relationship": "father",
    "guardian_profession": "teacher",
    "guardian_workplace": "unrwa",
    "guardian_phone": "0597653447",
    "governorate": "Ramallah",
    "city": "Ramallah",
    "neighborhood": "Center",
    "street": "Main Street",
    "phone_landline": "021234567",
    "father_status": "alive",
    "father_is_working": true,
    "mother_is_working": false,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
}
```

**Error responses:**

- `401` — unauthenticated
- `403` — policy forbids accessing another user's social information

---

#### 3.3.9 Social Information — update

| Property          | Value                                    |
| ----------------- | ---------------------------------------- |
| **Method + URL**  | `PUT /api/v1/student/social-information` |
| **Route name**    | `v1.student.social-information.update`   |
| **Auth required** | Yes (student)                            |

**Request body:**

| Field                   | Type    | Required | Rules                                                                                                                                                                                                                                                                                                     | Description                |
| ----------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `birth_place`           | string  | No       | nullable, enum: inside_palestine, outside_palestine                                                                                                                                                                                                                                                       | Birth place                |
| `birth_date`            | date    | No       | nullable, date                                                                                                                                                                                                                                                                                            | Date of birth              |
| `first_name_en`         | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | English first name         |
| `father_name_en`        | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | English father's name      |
| `grandfather_name_en`   | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | English grandfather's name |
| `family_name_en`        | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | English family name        |
| `guardian_name`         | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | Guardian full name         |
| `guardian_national_id`  | string  | No       | nullable, string, max:20                                                                                                                                                                                                                                                                                  | Guardian national ID       |
| `guardian_relationship` | string  | No       | nullable, enum: father, mother, brother, sister, paternal_uncle, maternal_uncle, grandfather, other                                                                                                                                                                                                       | Relationship to guardian   |
| `guardian_profession`   | string  | No       | nullable, enum: government_employee, unrwa_employee, private_sector, merchant, craftsman, teacher, military, unemployed, retired, other                                                                                                                                                                   | Guardian profession        |
| `guardian_workplace`    | string  | No       | nullable, enum: ministry_of_health, ministry_of_education, ministry_of_interior, ministry_of_finance, ministry_of_social_affairs, ministry_of_awqaf, ministry_of_justice, ministry_of_public_works, ministry_of_agriculture, ministry_of_transportation, unrwa, private_sector, ngo, self_employed, other | Guardian workplace         |
| `guardian_phone`        | string  | No       | nullable, string, max:20                                                                                                                                                                                                                                                                                  | Guardian phone             |
| `governorate`           | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | Governorate                |
| `city`                  | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | City                       |
| `neighborhood`          | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | Neighborhood               |
| `street`                | string  | No       | nullable, string, max:255                                                                                                                                                                                                                                                                                 | Street                     |
| `phone_landline`        | string  | No       | nullable, string, max:20                                                                                                                                                                                                                                                                                  | Landline phone             |
| `father_status`         | string  | No       | nullable, in: alive, deceased, abandoned                                                                                                                                                                                                                                                                  | Father status              |
| `father_is_working`     | boolean | No       | nullable, boolean                                                                                                                                                                                                                                                                                         | Whether father is working  |
| `mother_is_working`     | boolean | No       | nullable, boolean                                                                                                                                                                                                                                                                                         | Whether mother is working  |

**Example request:**

```json
{
    "guardian_name": "محمد محمود الخطيب",
    "guardian_relationship": "father",
    "guardian_profession": "teacher",
    "guardian_workplace": "unrwa",
    "guardian_phone": "0597653447",
    "birth_place": "inside_palestine",
    "birth_date": "2000-01-01",
    "first_name_en": "Ahmed",
    "father_name_en": "Mohamed",
    "grandfather_name_en": "Ali",
    "family_name_en": "Khalil",
    "governorate": "Ramallah",
    "city": "Ramallah",
    "father_status": "alive",
    "father_is_working": true,
    "mother_is_working": false
}
```

**Success response (200):** Same shape as social information get.

**Error responses:**

- `422` — validation failure
- `403` — policy forbids updating another user's social information

---

#### 3.3.10 Applications — index

| Property          | Value                              |
| ----------------- | ---------------------------------- |
| **Method + URL**  | `GET /api/v1/student/applications` |
| **Route name**    | `v1.student.applications.index`    |
| **Auth required** | Yes (student)                      |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "admission_cycle_id": 1,
            "program_id": 1,
            "application_number": "APP-00000001",
            "status": "draft",
            "student_notes": null,
            "decision_reason": null,
            "assigned_reviewer_id": null,
            "reviewed_by": null,
            "submitted_at": null,
            "reviewed_at": null,
            "applicant": {
                "id": 1,
                "name": "Ahmed Khaled",
                "email": "ahmed@example.com",
                "phone": "+201234567890",
                "is_verified": true,
                "is_active": true,
                "role": { "id": 1, "name": "student", "guard_name": "web" },
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z"
            },
            "admission_cycle": {
                "id": 1,
                "name": "Fall 2026",
                "academic_year": "2026-2027",
                "semester": "first",
                "starts_at": "2026-09-01",
                "ends_at": "2027-01-31",
                "is_active": true,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            },
            "program": {
                "id": 1,
                "department_id": 1,
                "name_en": "Computer Science",
                "name_ar": "علوم الحاسوب",
                "description_en": null,
                "description_ar": "برنامج أكاديمي",
                "minimum_average": 70.0,
                "is_active": true,
                "branches": [],
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            },
            "assigned_reviewer": null,
            "reviewer": null,
            "created_at": "2026-01-15T10:00:00Z",
            "updated_at": "2026-01-15T10:00:00Z"
        }
    ]
}
```

**Notes:** Returns all applications belonging to the authenticated student. Paginated (default 20 per page).

---

#### 3.3.11 Applications — create draft

| Property          | Value                               |
| ----------------- | ----------------------------------- |
| **Method + URL**  | `POST /api/v1/student/applications` |
| **Route name**    | `v1.student.applications.store`     |
| **Auth required** | Yes (student)                       |

**Request body:**

| Field                 | Type    | Required | Rules                                 | Description                                             |
| --------------------- | ------- | -------- | ------------------------------------- | ------------------------------------------------------- |
| `application_type_id` | integer | Yes      | required, exists:application_types,id | Application type (e.g. new admission, diploma transfer) |
| `admission_cycle_id`  | integer | Yes      | required, exists:admission_cycles,id  | Admission cycle ID                                      |
| `program_id`          | integer | No       | nullable, exists:programs,id          | Preferred program ID                                    |
| `student_notes`       | string  | No       | nullable, string, max:1000            | Optional notes                                          |

**Example request:**

```json
{
    "application_type_id": 1,
    "admission_cycle_id": 1,
    "program_id": 3,
    "student_notes": "I am interested in the evening schedule."
}
```

**Success response (201):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "admission_cycle_id": 1,
    "program_id": 3,
    "application_number": "APP-00000001",
    "status": "draft",
    "student_notes": "I am interested in the evening schedule.",
    "decision_reason": null,
    "assigned_reviewer_id": null,
    "reviewed_by": null,
    "submitted_at": null,
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": null,
    "reviewer": null,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Error responses:**

- `422` — validation failure (e.g. missing `application_type_id`)
- `422` — active application uniqueness violation: `"You already have an active application for this program in the selected admission cycle."` on both `admission_cycle_id` and `program_id`
- `403` — policy forbids creation (inactive student)

---

#### 3.3.12 Applications — show detail

| Property          | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Method + URL**  | `GET /api/v1/student/applications/{application}` |
| **Route name**    | `v1.student.applications.show`                   |
| **Auth required** | Yes (student)                                    |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Success response (200):**

```json
{
  "data": {
    "id": 1,
    "application_number": "APP-00000001",
    "status": "draft",
    "student_notes": null,
    "decision_reason": null,
    "submitted_at": null,
    "reviewed_at": null,
    "applicant": {
      "id": 1,
      "name": "Ahmed Khaled",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "is_verified": true,
      "is_active": true,
      "role": { "id": 1, "name": "student", "guard_name": "web" },
      "personal_information": { ... },
      "social_information": { ... },
      "addresses": [],
      "emergency_contacts": [],
      "secondary_school_records": [],
      "documents": [],
      "applications": [],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    },
    "admission_cycle": { ... },
    "selected_program": { ... },
    "assigned_reviewer": null,
    "reviewer": null,
    "uploaded_documents": [],
    "secondary_school_records": [],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Error responses:**

- `403` — application does not belong to the authenticated student
- `404` — application not found

---

#### 3.3.13 Applications — update

| Property          | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Method + URL**  | `PUT /api/v1/student/applications/{application}` |
| **Route name**    | `v1.student.applications.update`                 |
| **Auth required** | Yes (student)                                    |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field           | Type    | Required | Rules                        | Description              |
| --------------- | ------- | -------- | ---------------------------- | ------------------------ |
| `program_id`    | integer | No       | nullable, exists:programs,id | New preferred program ID |
| `student_notes` | string  | No       | nullable, string, max:1000   | Updated notes            |

**Example request:**

```json
{
    "program_id": 5,
    "student_notes": "Changed my mind about the program."
}
```

**Success response (200):** Returns `ApplicationResource` (see 3.3.9 for shape).

**Error responses:**

- `422` — validation failure
- `403` — application cannot be updated (not in `draft` or `returned_for_revision` status, or does not belong to student)
- `404` — application not found

**Notes:** Applications can only be updated when in `draft` or `returned_for_revision` status.

---

#### 3.3.14 Applications — submit

| Property          | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/student/applications/{application}/submit` |
| **Route name**    | `v1.student.applications.submit`                         |
| **Auth required** | Yes (student)                                            |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "admission_cycle_id": 1,
    "program_id": 3,
    "application_number": "APP-00000001",
    "status": "submitted",
    "student_notes": null,
    "decision_reason": null,
    "assigned_reviewer_id": null,
    "reviewed_by": null,
    "submitted_at": "2026-01-15T10:30:00Z",
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": null,
    "reviewer": null,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:30:00Z"
  }
}
```

**Error responses:**

- `422` — required documents missing:
    ```json
    {
        "message": "Missing required documents.",
        "missing": ["Transcript", "ID Copy"]
    }
    ```
- `403` — policy forbids submission (not in `draft` or `returned_for_revision`, or not the owner)
- `404` — application not found

**Notes:** This endpoint validates that all required document types (`document_types.is_required = true`) have at least one attached document via `application_documents` whose `status` is not `rejected`. The application status changes from `draft` or `returned_for_revision` to `submitted`.

---

#### 3.3.15 Applications — document checklist

| Property          | Value                                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/student/applications/{application}/document-checklist` |
| **Route name**    | `v1.student.applications.document-checklist`                        |
| **Auth required** | Yes (student)                                                       |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name": "transcript",
            "is_required": true,
            "satisfied": false
        },
        {
            "id": 2,
            "name": "id_copy",
            "is_required": true,
            "satisfied": true
        },
        {
            "id": 3,
            "name": "recommendation_letter",
            "is_required": false,
            "satisfied": true
        }
    ]
}
```

**Notes:** `satisfied` is `true` when the application has at least one attached document of that type whose `status` is not `rejected`.

---

#### 3.3.16 Applications — set preferences

| Property          | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| **Method + URL**  | `PUT /api/v1/student/applications/{application}/preferences` |
| **Route name**    | `v1.student.applications.preferences.update`                 |
| **Auth required** | Yes (student)                                                |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field           | Type    | Required | Rules                         | Description                           |
| --------------- | ------- | -------- | ----------------------------- | ------------------------------------- |
| `program_ids`   | array   | Yes      | required, array, min:1, max:3 | Ordered list of preferred program IDs |
| `program_ids.*` | integer | Yes      | required, exists:programs,id  | Individual program ID                 |

**Example request:**

```json
{
    "program_ids": [3, 5, 2]
}
```

**Success response (200):**

```json
{
    "message": "Preferences updated successfully."
}
```

**Error responses:**

- `422` — validation failure
- `403` — policy forbids update
- `404` — application not found

---

#### 3.3.17 Documents — index

| Property          | Value                           |
| ----------------- | ------------------------------- |
| **Method + URL**  | `GET /api/v1/student/documents` |
| **Route name**    | `v1.student.documents.index`    |
| **Auth required** | Yes (student)                   |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "document_type_id": 1,
            "status": "pending",
            "ai_check_status": "pending",
            "ai_check_notes": null,
            "notes": null,
            "review_notes": null,
            "verified_at": null,
            "document_type": {
                "id": 1,
                "name": "transcript",
                "display_name_en": "Academic Transcript",
                "display_name_ar": "كشف الدرجات",
                "description": null,
                "is_required": true,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            },
            "user": {
                "id": 1,
                "name": "Ahmed Khaled",
                "email": "ahmed@example.com",
                "phone": "+201234567890",
                "is_verified": true,
                "is_active": true,
                "role": { "id": 1, "name": "student", "guard_name": "web" },
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z"
            },
            "verifier": null,
            "created_at": "2026-01-15T10:00:00Z",
            "updated_at": "2026-01-15T10:00:00Z"
        }
    ]
}
```

---

#### 3.3.18 Documents — upload

| Property          | Value                            |
| ----------------- | -------------------------------- |
| **Method + URL**  | `POST /api/v1/student/documents` |
| **Route name**    | `v1.student.documents.store`     |
| **Auth required** | Yes (student)                    |

**Request body** (multipart/form-data):

| Field              | Type    | Required | Rules                                                                     | Description                  |
| ------------------ | ------- | -------- | ------------------------------------------------------------------------- | ---------------------------- |
| `file`             | file    | Yes      | required, file, max:10240, mimetypes:application/pdf,image/jpeg,image/png | The document file (max 10MB) |
| `document_type_id` | integer | Yes      | required, exists:document_types,id                                        | Document type ID             |
| `notes`            | string  | No       | nullable, string, max:1000                                                | Optional notes               |

**Example cURL:**

```bash
curl -X POST /api/v1/student/documents \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/transcript.pdf" \
  -F "document_type_id=1" \
  -F "notes=Official transcript"
```

**Success response (201):**

```json
{
  "id": 1,
  "user_id": 1,
  "document_type_id": 1,
  "status": "pending",
  "ai_check_status": "pending",
  "ai_check_notes": null,
  "notes": null,
  "review_notes": null,
  "verified_at": null,
  "document_type": { ... },
  "user": { ... },
  "verifier": null,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

**Notes:** After creation, a queued job (`VerifyDocumentJob`) runs document checks asynchronously. No AI provider is configured yet, so the `ai_check_status` will update from `pending` to `pending_manual_review` (awaiting human review) rather than claiming an automated `verified` result. On a processing error it updates to `failed`.

---

#### 3.3.19 Documents — show detail

| Property          | Value                                      |
| ----------------- | ------------------------------------------ |
| **Method + URL**  | `GET /api/v1/student/documents/{document}` |
| **Route name**    | `v1.student.documents.show`                |
| **Auth required** | Yes (student)                              |

**Path parameters:**

| Field      | Type    | Description                     |
| ---------- | ------- | ------------------------------- |
| `document` | integer | Document ID (route-model-bound) |

**Success response (200):**

```json
{
  "data": {
    "document": {
      "id": 1,
      "user_id": 1,
      "document_type_id": 1,
      "status": "pending",
      "ai_check_status": "pending",
      "ai_check_notes": null,
      "notes": null,
      "review_notes": null,
      "verified_at": null,
      "document_type": { ... },
      "user": { ... },
      "verifier": null,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    },
    "download_url": "https://app.example.com/storage/documents/1/transcript.pdf?expires=1786607760&signature=..."
  }
}
```

**Error responses:**

- `403` — document belongs to another student
- `404` — document not found

---

#### 3.3.20 Documents — delete

| Property          | Value                                         |
| ----------------- | --------------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/student/documents/{document}` |
| **Route name**    | `v1.student.documents.destroy`                |
| **Auth required** | Yes (student)                                 |

**Path parameters:**

| Field      | Type    | Description                     |
| ---------- | ------- | ------------------------------- |
| `document` | integer | Document ID (route-model-bound) |

**Success response (204):** No body.

**Error responses:**

- `403` — document is locked (required document attached to a non-editable application) or belongs to another student
- `404` — document not found

**Notes:** Deleting a document also removes the underlying file from local storage. Required documents cannot be deleted if they are attached to an application whose status is not `draft` or `returned_for_revision`.

---

#### 3.3.21 Application documents — attach

| Property          | Value                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/student/applications/{application}/documents/{document}/attach` |
| **Route name**    | `v1.student.applications.documents.attach`                                    |
| **Auth required** | Yes (student)                                                                 |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |
| `document`    | integer | Document ID (route-model-bound)    |

**Request body:** None required.

**Success response (204):** No body.

**Error responses:**

- `422` — application is not in an editable state (`draft` or `returned_for_revision`):
    ```json
    {
        "message": "Application is not in an editable state."
    }
    ```
- `403` — policy forbids access to application or document
- `404` — application or document not found

**Notes:** This creates a pivot record in `application_documents`. If a pivot already exists for the same `(application_id, document_type_id)`, it updates rather than duplicates.

---

#### 3.3.22 Secondary school records — index

| Property          | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Method + URL**  | `GET /api/v1/student/secondary_school_records` |
| **Route name**    | `v1.student.secondary_school_records.index`    |
| **Auth required** | Yes (student)                                  |

**Success response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "student_school_id": "SCH-001",
            "graduation_year": 2022,
            "average": 88.5,
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        }
    ]
}
```

---

#### 3.3.23 Secondary school records — update

| Property          | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Method + URL**  | `PUT /api/v1/student/secondary_school_records/{secondarySchoolRecord}` |
| **Route name**    | `v1.student.secondary_school_records.update`                           |
| **Auth required** | Yes (student)                                                          |

**Path parameters:**

| Field                   | Type    | Description                                    |
| ----------------------- | ------- | ---------------------------------------------- |
| `secondarySchoolRecord` | integer | Secondary school record ID (route-model-bound) |

**Request body:**

| Field               | Type    | Required | Rules                                         | Description           |
| ------------------- | ------- | -------- | --------------------------------------------- | --------------------- |
| `student_school_id` | string  | Yes      | required, string, max:255                     | School ID             |
| `graduation_year`   | integer | Yes      | required, integer, min:1990, max:current year | Graduation year       |
| `average`           | numeric | Yes      | required, numeric, min:0, max:100             | Average grade (0-100) |

**Example request:**

```json
{
    "student_school_id": "SCH-001",
    "graduation_year": 2022,
    "average": 88.5
}
```

**Success response (200):**

```json
{
    "id": 1,
    "student_school_id": "SCH-001",
    "graduation_year": 2022,
    "average": 88.5,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-15T11:00:00Z"
}
```

**Error responses:**

- `422` — validation failure
- `403` — record belongs to another student

---

### 3.4 Admission Employee

All admission employee endpoints require `auth:api`, `active`, and `role:admission_employee` middleware. Policies additionally restrict access to applications where `assigned_reviewer_id` matches the authenticated user.

#### 3.4.1 Applications — index

| Property          | Value                                         |
| ----------------- | --------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_employee/applications` |
| **Route name**    | `v1.admission_employee.applications.index`    |
| **Auth required** | Yes (admission_employee)                      |

**Success response (200):** Returns `ApplicationResource` collection (see 3.3.9 shape). Only applications where `assigned_reviewer_id = auth user`.

---

#### 3.4.2 Applications — show detail

| Property          | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_employee/applications/{application}` |
| **Route name**    | `v1.admission_employee.applications.show`                   |
| **Auth required** | Yes (admission_employee)                                    |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Success response (200):** Returns `ApplicationDetailResource` with `comments` and `preferences.program` loaded.

```json
{
  "data": {
    "id": 1,
    "application_number": "APP-00000001",
    "status": "under_review",
    "student_notes": null,
    "decision_reason": null,
    "submitted_at": "2026-01-15T10:00:00Z",
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "selected_program": { ... },
    "assigned_reviewer": { ... },
    "reviewer": null,
    "uploaded_documents": [],
    "secondary_school_records": [],
    "comments": [
      {
        "id": 1,
        "comment": "Documents look complete.",
        "user": {
          "id": 2,
          "name": "Admission Officer",
          "email": "officer@example.com",
          "phone": "+201234567891",
          "is_verified": true,
          "is_active": true,
          "role": { "id": 2, "name": "admission_employee", "guard_name": "web" },
          "created_at": "2026-01-15T10:00:00Z",
          "updated_at": "2026-01-15T10:00:00Z"
        },
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-01-15T10:00:00Z"
      }
    ],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

**Error responses:**

- `403` — application is not assigned to the authenticated employee
- `404` — application not found

---

#### 3.4.3 Applications — forward to department head

| Property          | Value                                                                |
| ----------------- | -------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/forward` |
| **Route name**    | `v1.admission_employee.applications.forward`                         |
| **Auth required** | Yes (admission_employee)                                             |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "admission_cycle_id": 1,
    "program_id": 3,
    "application_number": "APP-00000001",
    "status": "forwarded_to_department_head",
    "student_notes": null,
    "decision_reason": null,
    "assigned_reviewer_id": 2,
    "reviewed_by": 2,
    "submitted_at": "2026-01-15T10:00:00Z",
    "reviewed_at": "2026-01-16T09:00:00Z",
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": { ... },
    "reviewer": { ... },
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-16T09:00:00Z"
  }
}
```

**Error responses:**

- `422` — application cannot be forwarded in its current status (must be `under_review`)
- `403` — policy forbids forwarding
- `404` — application not found

---

#### 3.4.4 Applications — request revision

| Property          | Value                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/request-revision` |
| **Route name**    | `v1.admission_employee.applications.request-revision`                         |
| **Auth required** | Yes (admission_employee)                                                      |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "returned_for_revision"`.

**Error responses:**

- `403` — policy forbids action
- `404` — not found

**Notes:** Policy allows this when status is `under_review` or `returned_to_employee`.

---

#### 3.4.5 Applications — re-forward

| Property          | Value                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/re-forward` |
| **Route name**    | `v1.admission_employee.applications.re-forward`                         |
| **Auth required** | Yes (admission_employee)                                                |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "forwarded_to_department_head"`.

**Error responses:**

- `403` — policy forbids re-forward (only allowed when status is `returned_to_employee`)
- `404` — not found

---

#### 3.4.6 Applications — reject directly

| Property          | Value                                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/reject` |
| **Route name**    | `v1.admission_employee.applications.reject`                         |
| **Auth required** | Yes (admission_employee)                                            |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field             | Type   | Required | Rules                      | Description      |
| ----------------- | ------ | -------- | -------------------------- | ---------------- |
| `decision_reason` | string | Yes      | required, string, max:1000 | Rejection reason |

**Example request:**

```json
{
    "decision_reason": "Missing required documents despite multiple requests."
}
```

**Success response (200):** Returns `ApplicationResource` with `status: "rejected"`, `reviewed_by` set to the employee's ID, and `reviewed_at` set to now.

**Error responses:**

- `422` — application cannot be rejected in its current status (must be `under_review` or `returned_to_employee`)
- `403` — policy forbids action

---

#### 3.4.7 Applications — verify with AI

| Property          | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/verify-ai` |
| **Route name**    | `v1.admission_employee.applications.verify-ai`                         |
| **Auth required** | Yes (admission_employee)                                               |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field             | Type   | Required | Rules                      | Description            |
| ----------------- | ------ | -------- | -------------------------- | ---------------------- |
| `decision_reason` | string | No       | nullable, string, max:1000 | Optional reviewer note |

**Success response (200):** Returns `ApplicationResource` with `ai_verification_score`, `ai_verification_notes`, and `ai_verified_at` populated. The `status` branches based on score and application type:

| Score | `requires_department_head_approval` | Resulting status               |
| ----- | ----------------------------------- | ------------------------------ |
| >= 70 | false                               | `accepted`                     |
| >= 70 | true                                | `forwarded_to_department_head` |
| < 70  | any                                 | `under_review`                 |

**Example response (score 85, no dept head approval needed):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "admission_cycle_id": 1,
    "program_id": 3,
    "application_number": "APP-00000001",
    "status": "accepted",
    "student_notes": null,
    "decision_reason": null,
    "assigned_reviewer_id": null,
    "reviewed_by": null,
    "submitted_at": "2026-01-15T10:00:00Z",
    "reviewed_at": null,
    "ai_verification_score": 85,
    "ai_verification_notes": "AI verification score: 85",
    "ai_verified_at": "2026-01-16T10:00:00Z",
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": null,
    "reviewer": null,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-16T10:00:00Z"
  }
}
```

**Error responses:**

- `403` — policy forbids action
- `404` — application not found or no application type configured

**Notes:** No real AI provider is configured yet. In production `RealAiVerificationService::verify()` throws a `RuntimeException` until a provider is connected; outside production the fail-closed `FakeAiVerificationService` also throws (only its `verifyForLocalTesting()` method returns a score — an obvious `999` — for local UI development). Treat the resulting score/status as provisional until real AI integration is wired in.

---

#### 3.4.8 Comments — create

| Property          | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/applications/{application}/comments` |
| **Route name**    | `v1.admission_employee.comments.store`                                |
| **Auth required** | Yes (admission_employee)                                              |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field     | Type   | Required | Rules                      | Description  |
| --------- | ------ | -------- | -------------------------- | ------------ |
| `comment` | string | Yes      | required, string, max:2000 | Comment text |

**Example request:**

```json
{
    "comment": "Transcript looks authentic. Proceeding to next stage."
}
```

**Success response (201):**

```json
{
    "data": {
        "id": 1,
        "comment": "Transcript looks authentic. Proceeding to next stage.",
        "user": {
            "id": 2,
            "name": "Admission Officer",
            "email": "officer@example.com",
            "phone": "+201234567891",
            "is_verified": true,
            "is_active": true,
            "role": {
                "id": 2,
                "name": "admission_employee",
                "guard_name": "web"
            },
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z"
        },
        "created_at": "2026-01-16T10:00:00Z",
        "updated_at": "2026-01-16T10:00:00Z"
    }
}
```

**Error responses:**

- `422` — validation failure
- `403` — application is not assigned to the authenticated employee

**Notes:** Comments support full CRUD for admission employees on assigned applications.

---

#### 3.4.9 Comments — update

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `PUT /api/v1/admission_employee/applications/{application}/comments/{comment}` |
| **Route name**    | `v1.admission_employee.comments.update`                                  |
| **Auth required** | Yes (admission_employee)                                                  |

**Path parameters:**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `application` | integer | Application ID |
| `comment` | integer | Comment ID |

**Request body:**

| Field | Type | Required | Rules | Description |
| ----- | ---- | -------- | ----- | ----------- |
| `body` | string | Yes | required, string, max:1000 | Updated comment text |

**Success response (200):** Returns updated comment resource.

**Error responses:** `403`, `404`.

---

#### 3.4.10 Comments — delete

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/admission_employee/applications/{application}/comments/{comment}` |
| **Route name**    | `v1.admission_employee.comments.destroy`                                 |
| **Auth required** | Yes (admission_employee)                                                  |

**Path parameters:**

| Field | Type | Description |
| ----- | ---- | ----------- |
| `application` | integer | Application ID |
| `comment` | integer | Comment ID |

**Success response (204):** No body.

**Error responses:** `403`, `404`.

---

#### 3.4.11 Documents — verify

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admission_employee/documents/{document}/verify`            |
| **Route name**    | `v1.admission_employee.documents.verify`                                  |
| **Auth required** | Yes (admission_employee, department_head, or admin)                       |

**Path parameters:**

| Field       | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| `document`  | integer | Document ID (route-model-bound)    |

**Request body:**

| Field         | Type   | Required | Rules                      | Description            |
| ------------- | ------ | -------- | -------------------------- | ---------------------- |
| `status`      | string | Yes      | required, in:verified,rejected | Verification decision  |
| `review_notes` | string | No       | nullable, string, max:2000  | Optional reviewer note |

**Example request:**

```json
{
    "status": "verified",
    "review_notes": "Document looks authentic."
}
```

**Success response (200):** Returns `DocumentResource` with `status` updated, `verified_at` set to now, and `verifier` loaded.

**Error responses:**

- `403` — not the assigned reviewer for any application linked to this document, and not admin
- `404` — document not found

**Notes:**
- Only documents linked to an application in a reviewable status can be verified.
- Once verified or rejected, the document's `status` and `verified_at` are updated.

---

#### 3.4.12 Notifications — index

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_employee/notifications`                            |
| **Route name**    | `v1.admission_employee.notifications.index`                               |
| **Auth required** | Yes (admission_employee, department_head, or admin)                       |

**Query parameters:** Laravel pagination params (`page`, `per_page`).

**Success response (200, paginated):**

```json
{
    "data": [
        {
            "id": 1,
            "type": "staff",
            "message": "A new application has been assigned to you for review.",
            "data": {
                "application_id": 5,
                "old_status": "submitted",
                "new_status": "under_review"
            },
            "read_at": null,
            "created_at": "2026-08-07T06:00:00Z",
            "updated_at": "2026-08-07T06:00:00Z"
        }
    ],
    "links": { ... },
    "meta": { ... }
}
```

**Error responses:**

- `403` — role not permitted

---

#### 3.4.13 Notifications — mark as read

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/admission_employee/notifications/{notification}/read`     |
| **Route name**    | `v1.admission_employee.notifications.read`                                |
| **Auth required** | Yes (admission_employee, department_head, or admin)                       |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (200):** Returns `NotificationResource` with `read_at` set to now.

**Error responses:**

- `403` — not the owner of this notification
- `404` — notification not found

---

#### 3.4.14 Notifications — mark all as read

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/admission_employee/notifications/read-all`                |
| **Route name**    | `v1.admission_employee.notifications.read-all`                            |
| **Auth required** | Yes (admission_employee, department_head, or admin)                       |

**Success response (200):**

```json
{
    "success": true,
    "message": "All notifications marked as read.",
    "data": null
}
```

**Error responses:**

- `403` — role not permitted

---

#### 3.4.15 Notifications — delete

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/admission_employee/notifications/{notification}`         |
| **Route name**    | `v1.admission_employee.notifications.destroy`                             |
| **Auth required** | Yes (admission_employee, department_head, or admin)                       |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (204):** No content.

**Error responses:**

- `403` — not the owner of this notification
- `404` — notification not found

---

### 3.5 Department Head

All department head endpoints require `auth:api`, `active`, and `role:department_head`. Policies restrict access to applications where `assigned_reviewer_id` matches the authenticated user.

#### 3.5.1 Applications — index

| Property          | Value                                      |
| ----------------- | ------------------------------------------ |
| **Method + URL**  | `GET /api/v1/department_head/applications` |
| **Route name**    | `v1.department_head.applications.index`    |
| **Auth required** | Yes (department_head)                      |

**Success response (200):** Returns `ApplicationResource` collection. Only applications where `assigned_reviewer_id = auth user` AND status is `forwarded_to_department_head` or `returned_to_employee`.

---

#### 3.5.2 Applications — show detail

| Property          | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/applications/{application}` |
| **Route name**    | `v1.department_head.applications.show`                   |
| **Auth required** | Yes (department_head)                                    |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Success response (200):** Returns `ApplicationDetailResource`. Note: `uploaded_documents` is only included if the controller eager-loads `user.documents` (currently it does not — this is a known gap).

---

#### 3.5.3 Applications — accept

| Property          | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/department_head/applications/{application}/accept` |
| **Route name**    | `v1.department_head.applications.accept`                         |
| **Auth required** | Yes (department_head)                                            |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "accepted"`.

**Error responses:**

- `403` — policy forbids (application not assigned, or status is not `forwarded_to_department_head`)
- `404` — not found

---

#### 3.5.4 Applications — reject

| Property          | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/department_head/applications/{application}/reject` |
| **Route name**    | `v1.department_head.applications.reject`                         |
| **Auth required** | Yes (department_head)                                            |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "rejected"`.

**Error responses:**

- `403` — policy forbids
- `404` — not found

---

#### 3.5.5 Applications — return to employee

| Property          | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/department_head/applications/{application}/return-to-employee` |
| **Route name**    | `v1.department_head.applications.return-to-employee`                         |
| **Auth required** | Yes (department_head)                                                        |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "returned_to_employee"`.

**Error responses:**

- `403` — policy forbids
- `404` — not found

---

#### 3.5.6 Notifications — index

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/notifications` |
| **Route name**    | `v1.department_head.notifications.index`    |
| **Auth required** | Yes (department_head)                  |

**Query parameters:** Laravel pagination params (`page`, `per_page`).

**Success response (200, paginated):**

```json
{
    "data": [
        {
            "id": 1,
            "type": "staff",
            "message": "A new application has been forwarded to you for review.",
            "data": {
                "application_id": 5,
                "old_status": "under_review",
                "new_status": "forwarded_to_department_head"
            },
            "read_at": null,
            "created_at": "2026-08-07T06:00:00Z",
            "updated_at": "2026-08-07T06:00:00Z"
        }
    ],
    "links": { ... },
    "meta": { ... }
}
```

**Error responses:**

- `403` — role not permitted

---

#### 3.5.7 Notifications — mark as read

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/department_head/notifications/{notification}/read`        |
| **Route name**    | `v1.department_head.notifications.read`                                   |
| **Auth required** | Yes (department_head)                                                     |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (200):** Returns `NotificationResource` with `read_at` set to now.

**Error responses:**

- `403` — not the owner of this notification
- `404` — notification not found

---

#### 3.5.8 Notifications — mark all as read

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `PATCH /api/v1/department_head/notifications/read-all`                   |
| **Route name**    | `v1.department_head.notifications.read-all`                               |
| **Auth required** | Yes (department_head)                                                     |

**Success response (200):**

```json
{
    "success": true,
    "message": "All notifications marked as read.",
    "data": null
}
```

**Error responses:**

- `403` — role not permitted

---

#### 3.5.9 Notifications — delete

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/department_head/notifications/{notification}`            |
| **Route name**    | `v1.department_head.notifications.destroy`                               |
| **Auth required** | Yes (department_head)                                                     |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `notification` | integer | Notification ID (route-model-bound) |

**Success response (204):** No content.

**Error responses:**

- `403` — not the owner of this notification
- `404` — notification not found

---

#### 3.5.10 Reports — applications by status

| Property          | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/reports/applications/by-status`                            |
| **Route name**    | `v1.department_head.reports.applications.by-status`                                      |
| **Auth required** | Yes (department_head)                                                                    |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "submitted", "count": 12},
        {"label": "under_review", "count": 5},
        {"label": "forwarded_to_department_head", "count": 3}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- The date range defaults to the last 30 days if omitted.
- Results are scoped to applications assigned to the department head (policy-enforced).

---

#### 3.5.11 Reports — applications throughput

| Property          | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/reports/applications/throughput`                            |
| **Route name**    | `v1.department_head.reports.applications.throughput`                                      |
| **Auth required** | Yes (department_head)                                                                    |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"date": "2026-08-01", "count": 3},
        {"date": "2026-08-02", "count": 1},
        {"date": "2026-08-03", "count": 4}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Only applications with status `accepted`, `rejected`, or `forwarded_to_department_head` are counted.
- Results are grouped by `updated_at` date.

---

#### 3.5.12 Reports — time to decision

| Property          | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/reports/applications/time-to-decision`                     |
| **Route name**    | `v1.department_head.reports.applications.time-to-decision`                               |
| **Auth required** | Yes (department_head)                                                                    |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "average_seconds", "value": 172800.0},
        {"label": "average_minutes", "value": 2880.0},
        {"label": "total_decisions", "value": 15}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `average_seconds` is calculated from the time between status changes to `accepted`/`rejected` and the previous status history entry.
- `total_decisions` is the count of applications with a decision in the date range.

---

#### 3.5.13 Reports — acceptance rate by program

| Property          | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/department_head/reports/applications/acceptance-rate`                      |
| **Route name**    | `v1.department_head.reports.applications.acceptance-rate`                                |
| **Auth required** | Yes (department_head)                                                                    |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {
            "label": "Computer Science BSc",
            "accepted": 2,
            "rejected": 1,
            "total": 3,
            "rate": 66.7
        }
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

### 3.6 Admission Dean

All admission dean endpoints require `auth:api`, `active`, and `role:admission_dean`.

#### 3.6.1 Dashboard

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/dashboard` |
| **Route name**    | `v1.admission_dean.dashboard.index`    |
| **Auth required** | Yes (admission_dean)                   |

**Success response (200):**

```json
{
    "statistics": {
        "total_users": 150,
        "total_students": 100,
        "total_applications": 500,
        "total_documents": 1200,
        "total_programs": 30,
        "total_departments": 15,
        "total_faculties": 5,
        "total_admission_cycles": 3,
        "pending_applications": 50,
        "under_review_applications": 30,
        "returned_for_revision_applications": 10,
        "accepted_applications": 150,
        "rejected_applications": 100
    }
}
```

**Notes:** Read-only. The `user` field in the DashboardResource is set to `null` for the dean dashboard. System-wide counts only; no per-user scoping.

---

#### 3.6.2 Reports — applications by status

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/by-status`              |
| **Route name**    | `v1.admission_dean.reports.applications.by-status`                        |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "submitted", "count": 120},
        {"label": "under_review", "count": 45},
        {"label": "accepted", "count": 200},
        {"label": "rejected", "count": 30}
    ]
}
```

**Error responses:** 401, 403.

---

#### 3.6.3 Reports — applications by faculty

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/by-faculty`             |
| **Route name**    | `v1.admission_dean.reports.applications.by-faculty`                       |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Engineering", "count": 85},
        {"label": "Medicine", "count": 40},
        {"label": "Science", "count": 60}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Faculty names are returned in English (`name_en`).

---

#### 3.6.4 Reports — applications by department

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/by-department`          |
| **Route name**    | `v1.admission_dean.reports.applications.by-department`                    |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Computer Science", "count": 45},
        {"label": "Mechanical Engineering", "count": 30},
        {"label": "Medicine", "count": 40}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Department names are returned in English (`name_en`).

---

#### 3.6.5 Reports — applications by program

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/by-program`             |
| **Route name**    | `v1.admission_dean.reports.applications.by-program`                       |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Computer Science BSc", "count": 45},
        {"label": "Software Engineering BSc", "count": 30},
        {"label": "Medicine MD", "count": 40}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Program names are returned in English (`name_en`).

---

#### 3.6.6 Reports — time in status

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/time-in-status`         |
| **Route name**    | `v1.admission_dean.reports.applications.time-in-status`                   |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {
            "label": "under_review",
            "average_seconds": 86400.0,
            "average_minutes": 1440.0
        },
        {
            "label": "forwarded_to_department_head",
            "average_seconds": 172800.0,
            "average_minutes": 2880.0
        }
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `average_seconds` is calculated using the timestamps in `application_status_history`.
- `average_minutes` is `average_seconds / 60`, rounded to 1 decimal place.

---

#### 3.6.7 Reports — documents upload volume

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/documents/upload-volume`             |
| **Route name**    | `v1.admission_dean.reports.documents.upload-volume`                       |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"date": "2026-08-01", "count": 12},
        {"date": "2026-08-02", "count": 8},
        {"date": "2026-08-03", "count": 15}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are grouped by `DATE(created_at)` and ordered by date ascending.

---

#### 3.6.8 Reports — acceptance rate by program

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admission_dean/reports/applications/acceptance-rate`        |
| **Route name**    | `v1.admission_dean.reports.applications.acceptance-rate`                  |
| **Auth required** | Yes (admission_dean)                                                      |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {
            "label": "Computer Science BSc",
            "accepted": 25,
            "rejected": 10,
            "total": 35,
            "rate": 71.4
        },
        {
            "label": "Medicine MD",
            "accepted": 40,
            "rejected": 5,
            "total": 45,
            "rate": 88.9
        }
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

### 3.7 Admin

All admin endpoints require `auth:api`, `active`, and `admin` middleware. Policies enforce additional constraints (e.g. singleton roles, ownership).

#### 3.7.1 Applications — index

| Property          | Value                            |
| ----------------- | -------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/applications` |
| **Route name**    | `v1.admin.applications.index`    |
| **Auth required** | Yes (admin)                      |

**Query parameters:** Laravel pagination params (`page`, `per_page`).

**Success response (200, paginated):**

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "admission_cycle_id": 1,
      "program_id": 3,
      "application_number": "APP-00000001",
      "status": "submitted",
      "student_notes": null,
      "decision_reason": null,
      "assigned_reviewer_id": null,
      "reviewed_by": null,
      "submitted_at": "2026-01-15T10:00:00Z",
      "reviewed_at": null,
      "applicant": {
        "id": 1,
        "name": "Ahmed Khaled",
        "email": "ahmed@example.com",
        "phone": "+201234567890",
        "is_verified": true,
        "is_active": true,
        "role": { "id": 1, "name": "student", "guard_name": "web" },
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-01-15T10:00:00Z"
      },
      "admission_cycle": { ... },
      "program": { ... },
      "assigned_reviewer": null,
      "reviewer": null,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

#### 3.7.2 Applications — show detail

| Property          | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/applications/{application}` |
| **Route name**    | `v1.admin.applications.show`                   |
| **Auth required** | Yes (admin)                                    |

**Success response (200):** Returns `ApplicationDetailResource` with `user`, `admissionCycle`, `program`, `assignedReviewer`, `reviewer`, `preferences.program`, and `comments.user` loaded.

---

#### 3.7.3 Applications — assign reviewer

| Property          | Value                                                           |
| ----------------- | --------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admin/applications/{application}/assign-reviewer` |
| **Route name**    | `v1.admin.applications.assign-reviewer`                         |
| **Auth required** | Yes (admin)                                                     |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:**

| Field                  | Type    | Required | Rules                     | Description                            |
| ---------------------- | ------- | -------- | ------------------------- | -------------------------------------- |
| `assigned_reviewer_id` | integer | Yes      | required, exists:users,id | ID of the admission employee to assign |

**Success response (200):** Returns `ApplicationResource` with `status` set to `under_review` and `assigned_reviewer_id` updated.

**Error responses:**

- `422` — validation failure
- `403` — policy forbids (only allowed when application is in `submitted` status)

---

#### 3.7.4 Applications — cancel

| Property          | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Method + URL**  | `POST /api/v1/admin/applications/{application}/cancel` |
| **Route name**    | `v1.admin.applications.cancel`                         |
| **Auth required** | Yes (admin)                                            |

**Path parameters:**

| Field         | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `application` | integer | Application ID (route-model-bound) |

**Request body:** None required.

**Success response (200):** Returns `ApplicationResource` with `status: "cancelled"`.

**Error responses:**

- `403` — policy forbids (cannot cancel already accepted/rejected/cancelled applications)
- `404` — not found

---

#### 3.7.5 Users — index

| Property          | Value                     |
| ----------------- | ------------------------- |
| **Method + URL**  | `GET /api/v1/admin/users` |
| **Route name**    | `v1.admin.users.index`    |
| **Auth required** | Yes (admin)               |

**Query parameters:** Laravel pagination params.

**Success response (200, paginated):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ahmed Khaled",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "is_verified": true,
      "is_active": true,
      "role": { "id": 1, "name": "student", "guard_name": "web" },
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

#### 3.7.6 Users — create

| Property          | Value                      |
| ----------------- | -------------------------- |
| **Method + URL**  | `POST /api/v1/admin/users` |
| **Route name**    | `v1.admin.users.store`     |
| **Auth required** | Yes (admin)                |

**Request body:**

| Field       | Type    | Required | Rules                                                                                                                                   | Description                                   |
| ----------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `name`      | string  | Yes      | required, string, max:255                                                                                                               | Full name                                     |
| `email`     | string  | Yes      | required, string, email, max:255, unique:users,email                                                                                    | Email address                                 |
| `phone`     | string  | Yes      | required, string, max:20, unique:users,phone                                                                                            | Phone number                                  |
| `password`  | string  | Yes      | required, string, min:8                                                                                                                 | Password                                      |
| `is_active` | boolean | No       | nullable, boolean                                                                                                                       | Whether the account is active (default: true) |
| `roles`     | array   | No       | nullable, array, SingletonRole(['admin','admission_dean']), roles.\* in:student,admission_employee,department_head,admission_dean,admin | Roles to assign                               |

**Example request:**

```json
{
    "name": "New Employee",
    "email": "employee@example.com",
    "phone": "+201234567892",
    "password": "securePass123",
    "is_active": true,
    "roles": ["admission_employee"]
}
```

**Success response (201):**

```json
{
    "data": {
        "id": 2,
        "name": "New Employee",
        "email": "employee@example.com",
        "phone": "+201234567892",
        "is_verified": true,
        "is_active": true,
        "role": { "id": 2, "name": "admission_employee", "guard_name": "web" },
        "created_at": "2026-01-15T10:00:00Z",
        "updated_at": "2026-01-15T10:00:00Z"
    }
}
```

**Error responses:**

- `422` — validation failure (e.g. duplicate email/phone)
- `422` — singleton role violation:
    ```json
    {
        "message": "The role 'admin' is already assigned to another user. Only one user can hold this role."
    }
    ```

**Notes:** `admin` and `admission_dean` are singleton roles. Assigning either to a user when another user already holds it will fail validation. Reassignment is allowed after the current holder is removed.

---

#### 3.7.7 Users — show

| Property          | Value                            |
| ----------------- | -------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/users/{user}` |
| **Route name**    | `v1.admin.users.show`            |
| **Auth required** | Yes (admin)                      |

**Path parameters:**

| Field  | Type    | Description                 |
| ------ | ------- | --------------------------- |
| `user` | integer | User ID (route-model-bound) |

**Success response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "is_active": true,
    "role": { "id": 1, "name": "student", "guard_name": "web" },
    "personal_information": { ... },
    "addresses": [],
    "emergency_contacts": [],
    "social_information": { ... },
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

---

#### 3.7.8 Users — update

| Property          | Value                            |
| ----------------- | -------------------------------- |
| **Method + URL**  | `PUT /api/v1/admin/users/{user}` |
| **Route name**    | `v1.admin.users.update`          |
| **Auth required** | Yes (admin)                      |

**Path parameters:**

| Field  | Type    | Description                 |
| ------ | ------- | --------------------------- |
| `user` | integer | User ID (route-model-bound) |

**Request body:**

| Field       | Type    | Required | Rules                                                                                                                                   | Description     |
| ----------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `name`      | string  | No       | nullable, string, max:255                                                                                                               | Full name       |
| `email`     | string  | No       | nullable, string, email, max:255, unique:users,email                                                                                    | Email address   |
| `phone`     | string  | No       | nullable, string, max:20, unique:users,phone                                                                                            | Phone number    |
| `is_active` | boolean | No       | nullable, boolean                                                                                                                       | Active status   |
| `roles`     | array   | No       | nullable, array, SingletonRole(['admin','admission_dean']), roles.\* in:student,admission_employee,department_head,admission_dean,admin | Roles to assign |

**Success response (200):** Returns `UserResource` with `roles` loaded.

**Error responses:**

- `422` — validation failure, including singleton role violation
- `403` — policy forbids (admin cannot be downgraded by another admin via this endpoint? Actually UserPolicy::update allows admin || self)

---

#### 3.7.9 Programs — index

| Property          | Value                        |
| ----------------- | ---------------------------- |
| **Method + URL**  | `GET /api/v1/admin/programs` |
| **Route name**    | `v1.admin.programs.index`    |
| **Auth required** | Yes (admin)                  |

**Success response (200, paginated):**

```json
{
  "data": [
    {
      "id": 1,
      "department_id": 1,
      "name_en": "Computer Science",
      "name_ar": "علوم الحاسوب",
      "description_en": null,
      "description_ar": "برنامج أكاديمي",
      "minimum_average": 70.0,
      "is_active": true,
      "department": {
        "id": 1,
        "name_en": "Computer Science",
        "name_ar": "علوم الحاسوب",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      },
      "branches": [],
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

#### 3.7.10 Programs — create

| Property          | Value                         |
| ----------------- | ----------------------------- |
| **Method + URL**  | `POST /api/v1/admin/programs` |
| **Route name**    | `v1.admin.programs.store`     |
| **Auth required** | Yes (admin)                   |

**Request body:**

| Field             | Type    | Required | Rules                             | Description                   |
| ----------------- | ------- | -------- | --------------------------------- | ----------------------------- |
| `department_id`   | integer | Yes      | required, exists:departments,id   | Parent department ID          |
| `name_en`         | string  | Yes      | required, string, max:255         | Program name (English)        |
| `name_ar`         | string  | Yes      | required, string, max:255         | Program name (Arabic)         |
| `description_en`  | string  | No       | nullable, string                  | Description (English)         |
| `description_ar`  | string  | No       | nullable, string                  | Description (Arabic)          |
| `minimum_average` | numeric | No       | nullable, numeric, min:0, max:100 | Minimum admission average     |
| `is_active`       | boolean | No       | boolean                           | Whether the program is active |

**Example request:**

```json
{
    "department_id": 1,
    "name_en": "Software Engineering",
    "name_ar": "هندسة البرمجيات",
    "description_en": "Bachelor of Software Engineering",
    "description_ar": "بكالوريوس هندسة البرمجيات",
    "minimum_average": 75.0,
    "is_active": true
}
```

**Success response (201):**

```json
{
  "data": {
    "id": 1,
    "department_id": 1,
    "name_en": "Software Engineering",
    "name_ar": "هندسة البرمجيات",
    "description_en": "Bachelor of Software Engineering",
    "description_ar": "بكالوريوس هندسة البرمجيات",
    "minimum_average": 75.0,
    "is_active": true,
    "department": { ... },
    "branches": [],
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

---

#### 3.7.11 Programs — show

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/programs/{program}` |
| **Route name**    | `v1.admin.programs.show`               |
| **Auth required** | Yes (admin)                            |

**Success response (200):** Returns `ProgramResource` with `department` and `branches` loaded.

---

#### 3.7.12 Programs — update

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `PUT /api/v1/admin/programs/{program}` |
| **Route name**    | `v1.admin.programs.update`             |
| **Auth required** | Yes (admin)                            |

**Request body:** Same fields as create (`department_id`, `name_en`, `name_ar`, `description_en`, `description_ar`, `minimum_average`, `is_active`).

**Success response (200):** Returns updated `ProgramResource`.

---

#### 3.7.13 Programs — delete

| Property          | Value                                     |
| ----------------- | ----------------------------------------- |
| **Method + URL**  | `DELETE /api/v1/admin/programs/{program}` |
| **Route name**    | `v1.admin.programs.destroy`               |
| **Auth required** | Yes (admin)                               |

**Success response (204):** No body.

---

#### 3.7.14 Faculties — CRUD

| Property           | Value                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Methods + URLs** | `GET /api/v1/admin/faculties`, `POST /api/v1/admin/faculties`, `GET /api/v1/admin/faculties/{faculty}`, `PUT /api/v1/admin/faculties/{faculty}`, `DELETE /api/v1/admin/faculties/{faculty}` |
| **Route names**    | `v1.admin.faculties.index/store/show/update/destroy`                                                                                                                                        |
| **Auth required**  | Yes (admin)                                                                                                                                                                                 |

**Store/Update request body:**

| Field            | Type    | Required | Rules                                                                           | Description         |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------------- | ------------------- |
| `name_en`        | string  | Yes      | required, string, max:255, unique:faculties,name_en (ignores current on update) | English name        |
| `name_ar`        | string  | Yes      | required, string, max:255, unique:faculties,name_ar                             | Arabic name         |
| `description_en` | string  | No       | nullable, string                                                                | English description |
| `description_ar` | string  | No       | nullable, string                                                                | Arabic description  |
| `is_active`      | boolean | No       | boolean                                                                         | Active status       |

**Success responses:**

- `200` — `FacultyResource` for show/update
- `201` — `FacultyResource` for create
- `204` — empty body for delete

**Notes:** `show` loads `departments` relationship.

---

#### 3.7.15 Departments — CRUD

| Property           | Value                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Methods + URLs** | `GET /api/v1/admin/departments`, `POST /api/v1/admin/departments`, `GET /api/v1/admin/departments/{department}`, `PUT /api/v1/admin/departments/{department}`, `DELETE /api/v1/admin/departments/{department}` |
| **Route names**    | `v1.admin.departments.index/store/show/update/destroy`                                                                                                                                                         |
| **Auth required**  | Yes (admin)                                                                                                                                                                                                    |

**Store/Update request body:**

| Field            | Type    | Required | Rules                         | Description         |
| ---------------- | ------- | -------- | ----------------------------- | ------------------- |
| `faculty_id`     | integer | Yes      | required, exists:faculties,id | Parent faculty ID   |
| `name_en`        | string  | Yes      | required, string, max:255     | English name        |
| `name_ar`        | string  | Yes      | required, string, max:255     | Arabic name         |
| `description_en` | string  | No       | nullable, string              | English description |
| `description_ar` | string  | No       | nullable, string              | Arabic description  |
| `is_active`      | boolean | No       | boolean                       | Active status       |

**Success responses:** `200` (show/update), `201` (store), `204` (destroy).

**Notes:** `show` loads `faculty` and `programs` relationships.

---

#### 3.7.16 Admission cycles — CRUD

| Property           | Value                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Methods + URLs** | `GET /api/v1/admin/admission-cycles`, `POST /api/v1/admin/admission-cycles`, `GET /api/v1/admin/admission-cycles/{admission_cycle}`, `PUT /api/v1/admin/admission-cycles/{admission_cycle}`, `DELETE /api/v1/admin/admission-cycles/{admission_cycle}` |
| **Route names**    | `v1.admin.admission-cycles.index/store/show/update/destroy`                                                                                                                                                                                            |
| **Auth required**  | Yes (admin)                                                                                                                                                                                                                                            |

**Store/Update request body:**

| Field           | Type    | Required | Rules                            | Description                        |
| --------------- | ------- | -------- | -------------------------------- | ---------------------------------- |
| `name`          | string  | Yes      | required, string, max:255        | Cycle name (e.g. `Fall 2026`)      |
| `academic_year` | string  | Yes      | required, string, max:255        | Academic year (e.g. `2026-2027`)   |
| `semester`      | string  | Yes      | required, in:first,second,summer | Semester                           |
| `starts_at`     | date    | Yes      | required, date                   | Start date (Y-m-d)                 |
| `ends_at`       | date    | Yes      | required, date, after:starts_at  | End date (must be after starts_at) |
| `is_active`     | boolean | No       | boolean                          | Active status                      |

**Success responses:**

- `200` — `AdmissionCycleResource` for show/update
- `201` — `AdmissionCycleResource` for create
- `204` — destroy (no content)

**Error responses:**

- `409` — Cannot delete an admission cycle that has associated applications. Body: `{"message": "Cannot delete this admission cycle because it has associated applications."}`

---

#### 3.7.17 Document types — CRUD

| Property           | Value                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Methods + URLs** | `GET /api/v1/admin/document-types`, `POST /api/v1/admin/document-types`, `GET /api/v1/admin/document-types/{document_type}`, `PUT /api/v1/admin/document-types/{document_type}`, `DELETE /api/v1/admin/document-types/{document_type}` |
| **Route names**    | `v1.admin.document-types.index/store/show/update/destroy`                                                                                                                                                                              |
| **Auth required**  | Yes (admin)                                                                                                                                                                                                                            |

**Store/Update request body:**

| Field             | Type    | Required | Rules                                                                             | Description                                  |
| ----------------- | ------- | -------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| `name`            | string  | Yes      | required, string, max:255, unique:document_types,name (ignores current on update) | Machine name (unique, e.g. `transcript`)     |
| `display_name_en` | string  | Yes      | required, string, max:255                                                         | Display name (English)                       |
| `display_name_ar` | string  | Yes      | required, string, max:255                                                         | Display name (Arabic)                        |
| `description`     | string  | No       | nullable, string                                                                  | Description                                  |
| `is_required`     | boolean | No       | boolean                                                                           | Whether this type is required for submission |

**Success responses:** `200` (show/update), `201` (store), `204` (destroy).

---

#### 3.7.18 Application types — read/update/delete

| Property           | Value                                                                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Methods + URLs** | `GET /api/v1/admin/application-types`, `GET /api/v1/admin/application-types/{application_type}`, `PUT /api/v1/admin/application-types/{application_type}`, `DELETE /api/v1/admin/application-types/{application_type}` |
| **Route names**    | `v1.admin.application-types.index/show/update/destroy`                                                                                                                                                                                                          |
| **Auth required**  | Yes (admin)                                                                                                                                                                                                                                                    |

**Store/Update request body:**

| Field                               | Type    | Required | Rules                                                                                | Description                                                                  |
| ----------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `code`                              | string  | Yes      | required, string, max:255, unique:application_types,code (ignores current on update) | Machine code (unique, e.g. `new_admission`)                                  |
| `name_ar`                           | string  | Yes      | required, string, max:255                                                            | Display name (Arabic)                                                        |
| `name_en`                           | string  | Yes      | required, string, max:255                                                            | Display name (English)                                                       |
| `requires_department_head_approval` | boolean | No       | boolean                                                                              | If true, high AI scores forward to department head instead of auto-accepting |
| `is_active`                         | boolean | No       | boolean                                                                              | Whether this type is active                                                  |

**Success responses:** `200` (show/update), `204` (destroy).

**Notes:** See `verify-ai` endpoint (3.4.7) for how `requires_department_head_approval` affects routing. There is no `POST /api/v1/admin/application-types` endpoint; application types are created via seeders.

---

#### 3.7.19 Notifications — CRUD

| Method + URL | Route name | Auth |
| ------------ | ---------- | ---- |
| `GET /api/v1/admin/notifications` | `v1.admin.notifications.index` | admin |
| `PATCH /api/v1/admin/notifications/read-all` | `v1.admin.notifications.read-all` | admin |
| `PATCH /api/v1/admin/notifications/{notification}/read` | `v1.admin.notifications.read` | admin |
| `DELETE /api/v1/admin/notifications/{notification}` | `v1.admin.notifications.destroy` | admin |

**Success responses:** `200` (index/read/read-all), `204` (destroy).

---

#### 3.7.20 Secondary school records — bulk import

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `POST /api/v1/admin/secondary-school-records/import`                      |
| **Route name**    | `v1.admin.secondary-school-records.import`                                |
| **Auth required** | Yes (admin)                                                               |
| **Rate limit**    | `uploads` (10/min)                                                        |

**Request body** (multipart/form-data):

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `file` | file | Yes | Excel/CSV file containing Tawjihi/secondary school records |

**Success response (202):**

```json
{
  "success": true,
  "message": "Import job dispatched.",
  "data": {
    "job_id": "...",
    "status": "queued"
  }
}
```

**Error responses:** `401`, `403`, `422` (invalid file).

**Notes:** This endpoint queues an `ImportSecondarySchoolRecordsJob` that processes the file asynchronously. A notification is created for the admin user when the import completes or fails. The import matches records by national ID and creates `PendingSecondarySchoolRecord` entries for unmatched students.

---

#### 3.7.21 Branches — CRUD

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/branches`           |
| **Route name**    | `v1.admin.branches.index`              |
| **Auth required** | Yes (admin)                            |

Full CRUD is available:

| Method | URL | Route name |
| ------ | --- | ---------- |
| GET | `/api/v1/admin/branches` | `v1.admin.branches.index` |
| POST | `/api/v1/admin/branches` | `v1.admin.branches.store` |
| GET | `/api/v1/admin/branches/{branch}` | `v1.admin.branches.show` |
| PUT | `/api/v1/admin/branches/{branch}` | `v1.admin.branches.update` |
| DELETE | `/api/v1/admin/branches/{branch}` | `v1.admin.branches.destroy` |

**Success responses:** `200` (index/show/update), `201` (store), `204` (destroy).

**Notes:** `Branch` records are also returned embedded inside `ProgramResource` (`branches` array) when loaded.

---

#### 3.7.22 Reports — applications by status

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/by-status`                        |
| **Route name**    | `v1.admin.reports.applications.by-status`                                  |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "submitted", "count": 120},
        {"label": "under_review", "count": 45},
        {"label": "accepted", "count": 200},
        {"label": "rejected", "count": 30}
    ]
}
```

**Error responses:** 401, 403.

---

#### 3.7.23 Reports — applications by faculty

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/by-faculty`                      |
| **Route name**    | `v1.admin.reports.applications.by-faculty`                                |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Engineering", "count": 85},
        {"label": "Medicine", "count": 40},
        {"label": "Science", "count": 60}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Faculty names are returned in English (`name_en`).

---

#### 3.7.24 Reports — applications by department

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/by-department`                   |
| **Route name**    | `v1.admin.reports.applications.by-department`                             |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Computer Science", "count": 45},
        {"label": "Mechanical Engineering", "count": 30},
        {"label": "Medicine", "count": 40}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Department names are returned in English (`name_en`).

---

#### 3.7.25 Reports — applications by program

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/by-program`                      |
| **Route name**    | `v1.admin.reports.applications.by-program`                                |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"label": "Computer Science BSc", "count": 45},
        {"label": "Software Engineering BSc", "count": 30},
        {"label": "Medicine MD", "count": 40}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are ordered by count descending.
- Program names are returned in English (`name_en`).

---

#### 3.7.26 Reports — time in status

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/time-in-status`                  |
| **Route name**    | `v1.admin.reports.applications.time-in-status`                            |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {
            "label": "under_review",
            "average_seconds": 86400.0,
            "average_minutes": 1440.0
        },
        {
            "label": "forwarded_to_department_head",
            "average_seconds": 172800.0,
            "average_minutes": 2880.0
        }
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `average_seconds` is calculated using the timestamps in `application_status_history`.
- `average_minutes` is `average_seconds / 60`, rounded to 1 decimal place.

---

#### 3.7.27 Reports — documents upload volume

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/documents/upload-volume`                      |
| **Route name**    | `v1.admin.reports.documents.upload-volume`                                |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {"date": "2026-08-01", "count": 12},
        {"date": "2026-08-02", "count": 8},
        {"date": "2026-08-03", "count": 15}
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- Results are grouped by `DATE(created_at)` and ordered by date ascending.

---

#### 3.7.28 Reports — acceptance rate by program

| Property          | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/reports/applications/acceptance-rate`                 |
| **Route name**    | `v1.admin.reports.applications.acceptance-rate`                           |
| **Auth required** | Yes (admin)                                                               |

**Query parameters:**

| Field | Type   | Required | Default        | Description                    |
| ----- | ------ | -------- | -------------- | ------------------------------ |
| `from` | date   | No       | 30 days ago    | Start date (Y-m-d)             |
| `to`   | date   | No       | today          | End date (Y-m-d)               |

**Success response (200):**

```json
{
    "success": true,
    "message": null,
    "data": [
        {
            "label": "Computer Science BSc",
            "accepted": 25,
            "rejected": 10,
            "total": 35,
            "rate": 71.4
        },
        {
            "label": "Medicine MD",
            "accepted": 40,
            "rejected": 5,
            "total": 45,
            "rate": 88.9
        }
    ]
}
```

**Error responses:** 401, 403.

**Notes:**
- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

#### 3.7.29 Admin dashboard

| Property          | Value                                  |
| ----------------- | -------------------------------------- |
| **Method + URL**  | `GET /api/v1/admin/dashboard`          |
| **Route name**    | —                                      |
| **Auth required** | Yes (admin)                            |

**Status:** This endpoint does **not** exist.

**Frontend note:** There is no admin dashboard endpoint in the current API. Admin users have full CRUD access to applications, users, programs, faculties, departments, admission cycles, document types, and application types, plus access to all report endpoints. If a dedicated admin dashboard is required, it must be implemented as a new endpoint.

---

## 4. Enums Reference

Frontend dropdowns and status badges should use these exact string values.

### 4.1 `ApplicationStatus`

| Value                          | Meaning                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `draft`                        | Student is still building the application                  |
| `submitted`                    | Student submitted; waiting for screening                   |
| `under_review`                 | Admission employee is actively screening                   |
| `returned_for_revision`        | Employee requested changes; student must resubmit          |
| `forwarded_to_department_head` | Employee completed screening; forwarded to department head |
| `returned_to_employee`         | Department head sent back for re-screening                 |
| `accepted`                     | Final admission decision — accepted                        |
| `rejected`                     | Final admission decision — rejected                        |
| `cancelled`                    | Application withdrawn (by student or admin)                |

### 4.2 `DocumentStatus`

| Value      | Meaning                           |
| ---------- | --------------------------------- |
| `pending`  | Awaiting verification             |
| `verified` | Verified by an admission employee |
| `rejected` | Rejected by an admission employee |

### 4.3 `AddressType`

| Value       | Meaning           |
| ----------- | ----------------- |
| `current`   | Current address   |
| `permanent` | Permanent address |

### 4.4 `AdmissionSemester`

| Value    | Meaning         |
| -------- | --------------- |
| `first`  | First semester  |
| `second` | Second semester |
| `summer` | Summer semester |

### 4.5 `Gender`

| Value    | Meaning |
| -------- | ------- |
| `male`   | Male    |
| `female` | Female  |

### 4.6 Roles (exact strings)

| Value                | Meaning                       |
| -------------------- | ----------------------------- |
| `student`            | Student                       |
| `admission_employee` | Admission employee / reviewer |
| `department_head`    | Department head               |
| `admission_dean`     | Admission dean                |
| `admin`              | Administrator                 |

### 4.7 Application type codes

| Code               | `requires_department_head_approval` | Meaning                    |
| ------------------ | ----------------------------------- | -------------------------- |
| `new_admission`    | false (typical)                     | Standard new admission     |
| `diploma_transfer` | true (typical)                      | Diploma transfer applicant |
| `degree_upgrade`   | varies per record                   | Degree upgrade applicant   |

**Notes:** `requires_department_head_approval` is a per-type boolean. When true and the AI score is >= 70, the application is forwarded to the department head instead of being auto-accepted.

---

## 5. Common Workflows

### 5.1 Student completes and submits an application

```text
1. POST /api/v1/auth/login (or register)
   → Store access_token

2. GET /api/v1/student/profile
   → Check personal info, addresses, emergency contacts

3. PUT /api/v1/student/profile (if needed)
   → Update personal info

4. GET /api/v1/public/document-types
   → See which document types are required

5. POST /api/v1/student/documents
   → Upload each required document (repeat for each file)

6. POST /api/v1/student/applications
   → Create draft application
   → Body: { "application_type_id": 1, "admission_cycle_id": 1, "program_id": 3 }

7. POST /api/v1/student/applications/{id}/documents/{doc_id}/attach
   → Attach each uploaded document to the application

8. GET /api/v1/student/applications/{id}/document-checklist
   → Verify all required document types are satisfied

9. POST /api/v1/student/applications/{id}/submit
   → Submit for review

10. Poll: GET /api/v1/student/applications/{id}
    → Check status changes (application_status observer creates notifications)

11. GET /api/v1/student/notifications
    → Check for status update notifications
```

### 5.2 Admission employee processes an incoming application

```text
1. POST /api/v1/auth/login
   → Store access_token

2. GET /api/v1/admission_employee/applications
   → List assigned applications (status: submitted or under_review)

3. GET /api/v1/admission_employee/applications/{id}
   → View full details with comments

4. POST /api/v1/admission_employee/applications/{id}/comments
   → Add screening notes (optional)

5. Decision:
   a) Forward: POST /api/v1/admission_employee/applications/{id}/forward
      → Status becomes forwarded_to_department_head

   b) Reject: POST /api/v1/admission_employee/applications/{id}/reject
      → Body: { "decision_reason": "..." }
      → Status becomes rejected

   c) Request revision: POST /api/v1/admission_employee/applications/{id}/request-revision
      → Status becomes returned_for_revision

   d) Re-forward: POST /api/v1/admission_employee/applications/{id}/re-forward
      → Only if status is returned_to_employee
      → Status becomes forwarded_to_department_head

   e) AI verify: POST /api/v1/admission_employee/applications/{id}/verify-ai
      → AI routing based on score and application type
```

### 5.3 Department head makes a final decision

```text
1. POST /api/v1/auth/login
   → Store access_token

2. GET /api/v1/department_head/applications
   → List forwarded applications (forwarded_to_department_head or returned_to_employee)

3. GET /api/v1/department_head/applications/{id}
   → View full details

4. Decision:
   a) Accept: POST /api/v1/department_head/applications/{id}/accept
      → Status becomes accepted

   b) Reject: POST /api/v1/department_head/applications/{id}/reject
      → Status becomes rejected

   c) Return to employee: POST /api/v1/department_head/applications/{id}/return-to-employee
      → Status becomes returned_to_employee
```

---

## 6. Changelog / Versioning

- **Current version:** v1
- **Last updated:** 2026-08-13
- **Endpoint count:** 117 documented endpoints across Public, Auth, Student, Admission Employee, Department Head, Admission Dean, and Admin. Routes live under `/api/v1/` with role-specific prefixes: `/public`, `/auth`, `/student`, `/admission_employee`, `/department_head`, `/admission_dean`, `/admin`.

### 6.1 Sentry Test Endpoint (Non-Production Only)

**Endpoint:** `GET /api/v1/sentry-test`

Only available in non-production environments. Throws an exception to verify Sentry integration.

**Success response (500):**

```json
{
    "message": "Server Error"
}
```

**Note:** Requires `SENTRY_LARAVEL_DSN` to be set in `.env` for Sentry to capture the error. When DSN is unset, the error is still returned as 500 but not reported to Sentry.

**When to regenerate this doc:** Update `docs/api.md` whenever `routes/api.php`, any `FormRequest`, any `Resource`, or any policy changes materially. Stale docs are a frontend blocker — if you change a route, update this file in the same commit.