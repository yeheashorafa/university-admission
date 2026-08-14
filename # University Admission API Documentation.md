# University Admission API Documentation

## Getting Started

### Base URL

| Environment | Base URL                                                |
| ----------- | ------------------------------------------------------- |
| Local       | `http://localhost/api`                                  |
| Production  | `https://university-admission-backend.onrender.com/api` |

All endpoints are prefixed with `/v1`. The full path for any endpoint is `{base_url}/v1/...`.

### Authentication

This API uses **JWT Bearer tokens** (via `php-open-source-saver/jwt-auth`).

1. **Register** or **login** to obtain a token.
2. Include the token in the `Authorization` header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

3. Tokens expire after **1 hour**. Use `POST /api/v1/auth/refresh` to get a new one before it expires.
4. **Logout** invalidates the current token.

### Standard Response Envelope

**Success:**

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description.",
  "errors": {
    "field_name": ["Validation error message."]
  }
}
```

**204 No Content:** Returns raw `null` with no envelope body.

### Pagination

Paginated list endpoints return:

```json
{
  "data": [ ... ],
  "links": {
    "first": "http://localhost/api/v1/...",
    "last": "http://localhost/api/v1/...",
    "prev": null,
    "next": "http://localhost/api/v1/..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 75
  }
}
```

Query parameters:

- `page` — page number (default: `1`)
- `per_page` — items per page (default: `15`, max varies by endpoint)

### Rate Limiting

| Endpoint group            | Limit                     |
| ------------------------- | ------------------------- |
| Auth (login/register)     | `auth` throttle           |
| Password reset            | `password-reset` throttle |
| Email verification        | `email-verify` throttle   |
| General authenticated API | `api` throttle            |
| Admin routes              | `admin` throttle          |
| Public catalog            | `public-catalog` throttle |
| Health                    | `health` throttle         |
| File uploads              | `uploads` throttle        |

### Shared Error Codes

| Status | Meaning                                          | Example body                                                           |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------- |
| 401    | Missing or invalid JWT                           | `{"success": false, "message": "Unauthorized."}`                       |
| 403    | Authenticated but not authorized for this action | `{"success": false, "message": "Forbidden."}`                          |
| 404    | Resource not found                               | `{"success": false, "message": "Not found."}`                          |
| 422    | Validation failure                               | `{"success": false, "message": "Validation failed.", "errors": {...}}` |
| 429    | Too many requests                                | Laravel throttle response                                              |
| 500    | Server error (production: generic message)       | `{"success": false, "message": "An unexpected error occurred."}`       |

### Application Status Flow

```
draft → submitted → under_review
                              ├── returned_for_revision → submitted
                              ├── forwarded_to_department_head → accepted / rejected
                              └── returned_to_employee → submitted
under_review → rejected
forwarded_to_department_head → accepted / rejected
Any editable state → cancelled (admin only)
```

---

# Auth

## POST /api/v1/auth/register

**Purpose:** Creates a new student account and returns a JWT bearer token. Called when a user signs up through the registration form.

**Authentication:** None required (public endpoint).

**Request Body:**

| Field                   | Type   | Required | Rules                        | Example                 |
| ----------------------- | ------ | -------- | ---------------------------- | ----------------------- |
| `name`                  | string | Yes      | max 255 chars                | `"Ahmed Khaled"`        |
| `email`                 | string | Yes      | valid email, max 255, unique | `"student@example.com"` |
| `phone`                 | string | Yes      | max 50, unique               | `"+201234567890"`       |
| `password`              | string | Yes      | min 8, confirmed             | `"password123"`         |
| `password_confirmation` | string | Yes      | must match `password`        | `"password123"`         |

**Example Request:**

```json
{
  "name": "Ahmed Khaled",
  "email": "student@example.com",
  "phone": "+201234567890",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "message": "Registered successfully.",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "verified": false,
    "verification_method": "email",
    "user": {
      "id": 1,
      "name": "Ahmed Khaled",
      "email": "student@example.com",
      "phone": "+201234567890",
      "is_verified": false,
      "verification_method": "email",
      "is_active": true,
      "role": {
        "id": 3,
        "name": "student",
        "guard_name": "api"
      },
      "personal_information": null,
      "social_information": null,
      "addresses": [],
      "emergency_contacts": [],
      "secondary_school_records": [],
      "documents": [],
      "created_at": "2026-08-07T06:00:00Z",
      "updated_at": "2026-08-07T06:00:00Z"
    }
  }
}
```

**Error Responses:**

- **422 Validation failed** — duplicate email/phone, missing fields, password mismatch:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

- **500 Server error** — registration transaction fails (e.g., role assignment failure):

```json
{
  "success": false,
  "message": "An unexpected error occurred."
}
```

**Notes:**

- On success, a verification email is sent automatically.
- The `verified` flag will be `false` until the user clicks the verification link.

---

## POST /api/v1/auth/login

**Purpose:** Authenticates a user and returns a JWT bearer token. Called when a user submits the login form.

**Authentication:** None required (public endpoint).

**Request Body:**

| Field      | Type   | Required | Rules       | Example                 |
| ---------- | ------ | -------- | ----------- | ----------------------- |
| `email`    | string | Yes      | valid email | `"student@example.com"` |
| `password` | string | Yes      | non-empty   | `"password123"`         |

**Example Request:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "message": "Login successful.",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "verified": true,
    "verification_method": "email",
    "user": { ... }
  }
}
```

**Error Responses:**

- **401 Invalid credentials:**

```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

- **422 Validation failed:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## POST /api/v1/auth/forgot-password

**Purpose:** Sends a password reset link to the user's email. Called when a user clicks "Forgot password?" and submits their email.

**Authentication:** None required (public endpoint).

**Request Body:**

| Field   | Type   | Required | Rules                | Example                 |
| ------- | ------ | -------- | -------------------- | ----------------------- |
| `email` | string | Yes      | valid email, max 255 | `"student@example.com"` |

**Example Request:**

```json
{
  "email": "student@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "If the account exists, a reset link has been sent.",
  "data": null
}
```

**Error Responses:**

- **422 Validation failed:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Notes:**

- The response is intentionally the same whether the email exists or not, to prevent user enumeration.

---

## POST /api/v1/auth/reset-password

**Purpose:** Resets the user's password using a valid token from the email link. Called when the user submits the new password on the reset page.

**Authentication:** None required (public endpoint).

**Request Body:**

| Field                   | Type   | Required | Rules                     | Example                                     |
| ----------------------- | ------ | -------- | ------------------------- | ------------------------------------------- |
| `email`                 | string | Yes      | valid email, max 255      | `"student@example.com"`                     |
| `token`                 | string | Yes      | non-empty string          | `"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."` |
| `password`              | string | Yes      | min 8, max 255, confirmed | `"newSecurePass123"`                        |
| `password_confirmation` | string | Yes      | must match `password`     | `"newSecurePass123"`                        |

**Example Request:**

```json
{
  "email": "student@example.com",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "password": "newSecurePass123",
  "password_confirmation": "newSecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": null
}
```

**Error Responses:**

- **422 Invalid or expired token:**

```json
{
  "success": false,
  "message": "Invalid or expired token.",
  "errors": null
}
```

- **422 Validation failed:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "password": ["The password confirmation does not match."]
  }
}
```

---

## GET /api/v1/auth/email/verify/{id}/{hash}

**Purpose:** Verifies a user's email address when they click the verification link sent to their inbox.

**Authentication:** None required (public endpoint).

**URL Parameters:**

| Field  | Type   | Required | Example                         |
| ------ | ------ | -------- | ------------------------------- |
| `id`   | int    | Yes      | `1`                             |
| `hash` | string | Yes      | `"9b9a1c2d3e4f5a6b7c8d9e0f..."` |

**Query Parameters:**

| Field       | Type   | Required | Example      |
| ----------- | ------ | -------- | ------------ |
| `expires`   | int    | No       | `1700000000` |
| `signature` | string | No       | `"abc123"`   |

**Success Response (200) — newly verified:**

```json
{
  "success": true,
  "message": "Account verified successfully.",
  "data": null
}
```

**Success Response (200) — already verified:**

```json
{
  "success": true,
  "message": "Account already verified.",
  "data": null
}
```

**Error Responses:**

- **403 Invalid verification link:**

```json
{
  "success": false,
  "message": "Invalid verification link.",
  "errors": null
}
```

- **410 Expired verification link:**

```json
{
  "success": false,
  "message": "Verification link expired.",
  "errors": null
}
```

---

## POST /api/v1/auth/email/verification-notification

**Purpose:** Resends the account verification email. Called when a user requests a new verification email.

**Authentication:** None required (public endpoint).

**Request Body:**

| Field   | Type   | Required | Rules                | Example                 |
| ------- | ------ | -------- | -------------------- | ----------------------- |
| `email` | string | Yes      | valid email, max 255 | `"student@example.com"` |

**Example Request:**

```json
{
  "email": "student@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent.",
  "data": null
}
```

**Error Responses:**

- **422 Validation failed:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## GET /api/v1/auth/me

**Purpose:** Returns the currently authenticated user's full profile, including roles and related records. Called on app startup to restore the user session.

**Authentication:** Bearer token required. User must be active and verified.

**Authorization:** Any authenticated user can access their own record.

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "student@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "verification_method": "email",
    "is_active": true,
    "role": {
      "id": 3,
      "name": "student",
      "guard_name": "api"
    },
    "personal_information": {
      "id": 1,
      "user_id": 1,
      "national_id": "1234567890123",
      "first_name_ar": "أحمد",
      "father_name_ar": "خالد",
      "grandfather_name_ar": "محمد",
      "family_name_ar": "علي",
      "gender": "male",
      "nationality": "Egyptian",
      "date_of_birth": "2000-01-01",
      "created_at": "...",
      "updated_at": "..."
    },
    "social_information": { ... },
    "addresses": [ ... ],
    "emergency_contacts": [ ... ],
    "secondary_school_records": [ ... ],
    "documents": [ ... ],
    "created_at": "2026-08-07T06:00:00Z",
    "updated_at": "2026-08-07T06:00:00Z"
  }
}
```

**Error Responses:**

- **401 Missing or invalid token:** `{"success": false, "message": "Unauthorized."}`
- **403 Account inactive or unverified:** `{"success": false, "message": "Account inactive or unverified."}`

---

## POST /api/v1/auth/refresh

**Purpose:** Issues a new JWT access token using a valid refresh token. Called automatically by the client before the current token expires.

**Authentication:** Bearer token required.

**Authorization:** Any active, verified user.

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "message": "Token refreshed successfully.",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "verified": true,
    "verification_method": "email",
    "user": { ... }
  }
}
```

**Error Responses:**

- **401 Invalid refresh token:** `{"success": false, "message": "Unauthorized."}`
- **403 Account inactive or unverified:**

```json
{
  "success": false,
  "message": "Account inactive or unverified.",
  "errors": null
}
```

**Notes:**

- The user is re-queried from the database after decoding the token. If `is_active` is `false` or `email_verified_at` is `null`, the refresh is rejected even if the token itself is technically valid.

---

## POST /api/v1/auth/logout

**Purpose:** Invalidates the current JWT token. Called when the user logs out.

**Authentication:** Bearer token required.

**Authorization:** Any active, verified user.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Successfully logged out.",
  "data": null
}
```

**Error Responses:**

- **401 Missing or invalid token:** `{"success": false, "message": "Unauthorized."}`

**Notes:**

- The token is blacklisted and cannot be used after logout.

---

# Public

All public endpoints require no authentication and are rate-limited under the `public-catalog` throttle.

## GET /api/v1/public/admission-cycles

**Purpose:** Lists active admission cycles for the public catalog. Used on the homepage or admissions page to show current cycles.

**Authentication:** None required.

**Query Parameters:**

| Field      | Type | Required | Default | Example |
| ---------- | ---- | -------- | ------- | ------- |
| `all`      | bool | No       | `false` | `true`  |
| `page`     | int  | No       | `1`     | `1`     |
| `per_page` | int  | No       | `15`    | `20`    |

**Success Response (200):**

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
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 3,
    "total": 3
  }
}
```

**Notes:**

- When `all=false` (default), only cycles where `is_active=true` and the current date falls between `starts_at` and `ends_at` are returned.
- Cached for 1 hour.

---

## GET /api/v1/public/faculties

**Purpose:** Lists all active faculties for the public catalog.

**Authentication:** None required.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name_en": "Engineering",
      "name_ar": "الهندسة",
      "description_en": "Faculty of Engineering offers undergraduate and graduate programs.",
      "description_ar": "كلية الهندسة تقدم برامج دراسية undergraduate و graduate.",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Notes:**

- Only `is_active=true` faculties are returned.
- Cached for 1 hour.

---

## GET /api/v1/public/faculties/{faculty}/departments

**Purpose:** Lists active departments within a specific faculty.

**Authentication:** None required.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `faculty` | int  | Yes      | `1`     |

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name_en": "Computer Science",
      "name_ar": "علوم الحاسوب",
      "description_en": "Offers BSc and MSc programs in computing.",
      "description_ar": "تقدم برامج بكالوريوس وماجستير في الحوسبة.",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Notes:**

- Faculty is resolved via route-model binding.
- Cached for 1 hour.

---

## GET /api/v1/public/departments/{department}/programs

**Purpose:** Lists active programs within a specific department.

**Authentication:** None required.

**URL Parameters:**

| Field        | Type | Required | Example |
| ------------ | ---- | -------- | ------- |
| `department` | int  | Yes      | `1`     |

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name_en": "Computer Science",
      "name_ar": "علوم الحاسوب",
      "description_en": "Bachelor of Science in Computer Science.",
      "description_ar": "بكالوريوس علوم حاسوب.",
      "minimum_average": 80.0,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Notes:**

- Department is resolved via route-model binding.
- Cached for 1 hour.

---

## GET /api/v1/public/programs/{program}

**Purpose:** Shows full details for a single active program.

**Authentication:** None required.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `program` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name_en": "Computer Science",
    "name_ar": "علوم الحاسوب",
    "description_en": "Bachelor of Science in Computer Science.",
    "description_ar": "بكالوريوس علوم حاسوب.",
    "minimum_average": 80.0,
    "is_active": true,
    "branches": [],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Notes:**

- Program is resolved via route-model binding.
- Cached for 1 hour.

---

## GET /api/v1/public/document-types

**Purpose:** Lists all document types required for applications. Used on the documents upload page to show students what they need to submit.

**Authentication:** None required.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "transcript",
      "display_name_en": "Academic Transcript",
      "display_name_ar": "كشف الدرجات",
      "description": "Official transcript from the last completed academic stage.",
      "is_required": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Notes:**

- Returns both required and optional document types.
- Cached for 1 hour.

---

# Student

All student endpoints require:

- `auth:api` middleware (valid JWT)
- `active` middleware (`is_active=true`)
- `verified` middleware (`email_verified_at` not null)
- `role:student` middleware

## GET /api/v1/student/dashboard

**Purpose:** Returns the student's personal dashboard with application statistics, recent applications, documents, and active admission cycles. Called on the dashboard page load.

**Authentication:** Bearer token required. Student role only.

**Query Parameters:**

| Field      | Type | Required | Default | Example |
| ---------- | ---- | -------- | ------- | ------- |
| `page`     | int  | No       | `1`     | `1`     |
| `per_page` | int  | No       | `15`    | `20`    |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "user": { ... },
    "statistics": {
      "total_applications": 2,
      "total_documents": 3,
      "pending_applications": 1,
      "under_review_applications": 1,
      "returned_for_revision_applications": 0,
      "accepted_applications": 0,
      "rejected_applications": 0
    },
    "applications": [ ... ],
    "documents": [ ... ],
    "admission_cycles": [ ... ]
  }
}
```

**Error Responses:**

- **401** `{"success": false, "message": "Unauthorized."}`
- **403** `{"success": false, "message": "Forbidden."}`

**Notes:**

- Statistics are cached for 5 minutes per user.
- `admission_cycles` returns only active, currently-open cycles (not paginated).

---

## GET /api/v1/student/notifications

**Purpose:** Lists the student's notifications. Called on the notifications page.

**Authentication:** Bearer token required. Student role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "type": "application_status",
      "message": "Your application has been submitted.",
      "data": {
        "application_id": 1,
        "status": "submitted"
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

**Error Responses:** 401, 403.

---

## PATCH /api/v1/student/notifications/{notification}/read

**Purpose:** Marks a single notification as read. Called when the user opens or clicks a notification.

**Authentication:** Bearer token required. Student role only.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "type": "application_status",
    "message": "Your application has been submitted.",
    "data": { ... },
    "read_at": "2026-08-07T07:00:00Z",
    "created_at": "2026-08-07T06:00:00Z",
    "updated_at": "2026-08-07T07:00:00Z"
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PATCH /api/v1/student/notifications/read-all

**Purpose:** Marks all notifications as read for the current user. Called when the user clicks "Mark all as read."

**Authentication:** Bearer token required. Student role only.

**Success Response (200):**

```json
{
  "data": [
    { ... updated notification objects ... }
  }
}
```

**Error Responses:** 401, 403.

---

## DELETE /api/v1/student/notifications/{notification}

**Purpose:** Permanently deletes a notification. Called when the user dismisses a notification.

**Authentication:** Bearer token required. Student role only.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/student/profile

**Purpose:** Returns the student's full profile, including personal information, addresses, emergency contacts, social information, secondary school records, documents, and applications.

**Authentication:** Bearer token required. Student role only.

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "student@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "verification_method": "email",
    "is_active": true,
    "role": { ... },
    "personal_information": { ... },
    "social_information": { ... },
    "addresses": [ ... ],
    "emergency_contacts": [ ... ],
    "secondary_school_records": [ ... ],
    "documents": [ ... ],
    "applications": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403.

---

## PUT /api/v1/student/profile

**Purpose:** Updates the student's profile, personal information, addresses, and emergency contacts. Called when the user submits the profile edit form.

**Authentication:** Bearer token required. Student role only.

**Request Body:**

| Field                                      | Type   | Required | Rules                                                               | Example           |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------------------------- | ----------------- |
| `name`                                     | string | No       | nullable, max 255                                                   | `"Ahmed Khaled"`  |
| `phone`                                    | string | No       | nullable, max 50                                                    | `"+201234567890"` |
| `personal_information`                     | object | No       | required if no other top-level fields provided                      | see below         |
| `personal_information.national_id`         | string | No       | required if `personal_information` present, max 20, unique per user | `"1234567890123"` |
| `personal_information.first_name_ar`       | string | No       | required if `personal_information` present, max 255                 | `"أحمد"`          |
| `personal_information.father_name_ar`      | string | No       | required if `personal_information` present, max 255                 | `"خالد"`          |
| `personal_information.grandfather_name_ar` | string | No       | required if `personal_information` present, max 255                 | `"محمد"`          |
| `personal_information.family_name_ar`      | string | No       | required if `personal_information` present, max 255                 | `"علي"`           |
| `personal_information.gender`              | string | No       | required if `personal_information` present, in: `male`, `female`    | `"male"`          |
| `personal_information.nationality`         | string | No       | required if `personal_information` present, max 255                 | `"Egyptian"`      |
| `addresses`                                | array  | No       | nullable                                                            | see below         |
| `addresses.*.type`                         | string | No       | required if `addresses` present, in: `current`, `permanent`         | `"current"`       |
| `addresses.*.governorate`                  | string | No       | required if `addresses` present, max 255                            | `"Cairo"`         |
| `addresses.*.address_line`                 | string | No       | required if `addresses` present                                     | `"123 Main St"`   |
| `emergency_contacts`                       | array  | No       | nullable                                                            | see below         |
| `emergency_contacts.*.name`                | string | No       | required if `emergency_contacts` present, max 255                   | `"Mohammed Ali"`  |
| `emergency_contacts.*.relationship`        | string | No       | required if `emergency_contacts` present, max 255                   | `"father"`        |
| `emergency_contacts.*.phone`               | string | No       | required if `emergency_contacts` present, max 50                    | `"+201234567890"` |
| `emergency_contacts.*.is_primary`          | bool   | No       | sometimes                                                           | `true`            |

**Example Request:**

```json
{
  "name": "Ahmed Khaled",
  "phone": "+201234567890",
  "personal_information": {
    "national_id": "1234567890123",
    "first_name_ar": "أحمد",
    "father_name_ar": "خالد",
    "grandfather_name_ar": "محمد",
    "family_name_ar": "علي",
    "gender": "male",
    "nationality": "Egyptian"
  },
  "addresses": [
    {
      "type": "current",
      "governorate": "Cairo",
      "address_line": "123 Main St"
    }
  ],
  "emergency_contacts": [
    {
      "name": "Mohammed Ali",
      "relationship": "father",
      "phone": "+201234567890",
      "is_primary": true
    }
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated.",
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "student@example.com",
    "phone": "+201234567890",
    ...
  }
}
```

**Error Responses:**

- **422 Validation failure** — missing required fields, duplicate national_id:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "personal_information.national_id": [
      "The user personal information national id has already been taken."
    ]
  }
}
```

- **500 Server error** — transaction failure:

```json
{
  "success": false,
  "message": "An unexpected error occurred."
}
```

**Notes:**

- The entire update runs inside a database transaction.
- If `addresses` or `emergency_contacts` are provided, they replace all existing records for that type.
- `personal_information` is required if none of `name`, `phone`, `addresses`, or `emergency_contacts` are provided.

---

## GET /api/v1/student/social-information

**Purpose:** Returns the student's social information record. Creates an empty record if none exists.

**Authentication:** Bearer token required. Student role only.

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "birth_place": "Cairo",
    "birth_date": "2000-01-01",
    "first_name_en": "Ahmed",
    "father_name_en": "Khaled",
    "grandfather_name_en": "Mohammed",
    "family_name_en": "Ali",
    "guardian_name": "Mohammed Ali",
    "guardian_national_id": "1234567890123",
    "guardian_relationship": "father",
    "guardian_profession": "engineer",
    "guardian_workplace": "ministry",
    "guardian_phone": "+201234567890",
    "governorate": "Cairo",
    "city": "Cairo",
    "neighborhood": "Heliopolis",
    "street": "123 Main St",
    "phone_landline": "+20212345678",
    "father_status": "alive",
    "father_is_working": true,
    "mother_is_working": false,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403.

---

## PUT /api/v1/student/social-information

**Purpose:** Updates the student's social information. Called when the user submits the social information form.

**Authentication:** Bearer token required. Student role only.

**Request Body:**

| Field                   | Type   | Required | Rules                                           | Example           |
| ----------------------- | ------ | -------- | ----------------------------------------------- | ----------------- |
| `birth_place`           | string | No       | nullable, valid BirthPlace enum                 | `"Cairo"`         |
| `birth_date`            | date   | No       | nullable, valid date                            | `"2000-01-01"`    |
| `first_name_en`         | string | No       | nullable, max 255                               | `"Ahmed"`         |
| `father_name_en`        | string | No       | nullable, max 255                               | `"Khaled"`        |
| `grandfather_name_en`   | string | No       | nullable, max 255                               | `"Mohammed"`      |
| `family_name_en`        | string | No       | nullable, max 255                               | `"Ali"`           |
| `guardian_name`         | string | No       | nullable, max 255                               | `"Mohammed Ali"`  |
| `guardian_national_id`  | string | No       | nullable, max 20                                | `"1234567890123"` |
| `guardian_relationship` | string | No       | nullable, valid GuardianRelationship enum       | `"father"`        |
| `guardian_profession`   | string | No       | nullable, valid GuardianProfession enum         | `"engineer"`      |
| `guardian_workplace`    | string | No       | nullable, valid GuardianWorkplace enum          | `"ministry"`      |
| `guardian_phone`        | string | No       | nullable, max 50                                | `"+201234567890"` |
| `governorate`           | string | No       | nullable, max 255                               | `"Cairo"`         |
| `city`                  | string | No       | nullable, max 255                               | `"Cairo"`         |
| `neighborhood`          | string | No       | nullable, max 255                               | `"Heliopolis"`    |
| `street`                | string | No       | nullable, max 255                               | `"123 Main St"`   |
| `phone_landline`        | string | No       | nullable, max 50                                | `"+20212345678"`  |
| `father_status`         | string | No       | sometimes, in: `alive`, `deceased`, `abandoned` | `"alive"`         |
| `father_is_working`     | bool   | No       | nullable                                        | `true`            |
| `mother_is_working`     | bool   | No       | nullable                                        | `false`           |

**Example Request:**

```json
{
  "birth_place": "Cairo",
  "birth_date": "2000-01-01",
  "first_name_en": "Ahmed",
  "father_name_en": "Khaled",
  "grandfather_name_en": "Mohammed",
  "family_name_en": "Ali",
  "guardian_name": "Mohammed Ali",
  "guardian_national_id": "1234567890123",
  "guardian_relationship": "father",
  "guardian_profession": "engineer",
  "guardian_workplace": "ministry",
  "guardian_phone": "+201234567890",
  "governorate": "Cairo",
  "city": "Cairo",
  "neighborhood": "Heliopolis",
  "street": "123 Main St",
  "phone_landline": "+20212345678",
  "father_status": "alive",
  "father_is_working": true,
  "mother_is_working": false
}
```

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "birth_place": "Cairo",
    "birth_date": "2000-01-01",
    ...
  }
}
```

**Error Responses:** 401, 403, 422.

**Notes:**

- All fields are optional. Only provided fields are updated.
- `father_status` is `sometimes` — it only needs to be present if you're changing it.

---

## GET /api/v1/student/applications

**Purpose:** Lists the student's own applications. Called on the applications list page.

**Authentication:** Bearer token required. Student role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "application_number": "APP-2026-001",
      "status": "submitted",
      "student_notes": "Interested in research track.",
      "decision_reason": null,
      "assigned_reviewer_id": null,
      "reviewed_by": null,
      "submitted_at": "2026-08-07T06:00:00Z",
      "reviewed_at": null,
      "applicant": { ... },
      "admission_cycle": { ... },
      "program": { ... },
      "assigned_reviewer": null,
      "reviewer": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- Only returns applications belonging to the authenticated student.
- Includes loaded `admission_cycle` and `program` relationships.

---

## POST /api/v1/student/applications

**Purpose:** Creates a new application draft. Called when the student starts a new application.

**Authentication:** Bearer token required. Student role only.

**Request Body:**

| Field                 | Type   | Required | Rules                         | Example                                                 |
| --------------------- | ------ | -------- | ----------------------------- | ------------------------------------------------------- |
| `application_type_id` | int    | Yes      | exists in `application_types` | `1`                                                     |
| `admission_cycle_id`  | int    | Yes      | exists in `admission_cycles`  | `1`                                                     |
| `program_id`          | int    | Yes      | exists in `programs`          | `3`                                                     |
| `student_notes`       | string | No       | nullable, max 1000            | `"I am particularly interested in the research track."` |

**Example Request:**

```json
{
  "application_type_id": 1,
  "admission_cycle_id": 1,
  "program_id": 3,
  "student_notes": "I am particularly interested in the research track."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Application created.",
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "draft",
    "student_notes": "I am particularly interested in the research track.",
    "decision_reason": null,
    "assigned_reviewer_id": null,
    "reviewed_by": null,
    "submitted_at": null,
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:**

- **422 Validation failed**
- **403** — student already has an active application for the same program in the same cycle:

```json
{
  "success": false,
  "message": "You already have an active application for this program in the selected admission cycle.",
  "errors": null
}
```

**Notes:**

- "Active" means status is not `rejected` or `cancelled`.
- The application starts in `draft` status.

---

## GET /api/v1/student/applications/{application}

**Purpose:** Shows full details for a single application, including preferences, comments, and documents.

**Authentication:** Bearer token required. Student role only. Student must own the application.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "submitted",
    "student_notes": "...",
    "decision_reason": null,
    "submitted_at": "...",
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "selected_program": { ... },
    "assigned_reviewer": null,
    "reviewer": null,
    "uploaded_documents": [ ... ],
    "secondary_school_records": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403 (if not owner), 404.

---

## PUT /api/v1/student/applications/{application}

**Purpose:** Updates an application. Only allowed while the application is in an editable state (`draft` or `returned_for_revision`). Called when the student edits their application details.

**Authentication:** Bearer token required. Student role only. Student must own the application.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field           | Type   | Required | Rules                           | Example            |
| --------------- | ------ | -------- | ------------------------------- | ------------------ |
| `program_id`    | int    | No       | sometimes, exists in `programs` | `3`                |
| `student_notes` | string | No       | nullable, max 1000              | `"Updated notes."` |

**Example Request:**

```json
{
  "program_id": 3,
  "student_notes": "Updated notes about my application."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application updated.",
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "draft",
    "program_id": 3,
    "student_notes": "Updated notes about my application.",
    ...
  }
}
```

**Error Responses:**

- **422 Validation failed**
- **403** — application is not in an editable state:

```json
{
  "success": false,
  "message": "Application is not in an editable state.",
  "errors": null
}
```

- **404** — application not found or not owned by user.

---

## POST /api/v1/student/applications/{application}/submit

**Purpose:** Submits the application for review. Validates that all required document types are attached before allowing submission. Called when the student clicks "Submit application."

**Authentication:** Bearer token required. Student role only. Student must own the application.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application submitted.",
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "submitted",
    "submitted_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:**

- **422 Missing required documents:**

```json
{
  "success": false,
  "message": "Missing required documents.",
  "errors": ["Academic Transcript", "ID Copy"]
}
```

- **403** — application not in editable state.
- **404** — application not found or not owned.

**Notes:**

- Transitions status from `draft` or `returned_for_revision` to `submitted`.
- Sets `submitted_at` timestamp.

---

## GET /api/v1/student/applications/{application}/document-checklist

**Purpose:** Returns a checklist of required document types and whether each has been satisfied for the given application. Called on the application details page.

**Authentication:** Bearer token required. Student role only. Student must own the application.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document checklist retrieved.",
  "data": [
    {
      "id": 1,
      "name": "transcript",
      "display_name_en": "Academic Transcript",
      "display_name_ar": "كشف الدرجات",
      "is_required": true,
      "satisfied": true
    },
    {
      "id": 2,
      "name": "id_copy",
      "display_name_en": "ID Copy",
      "display_name_ar": "صورة الهوية",
      "is_required": true,
      "satisfied": false
    }
  ]
}
```

**Error Responses:** 401, 403, 404.

**Notes:**

- `satisfied` is `true` if the student has uploaded at least one document of that type with a non-rejected status.

---

## PUT /api/v1/student/applications/{application}/preferences

**Purpose:** Updates the student's program preference ranking (1–3). Called when the student saves their program preferences.

**Authentication:** Bearer token required. Student role only. Student must own the application.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field         | Type         | Required | Rules                                       | Example     |
| ------------- | ------------ | -------- | ------------------------------------------- | ----------- |
| `program_ids` | array of int | Yes      | min 1, max 3, each must exist in `programs` | `[3, 5, 2]` |

**Example Request:**

```json
{
  "program_ids": [3, 5, 2]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Preferences updated successfully.",
  "data": null
}
```

**Error Responses:**

- **422 Validation failed** — empty array, more than 3 items, or invalid program IDs.
- **403** — application not in editable state.
- **404** — application not found or not owned.

---

## GET /api/v1/student/documents

**Purpose:** Lists the student's uploaded documents. Called on the documents page.

**Authentication:** Bearer token required. Student role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "transcript.pdf",
      "file_path": "documents/1/transcript.pdf",
      "status": "approved",
      "ai_check_status": "passed",
      "ai_check_notes": null,
      "notes": null,
      "review_notes": null,
      "verified_at": "2026-08-07T06:00:00Z",
      "document_type": {
        "id": 1,
        "name": "transcript",
        "display_name_en": "Academic Transcript",
        "display_name_ar": "كشف الدرجات",
        "is_required": true
      },
      "user": { ... },
      "verifier": { ... },
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- Rate-limited under `uploads` throttle.

---

## POST /api/v1/student/documents

**Purpose:** Uploads a new document. Called when the student uploads a file on the documents page.

**Authentication:** Bearer token required. Student role only.

**Request Body (multipart/form-data):**

| Field              | Type   | Required | Rules                              | Example           |
| ------------------ | ------ | -------- | ---------------------------------- | ----------------- |
| `file`             | file   | Yes      | max 51200KB, mimes: pdf, jpeg, png | `transcript.pdf`  |
| `document_type_id` | int    | Yes      | exists in `document_types`         | `1`               |
| `notes`            | string | No       | nullable, max 1000                 | `"Please review"` |

**Example Request (multipart):**

```
Content-Type: multipart/form-data

file: transcript.pdf
document_type_id: 1
notes: Please review
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Document uploaded.",
  "data": {
    "id": 1,
    "name": "transcript.pdf",
    "file_path": "documents/1/transcript.pdf",
    "status": "pending",
    "ai_check_status": "pending",
    "ai_check_notes": null,
    "notes": null,
    "review_notes": null,
    "verified_at": null,
    "document_type": { ... },
    "user": { ... },
    "verifier": null,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:**

- **422 Validation failed** — invalid file type, too large, invalid document_type_id.
- **401, 403**

**Notes:**

- Rate-limited under `uploads` throttle.
- After upload, the document may be queued for AI verification depending on configuration.

---

## GET /api/v1/student/documents/{document}

**Purpose:** Returns document details and a signed download URL. Called when the student clicks to view/download a document.

**Authentication:** Bearer token required. Student role only. Student must own the document.

**URL Parameters:**

| Field      | Type | Required | Example |
| ---------- | ---- | -------- | ------- |
| `document` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "document": {
      "id": 1,
      "name": "transcript.pdf",
      "file_path": "documents/1/transcript.pdf",
      "status": "approved",
      "ai_check_status": "passed",
      ...
    },
    "download_url": "https://s3.amazonaws.com/bucket/documents/1/transcript.pdf?signature=..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## DELETE /api/v1/student/documents/{document}

**Purpose:** Permanently deletes a document. Called when the student removes a document.

**Authentication:** Bearer token required. Student role only. Student must own the document.

**URL Parameters:**

| Field      | Type | Required | Example |
| ---------- | ---- | -------- | ------- |
| `document` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## POST /api/v1/student/applications/{application}/documents/{document}/attach

**Purpose:** Attaches an existing document to an application as a required document. Called when the student attaches a document to their application.

**Authentication:** Bearer token required. Student role only. Student must own both the application and the document.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |
| `document`    | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:**

- **422** — application is not in an editable state:

```json
{
  "success": false,
  "message": "Application is not in an editable state.",
  "errors": null
}
```

- **401, 403, 404**

**Notes:**

- If the document type is already attached, the existing attachment is replaced.
- Runs inside a database transaction with row locking.

---

## GET /api/v1/student/secondary_school_records

**Purpose:** Returns the student's secondary school record.

**Authentication:** Bearer token required. Student role only.

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "student_school_id": "SCH-2024-001",
    "graduation_year": 2024,
    "average": 85.5,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403.

---

## PUT|PATCH /api/v1/student/secondary_school_records/{secondarySchoolRecord}

**Purpose:** Updates the student's secondary school record.

**Authentication:** Bearer token required. Student role only.

**URL Parameters:**

| Field                   | Type | Required | Example |
| ----------------------- | ---- | -------- | ------- |
| `secondarySchoolRecord` | int  | Yes      | `1`     |

**Request Body:**

| Field               | Type    | Required | Rules                      | Example          |
| ------------------- | ------- | -------- | -------------------------- | ---------------- |
| `student_school_id` | string  | Yes      | max 255                    | `"SCH-2024-001"` |
| `graduation_year`   | int     | Yes      | min 1990, max current year | `2024`           |
| `average`           | numeric | Yes      | min 0, max 100             | `85.5`           |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "student_school_id": "SCH-2024-001",
    "graduation_year": 2024,
    "average": 85.5,
    ...
  }
}
```

**Error Responses:** 401, 403, 422.

**Notes:**

- Route parameter name is `secondarySchoolRecord` (camelCase).

---

# Admission Employee

All admission employee endpoints require:

- `auth:api` middleware
- `active` middleware
- `verified` middleware
- `role:admission_employee|department_head` middleware

## GET /api/v1/admission_employee/applications

**Purpose:** Lists applications assigned to the authenticated admission employee. Called on the employee's dashboard/queue page.

**Authentication:** Bearer token required. Admission employee or department head role.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "application_number": "APP-2026-001",
      "status": "under_review",
      "student_notes": "...",
      "assigned_reviewer_id": 5,
      "reviewed_by": null,
      "submitted_at": "...",
      "reviewed_at": null,
      "applicant": { ... },
      "admission_cycle": { ... },
      "program": { ... },
      "assigned_reviewer": { ... },
      "reviewer": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- Returns only applications where `assigned_reviewer_id` matches the authenticated user.
- Department heads see all applications in their department via a separate policy.

---

## GET /api/v1/admission_employee/applications/{application}

**Purpose:** Shows full details for a single application, including comments and document checklist.

**Authentication:** Bearer token required. Admission employee or department head. Must be the assigned reviewer or have department-level access.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "under_review",
    "student_notes": "...",
    "decision_reason": null,
    "submitted_at": "...",
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": { ... },
    "reviewer": null,
    "comments": [
      {
        "id": 1,
        "comment": "Please provide additional documents.",
        "user": {
          "id": 5,
          "name": "Reviewer Name"
        },
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "uploaded_documents": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## POST /api/v1/admission_employee/applications/{application}/forward

**Purpose:** Forwards an application to the department head for final decision. Called when the admission employee completes their review.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application forwarded to department head.",
  "data": {
    "id": 1,
    "status": "forwarded_to_department_head",
    "reviewed_by": 5,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:**

- **422** — application cannot be forwarded in its current status:

```json
{
  "success": false,
  "message": "Application cannot be forwarded in its current status.",
  "errors": null
}
```

- **403** — user is not the assigned reviewer.

**Notes:**

- Transitions status from `under_review` or `returned_to_employee` to `forwarded_to_department_head`.

---

## POST /api/v1/admission_employee/applications/{application}/request-revision

**Purpose:** Returns the application to the student for revision. Called when the reviewer finds missing or insufficient documents.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application returned for revision.",
  "data": {
    "id": 1,
    "status": "returned_for_revision",
    "reviewed_by": 5,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:** 422 (invalid status), 403.

**Notes:**

- Transitions status to `returned_for_revision`.
- Student can then resubmit after addressing the issues.

---

## POST /api/v1/admission_employee/applications/{application}/re-forward

**Purpose:** Re-forwards an application to the department head after it was returned for revision and the student has resubmitted. Called when the reviewer is satisfied with the resubmission.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application re-forwarded to department head.",
  "data": {
    "id": 1,
    "status": "forwarded_to_department_head",
    ...
  }
}
```

**Error Responses:** 422 (invalid status), 403.

**Notes:**

- Only valid when the application is in `submitted` status after being returned for revision.

---

## POST /api/v1/admission_employee/applications/{application}/reject

**Purpose:** Rejects an application directly. Called when the reviewer determines the application does not meet requirements.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field             | Type   | Required | Rules    | Example                                         |
| ----------------- | ------ | -------- | -------- | ----------------------------------------------- |
| `decision_reason` | string | Yes      | max 1000 | `"Does not meet minimum average requirements."` |

**Example Request:**

```json
{
  "decision_reason": "Does not meet minimum average requirements."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application rejected.",
  "data": {
    "id": 1,
    "status": "rejected",
    "decision_reason": "Does not meet minimum average requirements.",
    "reviewed_by": 5,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:**

- **422** — application cannot be rejected in its current status.
- **403** — user is not the assigned reviewer.

**Notes:**

- Transitions status to `rejected`.
- The application cannot be reopened after rejection.

---

## POST /api/v1/admission_employee/applications/{application}/verify-ai

**Purpose:** Runs AI verification on an application and optionally updates its status. Called when the reviewer triggers AI-assisted verification.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field             | Type   | Required | Rules              | Example                                     |
| ----------------- | ------ | -------- | ------------------ | ------------------------------------------- |
| `decision_reason` | string | No       | nullable, max 1000 | `"AI score is high; manual review passed."` |

**Success Response (200):**

```json
{
  "success": true,
  "message": "AI verification completed.",
  "data": {
    "id": 1,
    "ai_check_status": "passed",
    "ai_check_notes": "Score: 95/100",
    ...
  }
}
```

**Error Responses:** 401, 403, 404.

**Notes:**

- The AI verification job runs asynchronously. The response reflects the document's updated `ai_check_status`.

---

## POST /api/v1/admission_employee/applications/{application}/comments

**Purpose:** Adds a comment to an application's review thread. Called when the reviewer adds a note or request.

**Authentication:** Bearer token required. Admission employee role only. Must be the assigned reviewer.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field     | Type   | Required | Rules    | Example                                    |
| --------- | ------ | -------- | -------- | ------------------------------------------ |
| `comment` | string | Yes      | max 2000 | `"Please provide the missing transcript."` |

**Example Request:**

```json
{
  "comment": "Please provide the missing transcript."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Comment added.",
  "data": {
    "id": 1,
    "comment": "Please provide the missing transcript.",
    "user": {
      "id": 5,
      "name": "Reviewer Name"
    },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## POST /api/v1/admission_employee/documents/{document}/verify

**Purpose:** Verifies or rejects an uploaded document during the review process. Called when an admission employee reviews a student's submitted document.

**Authentication:** Bearer token required. Admission employee, department head, or admin role. The employee must be the assigned reviewer for an application linked to this document.

**URL Parameters:**

| Field      | Type | Required | Example |
| ---------- | ---- | -------- | ------- |
| `document` | int  | Yes      | `1`     |

**Request Body:**

| Field          | Type   | Required | Rules                            | Example                       |
| -------------- | ------ | -------- | -------------------------------- | ----------------------------- |
| `status`       | string | Yes      | must be `verified` or `rejected` | `"verified"`                  |
| `review_notes` | string | No       | max 2000 chars                   | `"Document looks authentic."` |

**Example Request:**

```json
{
  "status": "verified",
  "review_notes": "Document looks authentic."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document verified.",
  "data": {
    "id": 1,
    "user_id": 10,
    "document_type_id": 2,
    "file_path": "documents/transcript.pdf",
    "status": "verified",
    "ai_check_status": "passed",
    "ai_check_notes": null,
    "notes": "Please review",
    "review_notes": "Document looks authentic.",
    "verified_at": "2026-08-07T06:00:00Z",
    "document_type": {
      "id": 2,
      "name": "transcript",
      "display_name_en": "Academic Transcript",
      "display_name_ar": "كشف الدرجات",
      "description": "Official transcript from previous institution.",
      "is_required": true,
      "created_at": "...",
      "updated_at": "..."
    },
    "user": {
      "id": 10,
      "name": "Student Name"
    },
    "verifier": {
      "id": 5,
      "name": "Reviewer Name"
    },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:**

- **401** — Missing or invalid JWT.
- **403** — Authenticated but not authorized to verify this document (not the assigned reviewer, or not admin).
- **404** — Document not found.

**Notes:**

- Only documents linked to an application in a reviewable status can be verified.
- Once verified or rejected, the document's `status` and `verified_at` are updated.

---

## GET /api/v1/admission_employee/notifications

**Purpose:** Lists notifications for the authenticated admission employee. Called on the notifications page.

**Authentication:** Bearer token required. Admission employee, department head, or admin role.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
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

**Error Responses:** 401, 403.

---

## PATCH /api/v1/admission_employee/notifications/{notification}/read

**Purpose:** Marks a single notification as read. Called when the user opens or clicks a notification.

**Authentication:** Bearer token required. Admission employee, department head, or admin role. Must own the notification.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "type": "staff",
    "message": "A new application has been assigned to you for review.",
    "data": {
      "application_id": 5,
      "old_status": "submitted",
      "new_status": "under_review"
    },
    "read_at": "2026-08-07T06:05:00Z",
    "created_at": "2026-08-07T06:00:00Z",
    "updated_at": "2026-08-07T06:05:00Z"
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PATCH /api/v1/admission_employee/notifications/read-all

**Purpose:** Marks all notifications as read for the current user. Called when the user clicks "Mark all as read."

**Authentication:** Bearer token required. Admission employee, department head, or admin role.

**Success Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read.",
  "data": null
}
```

**Error Responses:** 401, 403.

---

## DELETE /api/v1/admission_employee/notifications/{notification}

**Purpose:** Permanently deletes a notification. Called when the user dismisses a notification.

**Authentication:** Bearer token required. Admission employee, department head, or admin role. Must own the notification.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (204):** No content.

**Error Responses:** 401, 403, 404.

---

# Department Head

All department head endpoints require:

- `auth:api` middleware (valid JWT)
- `active` middleware (`is_active=true`)
- `verified` middleware (`email_verified_at` not null)
- `role:department_head` middleware

## GET /api/v1/department_head/applications

**Purpose:** Lists applications assigned to the department head for final review. Called on the department head's dashboard.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "application_number": "APP-2026-001",
      "status": "forwarded_to_department_head",
      "student_notes": "...",
      "decision_reason": null,
      "assigned_reviewer_id": 5,
      "reviewed_by": null,
      "submitted_at": "...",
      "reviewed_at": null,
      "applicant": { ... },
      "admission_cycle": { ... },
      "program": { ... },
      "assigned_reviewer": { ... },
      "reviewer": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- Returns applications forwarded to the department head within the user's department scope (enforced by policy).

---

## GET /api/v1/department_head/applications/{application}

**Purpose:** Shows full details for a single application under department head review.

**Authentication:** Bearer token required. Department head role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "forwarded_to_department_head",
    "student_notes": "...",
    "decision_reason": null,
    "submitted_at": "...",
    "reviewed_at": null,
    "applicant": { ... },
    "admission_cycle": { ... },
    "program": { ... },
    "assigned_reviewer": { ... },
    "reviewer": null,
    "comments": [ ... ],
    "uploaded_documents": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## POST /api/v1/department_head/applications/{application}/accept

**Purpose:** Accepts an application at the department head level. Called when the department head approves the application.

**Authentication:** Bearer token required. Department head role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application accepted.",
  "data": {
    "id": 1,
    "status": "accepted",
    "reviewed_by": 10,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:**

- **422** — application cannot be accepted in its current status.
- **403** — user is not the department head for this application's department.

**Notes:**

- Transitions status from `forwarded_to_department_head` to `accepted`.

---

## POST /api/v1/department_head/applications/{application}/reject

**Purpose:** Rejects an application at the department head level. Called when the department head denies the application.

**Authentication:** Bearer token required. Department head role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application rejected.",
  "data": {
    "id": 1,
    "status": "rejected",
    "reviewed_by": 10,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:** 422 (invalid status), 403.

**Notes:**

- Transitions status from `forwarded_to_department_head` to `rejected`.

---

## POST /api/v1/department_head/applications/{application}/return-to-employee

**Purpose:** Returns a forwarded application back to the admission employee for further review or revision. Called when the department head needs more information.

**Authentication:** Bearer token required. Department head role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application returned to employee.",
  "data": {
    "id": 1,
    "status": "returned_to_employee",
    "reviewed_by": 10,
    "reviewed_at": "2026-08-07T06:00:00Z",
    ...
  }
}
```

**Error Responses:** 422 (invalid status), 403.

**Notes:**

- Transitions status from `forwarded_to_department_head` to `returned_to_employee`.

---

## GET /api/v1/department_head/notifications

**Purpose:** Lists notifications for the authenticated department head. Called on the notifications page.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
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

**Error Responses:** 401, 403.

---

## PATCH /api/v1/department_head/notifications/{notification}/read

**Purpose:** Marks a single notification as read. Called when the user opens or clicks a notification.

**Authentication:** Bearer token required. Department head role only. Must own the notification.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "type": "staff",
    "message": "A new application has been forwarded to you for review.",
    "data": {
      "application_id": 5,
      "old_status": "under_review",
      "new_status": "forwarded_to_department_head"
    },
    "read_at": "2026-08-07T06:05:00Z",
    "created_at": "2026-08-07T06:00:00Z",
    "updated_at": "2026-08-07T06:05:00Z"
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PATCH /api/v1/department_head/notifications/read-all

**Purpose:** Marks all notifications as read for the current user. Called when the user clicks "Mark all as read."

**Authentication:** Bearer token required. Department head role only.

**Success Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read.",
  "data": null
}
```

**Error Responses:** 401, 403.

---

## DELETE /api/v1/department_head/notifications/{notification}

**Purpose:** Permanently deletes a notification. Called when the user dismisses a notification.

**Authentication:** Bearer token required. Department head role only. Must own the notification.

**URL Parameters:**

| Field          | Type | Required | Example |
| -------------- | ---- | -------- | ------- |
| `notification` | int  | Yes      | `1`     |

**Success Response (204):** No content.

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/department_head/reports/applications/by-status

**Purpose:** Returns application counts grouped by status for the department head's assigned applications. Called on the reports dashboard.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "submitted", "count": 12 },
    { "label": "under_review", "count": 5 },
    { "label": "forwarded_to_department_head", "count": 3 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- The date range defaults to the last 30 days if omitted.
- Results are scoped to applications assigned to the department head (policy-enforced).

---

## GET /api/v1/department_head/reports/applications/throughput

**Purpose:** Returns daily counts of finalized applications (accepted, rejected, or forwarded) within the date range. Used for throughput trend analysis.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "date": "2026-08-01", "count": 3 },
    { "date": "2026-08-02", "count": 1 },
    { "date": "2026-08-03", "count": 4 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Only applications with status `accepted`, `rejected`, or `forwarded_to_department_head` are counted.
- Results are grouped by `updated_at` date.

---

## GET /api/v1/department_head/reports/applications/time-to-decision

**Purpose:** Returns average time (in seconds and minutes) taken to make a decision on applications, plus total decisions counted. Used for performance monitoring.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "average_seconds", "value": 172800.0 },
    { "label": "average_minutes", "value": 2880.0 },
    { "label": "total_decisions", "value": 15 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- `average_seconds` is calculated from the time between status changes to `accepted`/`rejected` and the previous status history entry.
- `total_decisions` is the count of applications with a decision in the date range.

---

## GET /api/v1/department_head/reports/applications/acceptance-rate

**Purpose:** Returns acceptance and rejection counts grouped by program, with acceptance rate percentages. Used for program performance comparison.

**Authentication:** Bearer token required. Department head role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

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
    },
    {
      "label": "Software Engineering BSc",
      "accepted": 5,
      "rejected": 2,
      "total": 7,
      "rate": 71.4
    }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

# Admission Dean

All admission dean endpoints require:

- `auth:api` middleware (valid JWT)
- `active` middleware (`is_active=true`)
- `verified` middleware (`email_verified_at` not null)
- `role:admission_dean` middleware

## GET /api/v1/admission_dean/dashboard

**Purpose:** Returns system-wide admission statistics for the admission dean. Called on the dean's dashboard page.

**Authentication:** Bearer token required. Admission dean role only.

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": {
    "statistics": {
      "total_users": 150,
      "total_students": 100,
      "total_employees": 20,
      "total_department_heads": 10,
      "total_applications": 500,
      "total_documents": 1200,
      "total_programs": 30,
      "total_departments": 15,
      "total_faculties": 5,
      "total_admission_cycles": 3,
      "pending_applications": 50,
      "under_review_applications": 30,
      "returned_for_revision_applications": 10,
      "forwarded_to_department_head": 20,
      "returned_to_employee": 5,
      "accepted_applications": 150,
      "rejected_applications": 100
    }
  }
}
```

**Error Responses:** 401, 403.

**Notes:**

- Statistics are aggregated across all users and applications.
- Includes counts for all application statuses.

---

## GET /api/v1/admission_dean/reports/applications/by-status

**Purpose:** Returns application counts grouped by status across the entire system. Called on the admission dean's reports dashboard.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "submitted", "count": 120 },
    { "label": "under_review", "count": 45 },
    { "label": "accepted", "count": 200 },
    { "label": "rejected", "count": 30 }
  ]
}
```

**Error Responses:** 401, 403.

---

## GET /api/v1/admission_dean/reports/applications/by-faculty

**Purpose:** Returns application counts grouped by faculty. Used for faculty-level admission analytics.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Engineering", "count": 85 },
    { "label": "Medicine", "count": 40 },
    { "label": "Science", "count": 60 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Faculty names are returned in English (`name_en`).

---

## GET /api/v1/admission_dean/reports/applications/by-department

**Purpose:** Returns application counts grouped by department. Used for department-level admission analytics.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Computer Science", "count": 45 },
    { "label": "Mechanical Engineering", "count": 30 },
    { "label": "Medicine", "count": 40 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Department names are returned in English (`name_en`).

---

## GET /api/v1/admission_dean/reports/applications/by-program

**Purpose:** Returns application counts grouped by program. Used for program-level admission analytics.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Computer Science BSc", "count": 45 },
    { "label": "Software Engineering BSc", "count": 30 },
    { "label": "Medicine MD", "count": 40 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Program names are returned in English (`name_en`).

---

## GET /api/v1/admission_dean/reports/applications/time-in-status

**Purpose:** Returns the average time applications spend in each status. Used for pipeline bottleneck analysis.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

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

**Error Responses:** 401, 403.

**Notes:**

- `average_seconds` is calculated using the timestamps in `application_status_history`.
- `average_minutes` is `average_seconds / 60`, rounded to 1 decimal place.

---

## GET /api/v1/admission_dean/reports/documents/upload-volume

**Purpose:** Returns daily document upload counts. Used to track document submission trends.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "date": "2026-08-01", "count": 12 },
    { "date": "2026-08-02", "count": 8 },
    { "date": "2026-08-03", "count": 15 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are grouped by `DATE(created_at)` and ordered by date ascending.

---

## GET /api/v1/admission_dean/reports/applications/acceptance-rate

**Purpose:** Returns acceptance and rejection counts grouped by program, with acceptance rate percentages. Identical shape to the department head report but scoped to all programs system-wide.

**Authentication:** Bearer token required. Admission dean role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

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

**Error Responses:** 401, 403.

**Notes:**

- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

# Admin

All admin endpoints require:

- `auth:api` middleware (valid JWT)
- `active` middleware (`is_active=true`)
- `verified` middleware (`email_verified_at` not null)
- `admin` middleware (admin role check)

Additional `throttle:admin` rate limiting applies.

## GET /api/v1/admin/applications

**Purpose:** Lists all applications across the system for admin oversight. Called on the admin applications page.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "application_number": "APP-2026-001",
      "status": "submitted",
      "student_notes": "...",
      "decision_reason": null,
      "assigned_reviewer_id": 5,
      "reviewed_by": null,
      "submitted_at": "...",
      "reviewed_at": null,
      "applicant": { ... },
      "admission_cycle": { ... },
      "program": { ... },
      "assigned_reviewer": { ... },
      "reviewer": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## GET /api/v1/admin/applications/{application}

**Purpose:** Shows full details for a single application.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "application_number": "APP-2026-001",
    "status": "submitted",
    ...
  }
}
```

**Error Responses:** 401, 403, 404.

---

## POST /api/v1/admin/applications/{application}/assign-reviewer

**Purpose:** Assigns a reviewer to an application. Called when an admin assigns an admission employee to review an application.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Request Body:**

| Field                  | Type | Required | Rules             | Example |
| ---------------------- | ---- | -------- | ----------------- | ------- |
| `assigned_reviewer_id` | int  | Yes      | exists in `users` | `5`     |

**Example Request:**

```json
{
  "assigned_reviewer_id": 5
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reviewer assigned.",
  "data": {
    "id": 1,
    "assigned_reviewer_id": 5,
    ...
  }
}
```

**Error Responses:**

- **422** — invalid user ID.
- **403** — not an admin.

---

## POST /api/v1/admin/applications/{application}/cancel

**Purpose:** Cancels an application. Called when an admin needs to cancel an application for administrative reasons.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field         | Type | Required | Example |
| ------------- | ---- | -------- | ------- |
| `application` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application cancelled.",
  "data": {
    "id": 1,
    "status": "cancelled",
    ...
  }
}
```

**Error Responses:**

- **422** — application cannot be cancelled in its current status.
- **403** — not an admin.

**Notes:**

- Cancellation is irreversible.
- Only applications in certain states can be cancelled (enforced by policy).

---

## GET /api/v1/admin/users

**Purpose:** Lists all users. Called on the admin users page.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ahmed Khaled",
      "email": "student@example.com",
      "phone": "+201234567890",
      "is_verified": true,
      "verification_method": "email",
      "is_active": true,
      "role": {
        "id": 3,
        "name": "student",
        "guard_name": "api"
      },
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## POST /api/v1/admin/users

**Purpose:** Creates a new user. Called when an admin adds a new user to the system.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field                 | Type   | Required | Rules                                                                             | Example                 |
| --------------------- | ------ | -------- | --------------------------------------------------------------------------------- | ----------------------- |
| `name`                | string | Yes      | max 255                                                                           | `"Ahmed Khaled"`        |
| `email`               | string | Yes      | valid email, max 255, unique                                                      | `"student@example.com"` |
| `phone`               | string | Yes      | max 50, unique                                                                    | `"+201234567890"`       |
| `password`            | string | Yes      | min 8                                                                             | `"password123"`         |
| `is_active`           | bool   | No       | sometimes                                                                         | `true`                  |
| `verification_method` | string | No       | nullable, in: `email`, `phone`, `admin`                                           | `"email"`               |
| `roles`               | array  | No       | nullable                                                                          | `["student"]`           |
| `roles.*`             | string | No       | in: `student`, `admission_employee`, `department_head`, `admission_dean`, `admin` | `"student"`             |

**Example Request:**

```json
{
  "name": "Ahmed Khaled",
  "email": "student@example.com",
  "phone": "+201234567890",
  "password": "password123",
  "is_active": true,
  "verification_method": "email",
  "roles": ["student"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created.",
  "data": {
    "id": 2,
    "name": "Ahmed Khaled",
    "email": "student@example.com",
    "phone": "+201234567890",
    "is_verified": false,
    "verification_method": "email",
    "is_active": true,
    "role": {
      "id": 3,
      "name": "student",
      "guard_name": "api"
    },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:**

- **422 Validation failed** — duplicate email/phone, invalid role, etc.
- **403** — not an admin.

**Notes:**

- At most one of `admin` or `admission_dean` may be assigned due to `SingletonRole` constraint.

---

## GET /api/v1/admin/users/{user}

**Purpose:** Shows full details for a single user.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field  | Type | Required | Example |
| ------ | ---- | -------- | ------- |
| `user` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "student@example.com",
    "phone": "+201234567890",
    "is_verified": true,
    "verification_method": "email",
    "is_active": true,
    "role": { ... },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/users/{user}

**Purpose:** Updates a user's details. Called when an admin edits a user.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field  | Type | Required | Example |
| ------ | ---- | -------- | ------- |
| `user` | int  | Yes      | `1`     |

**Request Body:**

| Field       | Type   | Required | Rules                                                                             | Example                  |
| ----------- | ------ | -------- | --------------------------------------------------------------------------------- | ------------------------ |
| `name`      | string | No       | sometimes, max 255                                                                | `"Ahmed Khaled"`         |
| `email`     | string | No       | sometimes, valid email, max 255, unique                                           | `"updated@example.com"`  |
| `phone`     | string | No       | sometimes, max 50, unique                                                         | `"+201234567890"`        |
| `is_active` | bool   | No       | sometimes                                                                         | `true`                   |
| `roles`     | array  | No       | nullable                                                                          | `["admission_employee"]` |
| `roles.*`   | string | No       | in: `student`, `admission_employee`, `department_head`, `admission_dean`, `admin` | `"admission_employee"`   |

**Example Request:**

```json
{
  "name": "Ahmed Khaled",
  "email": "updated@example.com",
  "phone": "+201234567890",
  "is_active": true,
  "roles": ["admission_employee"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated.",
  "data": {
    "id": 1,
    "name": "Ahmed Khaled",
    "email": "updated@example.com",
    "phone": "+201234567890",
    "is_active": true,
    "role": { ... },
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## GET /api/v1/admin/programs

**Purpose:** Lists all programs.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "department_id": 1,
      "name_en": "Computer Science",
      "name_ar": "علوم الحاسوب",
      "description_en": "Bachelor of Science in Computer Science.",
      "description_ar": "بكالوريوس علوم حاسوب.",
      "minimum_average": 80.0,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## POST /api/v1/admin/programs

**Purpose:** Creates a new program. Called when an admin adds a program.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field             | Type    | Required | Rules                             | Example                                      |
| ----------------- | ------- | -------- | --------------------------------- | -------------------------------------------- |
| `department_id`   | int     | Yes      | exists in `departments`           | `1`                                          |
| `name_en`         | string  | Yes      | max 255, unique within department | `"Computer Science"`                         |
| `name_ar`         | string  | Yes      | max 255, unique within department | `"علوم الحاسوب"`                             |
| `description_en`  | string  | No       | nullable                          | `"Bachelor of Science in Computer Science."` |
| `description_ar`  | string  | No       | nullable                          | `"بكالوريوس علوم حاسوب."`                    |
| `minimum_average` | numeric | No       | nullable, min 0, max 100          | `80.0`                                       |
| `is_active`       | bool    | No       | boolean                           | `true`                                       |

**Example Request:**

```json
{
  "department_id": 1,
  "name_en": "Computer Science",
  "name_ar": "علوم الحاسوب",
  "description_en": "Bachelor of Science in Computer Science.",
  "description_ar": "بكالوريوس علوم حاسوب.",
  "minimum_average": 80.0,
  "is_active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Program created.",
  "data": {
    "id": 1,
    "department_id": 1,
    "name_en": "Computer Science",
    "name_ar": "علوم الحاسوب",
    "description_en": "...",
    "description_ar": "...",
    "minimum_average": 80.0,
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/programs/{program}

**Purpose:** Shows full details for a single program.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `program` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "department_id": 1,
    "name_en": "Computer Science",
    "name_ar": "علوم الحاسوب",
    "description_en": "...",
    "description_ar": "...",
    "minimum_average": 80.0,
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/programs/{program}

**Purpose:** Updates a program. Called when an admin edits program details.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `program` | int  | Yes      | `1`     |

**Request Body:**

| Field             | Type    | Required | Rules                                        | Example                  |
| ----------------- | ------- | -------- | -------------------------------------------- | ------------------------ |
| `department_id`   | int     | No       | sometimes, exists in `departments`           | `1`                      |
| `name_en`         | string  | No       | sometimes, max 255, unique within department | `"Computer Science"`     |
| `name_ar`         | string  | No       | sometimes, max 255, unique within department | `"علوم الحاسوب"`         |
| `description_en`  | string  | No       | nullable                                     | `"Updated description."` |
| `description_ar`  | string  | No       | nullable                                     | `"وصف محدث."`            |
| `minimum_average` | numeric | No       | nullable, min 0, max 100                     | `85.0`                   |
| `is_active`       | bool    | No       | boolean                                      | `true`                   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Program updated.",
  "data": {
    "id": 1,
    "department_id": 1,
    "name_en": "Computer Science",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/programs/{program}

**Purpose:** Permanently deletes a program. Called when an admin removes a program.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `program` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

**Notes:**

- Deleting a program may fail if there are active applications referencing it (enforced by database foreign key constraints or policy).

---

## GET /api/v1/admin/faculties

**Purpose:** Lists all faculties with their departments eager-loaded. Called on the admin faculties page.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name_en": "Engineering",
      "name_ar": "الهندسة",
      "description_en": "Faculty of Engineering offers undergraduate and graduate programs.",
      "description_ar": "كلية الهندسة تقدم برامج دراسية undergraduate و graduate.",
      "is_active": true,
      "departments": [
        {
          "id": 1,
          "name_en": "Computer Science",
          "name_ar": "علوم الحاسوب",
          "is_active": true
        }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- `departments` relationship is eager-loaded.

---

## POST /api/v1/admin/faculties

**Purpose:** Creates a new faculty. Called when an admin adds a faculty.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field            | Type   | Required | Rules           | Example                       |
| ---------------- | ------ | -------- | --------------- | ----------------------------- |
| `name_en`        | string | Yes      | max 255, unique | `"Engineering"`               |
| `name_ar`        | string | Yes      | max 255, unique | `"الهندسة"`                   |
| `description_en` | string | No       | nullable        | `"Faculty of Engineering..."` |
| `description_ar` | string | No       | nullable        | `"كلية الهندسة..."`           |
| `is_active`      | bool   | No       | boolean         | `true`                        |

**Example Request:**

```json
{
  "name_en": "Engineering",
  "name_ar": "الهندسة",
  "description_en": "Faculty of Engineering offers undergraduate and graduate programs.",
  "description_ar": "كلية الهندسة تقدم برامج دراسية undergraduate و graduate.",
  "is_active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Faculty created.",
  "data": {
    "id": 1,
    "name_en": "Engineering",
    "name_ar": "الهندسة",
    "description_en": "...",
    "description_ar": "...",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/faculties/{faculty}

**Purpose:** Shows full details for a single faculty, including departments.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `faculty` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name_en": "Engineering",
    "name_ar": "الهندسة",
    "description_en": "...",
    "description_ar": "...",
    "is_active": true,
    "departments": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/faculties/{faculty}

**Purpose:** Updates a faculty. Called when an admin edits faculty details.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `faculty` | int  | Yes      | `1`     |

**Request Body:**

| Field            | Type   | Required | Rules                      | Example                  |
| ---------------- | ------ | -------- | -------------------------- | ------------------------ |
| `name_en`        | string | No       | sometimes, max 255, unique | `"Engineering"`          |
| `name_ar`        | string | No       | sometimes, max 255, unique | `"الهندسة"`              |
| `description_en` | string | No       | nullable                   | `"Updated description."` |
| `description_ar` | string | No       | nullable                   | `"وصف محدث."`            |
| `is_active`      | bool   | No       | boolean                    | `true`                   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Faculty updated.",
  "data": {
    "id": 1,
    "name_en": "Engineering",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/faculties/{faculty}

**Purpose:** Permanently deletes a faculty. Called when an admin removes a faculty.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field     | Type | Required | Example |
| --------- | ---- | -------- | ------- |
| `faculty` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/admin/departments

**Purpose:** Lists all departments.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "faculty_id": 1,
      "name_en": "Computer Science",
      "name_ar": "علوم الحاسوب",
      "description_en": "...",
      "description_ar": "...",
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## POST /api/v1/admin/departments

**Purpose:** Creates a new department.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field            | Type   | Required | Rules                          | Example                                       |
| ---------------- | ------ | -------- | ------------------------------ | --------------------------------------------- |
| `faculty_id`     | int    | Yes      | exists in `faculties`          | `1`                                           |
| `name_en`        | string | Yes      | max 255, unique within faculty | `"Computer Science"`                          |
| `name_ar`        | string | Yes      | max 255, unique within faculty | `"علوم الحاسوب"`                              |
| `description_en` | string | No       | nullable                       | `"Offers BSc and MSc programs in computing."` |
| `description_ar` | string | No       | nullable                       | `"تقدم برامج بكالوريوس وماجستير في الحوسبة."` |
| `is_active`      | bool   | No       | boolean                        | `true`                                        |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Department created.",
  "data": {
    "id": 1,
    "faculty_id": 1,
    "name_en": "Computer Science",
    "name_ar": "علوم الحاسوب",
    ...
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/departments/{department}

**Purpose:** Shows full details for a single department.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field        | Type | Required | Example |
| ------------ | ---- | -------- | ------- |
| `department` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "faculty_id": 1,
    "name_en": "Computer Science",
    "name_ar": "علوم الحاسوب",
    "description_en": "...",
    "description_ar": "...",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/departments/{department}

**Purpose:** Updates a department.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field        | Type | Required | Example |
| ------------ | ---- | -------- | ------- |
| `department` | int  | Yes      | `1`     |

**Request Body:**

| Field            | Type   | Required | Rules                                     | Example                  |
| ---------------- | ------ | -------- | ----------------------------------------- | ------------------------ |
| `faculty_id`     | int    | No       | sometimes, exists in `faculties`          | `1`                      |
| `name_en`        | string | No       | sometimes, max 255, unique within faculty | `"Computer Science"`     |
| `name_ar`        | string | No       | sometimes, max 255, unique within faculty | `"علوم الحاسوب"`         |
| `description_en` | string | No       | nullable                                  | `"Updated description."` |
| `description_ar` | string | No       | nullable                                  | `"وصف محدث."`            |
| `is_active`      | bool   | No       | boolean                                   | `true`                   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Department updated.",
  "data": {
    "id": 1,
    "faculty_id": 1,
    "name_en": "Computer Science",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/departments/{department}

**Purpose:** Permanently deletes a department.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field        | Type | Required | Example |
| ------------ | ---- | -------- | ------- |
| `department` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/admin/admission-cycles

**Purpose:** Lists all admission cycles with application counts eager-loaded. Called on the admin admission cycles page.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

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
      "applications": [
        {
          "id": 1,
          "status": "submitted"
        }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

**Notes:**

- `applications` relationship is eager-loaded.

---

## POST /api/v1/admin/admission-cycles

**Purpose:** Creates a new admission cycle. Called when an admin sets up a new admission period.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field           | Type   | Required | Rules                                 | Example        |
| --------------- | ------ | -------- | ------------------------------------- | -------------- |
| `name`          | string | Yes      | max 255                               | `"Fall 2026"`  |
| `academic_year` | string | Yes      | max 255                               | `"2026-2027"`  |
| `semester`      | string | Yes      | in: `first`, `second`, `summer`       | `"first"`      |
| `starts_at`     | date   | Yes      | valid date                            | `"2026-09-01"` |
| `ends_at`       | date   | Yes      | valid date, must be after `starts_at` | `"2027-01-31"` |
| `is_active`     | bool   | No       | boolean                               | `true`         |

**Example Request:**

```json
{
  "name": "Fall 2026",
  "academic_year": "2026-2027",
  "semester": "first",
  "starts_at": "2026-09-01",
  "ends_at": "2027-01-31",
  "is_active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Admission cycle created.",
  "data": {
    "id": 1,
    "name": "Fall 2026",
    "academic_year": "2026-2027",
    "semester": "first",
    "starts_at": "2026-09-01",
    "ends_at": "2027-01-31",
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/admission-cycles/{admission_cycle}

**Purpose:** Shows full details for a single admission cycle.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field             | Type | Required | Example |
| ----------------- | ---- | -------- | ------- |
| `admission_cycle` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "Fall 2026",
    "academic_year": "2026-2027",
    "semester": "first",
    "starts_at": "2026-09-01",
    "ends_at": "2027-01-31",
    "is_active": true,
    "applications": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/admission-cycles/{admission_cycle}

**Purpose:** Updates an admission cycle.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field             | Type | Required | Example |
| ----------------- | ---- | -------- | ------- |
| `admission_cycle` | int  | Yes      | `1`     |

**Request Body:**

| Field           | Type   | Required | Rules                                      | Example        |
| --------------- | ------ | -------- | ------------------------------------------ | -------------- |
| `name`          | string | No       | sometimes, max 255                         | `"Fall 2026"`  |
| `academic_year` | string | No       | sometimes, max 255                         | `"2026-2027"`  |
| `semester`      | string | No       | sometimes, in: `first`, `second`, `summer` | `"first"`      |
| `starts_at`     | date   | No       | sometimes, valid date                      | `"2026-09-01"` |
| `ends_at`       | date   | No       | sometimes, valid date, after `starts_at`   | `"2027-01-31"` |
| `is_active`     | bool   | No       | boolean                                    | `true`         |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Admission cycle updated.",
  "data": {
    "id": 1,
    "name": "Fall 2026",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/admission-cycles/{admission_cycle}

**Purpose:** Permanently deletes an admission cycle.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field             | Type | Required | Example |
| ----------------- | ---- | -------- | ------- |
| `admission_cycle` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/admin/document-types

**Purpose:** Lists all document types.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "transcript",
      "display_name_en": "Academic Transcript",
      "display_name_ar": "كشف الدرجات",
      "description": "Official transcript from the last completed academic stage.",
      "is_required": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## POST /api/v1/admin/document-types

**Purpose:** Creates a new document type.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field             | Type   | Required | Rules           | Example                    |
| ----------------- | ------ | -------- | --------------- | -------------------------- |
| `name`            | string | Yes      | max 255, unique | `"transcript"`             |
| `display_name_en` | string | Yes      | max 255         | `"Academic Transcript"`    |
| `display_name_ar` | string | Yes      | max 255         | `"كشف الدرجات"`            |
| `description`     | string | No       | nullable        | `"Official transcript..."` |
| `is_required`     | bool   | No       | boolean         | `true`                     |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Document type created.",
  "data": {
    "id": 1,
    "name": "transcript",
    "display_name_en": "Academic Transcript",
    "display_name_ar": "كشف الدرجات",
    "description": "Official transcript...",
    "is_required": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/document-types/{document_type}

**Purpose:** Shows full details for a single document type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field           | Type | Required | Example |
| --------------- | ---- | -------- | ------- |
| `document_type` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "transcript",
    "display_name_en": "Academic Transcript",
    "display_name_ar": "كشف الدرجات",
    "description": "Official transcript...",
    "is_required": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/document-types/{document_type}

**Purpose:** Updates a document type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field           | Type | Required | Example |
| --------------- | ---- | -------- | ------- |
| `document_type` | int  | Yes      | `1`     |

**Request Body:**

| Field             | Type   | Required | Rules                      | Example                  |
| ----------------- | ------ | -------- | -------------------------- | ------------------------ |
| `name`            | string | No       | sometimes, max 255, unique | `"transcript"`           |
| `display_name_en` | string | No       | sometimes, max 255         | `"Academic Transcript"`  |
| `display_name_ar` | string | No       | sometimes, max 255         | `"كشف الدرجات"`          |
| `description`     | string | No       | nullable                   | `"Updated description."` |
| `is_required`     | bool   | No       | boolean                    | `true`                   |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document type updated.",
  "data": {
    "id": 1,
    "name": "transcript",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/document-types/{document_type}

**Purpose:** Permanently deletes a document type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field           | Type | Required | Example |
| --------------- | ---- | -------- | ------- |
| `document_type` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/admin/application-types

**Purpose:** Lists all application types.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:** `page` (default `1`), `per_page` (default `15`).

**Success Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "code": "undergraduate",
      "name_ar": "undergraduate",
      "name_en": "Undergraduate",
      "requires_department_head_approval": false,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

**Error Responses:** 401, 403.

---

## POST /api/v1/admin/application-types

**Purpose:** Creates a new application type.

**Authentication:** Bearer token required. Admin role only.

**Request Body:**

| Field                               | Type   | Required | Rules           | Example           |
| ----------------------------------- | ------ | -------- | --------------- | ----------------- |
| `code`                              | string | Yes      | max 255, unique | `"undergraduate"` |
| `name_ar`                           | string | Yes      | max 255         | `"undergraduate"` |
| `name_en`                           | string | Yes      | max 255         | `"Undergraduate"` |
| `requires_department_head_approval` | bool   | No       | boolean         | `false`           |
| `is_active`                         | bool   | No       | boolean         | `true`            |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Application type created.",
  "data": {
    "id": 1,
    "code": "undergraduate",
    "name_ar": "undergraduate",
    "name_en": "Undergraduate",
    "requires_department_head_approval": false,
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 422.

---

## GET /api/v1/admin/application-types/{application_type}

**Purpose:** Shows full details for a single application type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field              | Type | Required | Example |
| ------------------ | ---- | -------- | ------- |
| `application_type` | int  | Yes      | `1`     |

**Success Response (200):**

```json
{
  "data": {
    "id": 1,
    "code": "undergraduate",
    "name_ar": "undergraduate",
    "name_en": "Undergraduate",
    "requires_department_head_approval": false,
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Error Responses:** 401, 403, 404.

---

## PUT|PATCH /api/v1/admin/application-types/{application_type}

**Purpose:** Updates an application type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field              | Type | Required | Example |
| ------------------ | ---- | -------- | ------- |
| `application_type` | int  | Yes      | `1`     |

**Request Body:**

| Field                               | Type   | Required | Rules                      | Example           |
| ----------------------------------- | ------ | -------- | -------------------------- | ----------------- |
| `code`                              | string | No       | sometimes, max 255, unique | `"undergraduate"` |
| `name_ar`                           | string | No       | sometimes, max 255         | `"undergraduate"` |
| `name_en`                           | string | No       | sometimes, max 255         | `"Undergraduate"` |
| `requires_department_head_approval` | bool   | No       | boolean                    | `false`           |
| `is_active`                         | bool   | No       | boolean                    | `true`            |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application type updated.",
  "data": {
    "id": 1,
    "code": "undergraduate",
    ...
  }
}
```

**Error Responses:** 401, 403, 404, 422.

---

## DELETE /api/v1/admin/application-types/{application_type}

**Purpose:** Permanently deletes an application type.

**Authentication:** Bearer token required. Admin role only.

**URL Parameters:**

| Field              | Type | Required | Example |
| ------------------ | ---- | -------- | ------- |
| `application_type` | int  | Yes      | `1`     |

**Success Response (204):** `null`

**Error Responses:** 401, 403, 404.

---

## GET /api/v1/admin/reports/applications/by-status

**Purpose:** Returns application counts grouped by status across the entire system. Called on the admin reports dashboard.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "submitted", "count": 120 },
    { "label": "under_review", "count": 45 },
    { "label": "accepted", "count": 200 },
    { "label": "rejected", "count": 30 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- The date range defaults to the last 30 days if omitted.

---

## GET /api/v1/admin/reports/applications/by-faculty

**Purpose:** Returns application counts grouped by faculty. Used for faculty-level admission analytics.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Engineering", "count": 85 },
    { "label": "Medicine", "count": 40 },
    { "label": "Science", "count": 60 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Faculty names are returned in English (`name_en`).

---

## GET /api/v1/admin/reports/applications/by-department

**Purpose:** Returns application counts grouped by department. Used for department-level admission analytics.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Computer Science", "count": 45 },
    { "label": "Mechanical Engineering", "count": 30 },
    { "label": "Medicine", "count": 40 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Department names are returned in English (`name_en`).

---

## GET /api/v1/admin/reports/applications/by-program

**Purpose:** Returns application counts grouped by program. Used for program-level admission analytics.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "label": "Computer Science BSc", "count": 45 },
    { "label": "Software Engineering BSc", "count": 30 },
    { "label": "Medicine MD", "count": 40 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are ordered by count descending.
- Program names are returned in English (`name_en`).

---

## GET /api/v1/admin/reports/applications/time-in-status

**Purpose:** Returns the average time applications spend in each status. Used for pipeline bottleneck analysis.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

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

**Error Responses:** 401, 403.

**Notes:**

- `average_seconds` is calculated using the timestamps in `application_status_history`.
- `average_minutes` is `average_seconds / 60`, rounded to 1 decimal place.

---

## GET /api/v1/admin/reports/documents/upload-volume

**Purpose:** Returns daily document upload counts. Used to track document submission trends.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

```json
{
  "success": true,
  "message": null,
  "data": [
    { "date": "2026-08-01", "count": 12 },
    { "date": "2026-08-02", "count": 8 },
    { "date": "2026-08-03", "count": 15 }
  ]
}
```

**Error Responses:** 401, 403.

**Notes:**

- Results are grouped by `DATE(created_at)` and ordered by date ascending.

---

## GET /api/v1/admin/reports/applications/acceptance-rate

**Purpose:** Returns acceptance and rejection counts grouped by program, with acceptance rate percentages. Used for program performance comparison.

**Authentication:** Bearer token required. Admin role only.

**Query Parameters:**

| Field  | Type         | Required | Default     | Example        |
| ------ | ------------ | -------- | ----------- | -------------- |
| `from` | date (Y-m-d) | No       | 30 days ago | `"2026-07-01"` |
| `to`   | date (Y-m-d) | No       | today       | `"2026-08-07"` |

**Success Response (200):**

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

**Error Responses:** 401, 403.

**Notes:**

- `rate` is rounded to 1 decimal place. If `total` is 0, rate is `0.0`.
- Results are ordered by `total` descending.

---

# System

## GET /api/health

**Purpose:** Health check endpoint for monitoring and load balancers.

**Authentication:** None required. Rate-limited.

**Success Response (200) — healthy:**

```json
{
  "status": "healthy",
  "database": "up",
  "cache": "up",
  "queue": "up"
}
```

**Success Response (200) — degraded:**

```json
{
  "status": "degraded",
  "database": "down",
  "cache": "up",
  "queue": "up"
}
```

**Production behavior:** Only `status`, `database`, `cache`, and `queue` are returned. Detailed checks (`checks`, `environment`, `version`, `timestamp`) are omitted.

**Non-production behavior:** Includes `checks`, `environment`, `version`, and `timestamp` fields.

**Error Responses:**

- **503** — degraded status with same body shape.

**Notes:**

- Rate-limited under `health` throttle.
- Includes `X-API-Version`, `X-Request-ID`, and `X-Response-Time` headers.
- Does NOT include `X-App-Name` header.

---

## GET /api/v1/sentry-test

**Purpose:** Triggers an exception for Sentry integration testing.

**Authentication:** None required (only available in non-production environments). Rate-limited.

**Error Response (500):**

```json
{
  "success": false,
  "message": "An unexpected error occurred."
}
```

**Notes:**

- This route is only registered when `app()->environment('production')` is `false`.
- Rate-limited under `sentry-test` throttle.

---

# Documented Gaps

The following routes or behaviors lack explicit Form Request validation, dedicated Resource output, or standardized error handling and are documented based on controller logic:

1. **POST /api/v1/student/applications/{application}/submit** — No dedicated Form Request. Validation is performed inline in the controller (`$application->canSubmit()` and document checklist checks). Returns a 422 with `"Missing required documents."` if required documents are absent.

2. **POST /api/v1/student/applications/{application}/documents/{document}/attach** — No dedicated Form Request. Validation is limited to route-model binding and policy checks. The request body is empty; both IDs come from URL parameters. Returns 422 if the application is not in an editable state.

3. **POST /api/v1/admin/applications/{application}/cancel** — No dedicated Form Request. The controller accepts an empty body and performs a state-transition check inline (policy enforces `status NOT IN [accepted, rejected, cancelled]`).

4. **GET /api/v1/student/applications/{application}/document-checklist** — No dedicated Form Request. Returns a plain array (`$checklist`) with required/optional document statuses rather than a Resource.

5. **PUT /api/v1/student/applications/{application}/preferences** — Uses `SetPreferencesRequest`, but returns a plain success message (`"Preferences updated successfully."`) with no Resource.

6. **Report endpoints** (Admin, Admission Dean, Department Head) — Use `ReportRequest` for query validation, but return plain arrays rather than dedicated Resource classes.

7. **Pagination query params on admin CRUD list endpoints** — While the controllers use `paginate(20)`, the controller docblocks do not explicitly document `page`/`per_page` with `@queryParam`.

8. **Secondary school record route parameter** — The route uses `{secondarySchoolRecord}` (camelCase) to match the route-model binding key, but frontend consumers should use this exact casing in the path.

---

_Last updated: 2026-08-07_
