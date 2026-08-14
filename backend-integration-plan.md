# Backend Integration Plan

**Generated:** 2026-08-08
**Source:** `api.md` + `# University Admission API Documentation.md` + frontend codebase audit

> **Note:** The current API documentation consists of two sources:
> - `api.md` — the authoritative, up-to-date reference (last updated 2026-08-03)
> - `# University Admission API Documentation.md` — a Scribe-generated HTML export that is incomplete/outdated
>
> This plan is based on `api.md` as the source of truth. It includes **Reports**, **Staff Notifications**, and **Manual Document Verification** endpoints that are present in `api.md` but missing from the Scribe doc.

---

## 1. Auth & Session Setup

### 1.1 JWT Token Flow

The API uses `php-open-source-saver/jwt-auth` with Bearer tokens. The flow is exactly as documented:

1. **Login** (`POST /api/v1/auth/login`) → returns `{ data: { access_token, token_type, expires_in, user } }`
2. **Token storage** → store `access_token` in `localStorage` (current pattern), attach via `Authorization: Bearer <token>` header
3. **Token refresh** (`POST /api/v1/auth/refresh`) → returns new `access_token`. Tokens expire after **1 hour** (`expires_in: 3600`).
4. **Logout** (`POST /api/v1/auth/logout`) → blacklists the current token.

**Current frontend gaps:**
- The current `auth.service.ts` has `refreshToken()` but the API client interceptor does **not** auto-refresh on 401. It only clears storage and redirects. The plan must implement an interceptor-level refresh-and-retry pattern:
  - On 401, call `/auth/refresh`
  - If refresh succeeds, retry the original request with the new token
  - If refresh fails, clear auth and redirect to login
- The current `apiClient` base URL normalization is wrong: it forces `/api/v1` suffix, but the docs say base URL is `http://localhost/api` with endpoints prefixed `/v1`. The correct base should be `http://localhost/api` and endpoints should be `/v1/...`.

### 1.2 Role Determination

The `/auth/me` response returns a `user` object with a nested `role` object:
```json
{
  "role": {
    "id": 3,
    "name": "student",
    "guard_name": "web"
  }
}
```

**Note:** `guard_name` is `"web"` in the API docs, not `"api"`. The frontend currently extracts `userRaw.role.name` as the role string. This matches the API. The frontend role constants (`student`, `admission_dean`, `department_head`, `admission_employee`, `admin`) match the API role names exactly.

**Role-driven route access:**

| Role | Route Guard | Dashboard Endpoint |
|---|---|---|
| `student` | `role:student` | `GET /student/dashboard` |
| `admission_employee` | `role:admission_employee` | `GET /admission_employee/applications` |
| `department_head` | `role:department_head` | `GET /department_head/applications` |
| `admission_dean` | `role:admission_dean` | `GET /admission_dean/dashboard` |
| `admin` | `admin` middleware | No dedicated dashboard endpoint — see gap in Section 7 |

**Action needed:**
- The `AuthUser` type already has `role: UserRole` — confirm the backend returns `role.name` as a string matching our `UserRole` union.
- The `auth.store.ts` rehydrates from localStorage and calls `/auth/me` on startup — this is correct.
- The login/register responses also include `user.role` — ensure the store captures it on login.

### 1.3 Token Expiry / 401 Handling

**Required behavior:**
- Implement a refresh queue to avoid multiple simultaneous refresh calls
- On 401:
  1. If a refresh is already in progress, queue the failed request
  2. Call `/auth/refresh`
  3. If refresh succeeds, retry all queued requests
  4. If refresh fails, clear auth and redirect to login
- Special case: 403 with message "Account inactive or unverified." → clear auth and redirect to login (do not attempt refresh)

---

## 2. Environment & Base Configuration

### 2.1 Base URL

| Environment | Frontend `.env` value | Resolved API base |
|---|---|---|
| Local | `NEXT_PUBLIC_API_URL=http://localhost/api` | `http://localhost/api/v1/...` |
| Production | `NEXT_PUBLIC_API_URL=https://university-admission-backend.onrender.com/api` | `https://university-admission-backend.onrender.com/api/v1/...` |

**Current frontend issue:** `src/lib/api/client.ts` normalizes the base URL by appending `/api/v1` if missing. This is incorrect — the base should be `http://localhost/api` (without `/v1`), and endpoints in `endpoints.ts` should include the `/v1` prefix.

**Fix:** Change `getNormalizedBaseUrl()` to NOT append `/v1`. Instead, ensure all endpoint constants in `src/lib/api/endpoints.ts` include the `/v1` prefix.

### 2.2 CORS

The API documentation confirms CORS is configured via `config/cors.php` with `CORS_ALLOWED_ORIGINS` environment variable. Only specified origins receive `Access-Control-Allow-Origin` headers. Wildcard (`*`) is not used in non-production environments where a specific origin is configured.

**Action:** Verify with backend that `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` in development. This is a backend-confirmed configuration, not an open question.

### 2.3 Rate Limiting

The docs specify throttle groups:

| Throttle Group | Endpoints | Limit |
|---|---|---|
| `auth` | login, register | 10/min |
| `password-reset` | forgot/reset password | — |
| `email-verify` | email verification | 5/min |
| `api` | general authenticated API | 60/min |
| `admin` | all admin routes | — |
| `public-catalog` | public catalog | — |
| `health` | health check | 60/min |
| `uploads` | document upload | — |

**Current frontend:** No rate-limit handling. If a 429 is returned, the app will show an unhandled error.

**Action needed:**
- Add 429 handling in the Axios error interceptor
- Show a user-friendly message like "Too many requests. Please wait X minutes."
- For React Query, add `retry` logic that respects 429 responses (do not retry on 429)
- Implement exponential backoff on 429 responses

---

## 3. Full Page/Route Inventory Mapped to Endpoints

### 3.1 Student Role

| Frontend Page | Route | Endpoint(s) | Method | Auth | Role |
|---|---|---|---|---|---|
| Landing page | `/` | `GET /api/v1/public/admission-cycles`, `GET /api/v1/public/faculties`, `GET /api/v1/public/programs/{program}` | GET | None | Public |
| Login | `/login` | `POST /api/v1/auth/login` | POST | None | Public |
| Register | `/register` | `POST /api/v1/auth/register` | POST | None | Public |
| Forgot Password | `/forgot-password` | `POST /api/v1/auth/forgot-password` | POST | None | Public |
| Reset Password | `/reset-password` | `POST /api/v1/auth/reset-password` | POST | None | Public |
| Email Verify | (link) | `GET /api/v1/auth/email/verify/{id}/{hash}` | GET | None | Public |
| Student Dashboard | `/dashboard` | `GET /api/v1/student/dashboard` | GET | Bearer | student |
| Applications List | `/applications` | `GET /api/v1/student/applications` | GET | Bearer | student |
| New Application | `/applications/new` | `POST /api/v1/student/applications` | POST | Bearer | student |
| Application Form | `/application?id={id}` | `GET /api/v1/student/applications/{id}`, `PUT /api/v1/student/applications/{id}`, `PUT /api/v1/student/applications/{id}/preferences`, `POST /api/v1/student/applications/{id}/submit` | GET/PUT/POST | Bearer | student |
| Application Submitted | `/application/submitted` | — | — | — | — |
| Documents | `/documents` | `GET /api/v1/student/documents`, `POST /api/v1/student/documents`, `DELETE /api/v1/student/documents/{id}`, `POST /api/v1/student/applications/{appId}/documents/{docId}/attach` | GET/POST/DELETE | Bearer | student |
| Application Status | `/status` | `GET /api/v1/student/applications/{id}` | GET | Bearer | student |
| Profile | `/profile` | `GET /api/v1/student/profile`, `PUT /api/v1/student/profile` | GET/PUT | Bearer | student |
| Notifications | `/notifications` | `GET /api/v1/student/notifications`, `PATCH /api/v1/student/notifications/{id}/read`, `PATCH /api/v1/student/notifications/read-all`, `DELETE /api/v1/student/notifications/{id}` | GET/PATCH/DELETE | Bearer | student |
| Social Research | `/social-research` | `GET /api/v1/student/social-information`, `PUT /api/v1/student/social-information` | GET/PUT | Bearer | student |
| Secondary School Records | (in profile wizard) | `GET /api/v1/student/secondary_school_records`, `PUT|PATCH /api/v1/student/secondary_school_records/{secondarySchoolRecord}` | GET/PUT | Bearer | student |

### 3.2 Admission Employee Role

| Frontend Page | Route | Endpoint(s) | Method | Auth | Role |
|---|---|---|---|---|---|
| Employee Dashboard | `/admin` | `GET /api/v1/admission_employee/applications` | GET | Bearer | admission_employee |
| Application Details | `/admin/applications/{id}` | `GET /api/v1/admission_employee/applications/{id}` | GET | Bearer | admission_employee |
| Forward to Head | — | `POST /api/v1/admission_employee/applications/{id}/forward` | POST | Bearer | admission_employee |
| Request Revision | — | `POST /api/v1/admission_employee/applications/{id}/request-revision` | POST | Bearer | admission_employee |
| Re-forward | — | `POST /api/v1/admission_employee/applications/{id}/re-forward` | POST | Bearer | admission_employee |
| Reject | — | `POST /api/v1/admission_employee/applications/{id}/reject` | POST | Bearer | admission_employee |
| Verify AI | — | `POST /api/v1/admission_employee/applications/{id}/verify-ai` | POST | Bearer | admission_employee |
| Add Comment | — | `POST /api/v1/admission_employee/applications/{id}/comments` | POST | Bearer | admission_employee |
| **Manual Document Verification** | — | `POST /api/v1/admission_employee/documents/{document}/verify` | POST | Bearer | admission_employee |
| **Staff Notifications** | — | `GET /api/v1/admission_employee/notifications`, `PATCH /api/v1/admission_employee/notifications/{id}/read`, `PATCH /api/v1/admission_employee/notifications/read-all`, `DELETE /api/v1/admission_employee/notifications/{id}` | GET/PATCH/DELETE | Bearer | admission_employee |

### 3.3 Department Head Role

| Frontend Page | Route | Endpoint(s) | Method | Auth | Role |
|---|---|---|---|---|---|
| Head Dashboard | `/admin` | `GET /api/v1/department_head/applications` | GET | Bearer | department_head |
| Application Details | `/admin/applications/{id}` | `GET /api/v1/department_head/applications/{id}` | GET | Bearer | department_head |
| Accept | — | `POST /api/v1/department_head/applications/{id}/accept` | POST | Bearer | department_head |
| Reject | — | `POST /api/v1/department_head/applications/{id}/reject` | POST | Bearer | department_head |
| Return to Employee | — | `POST /api/v1/department_head/applications/{id}/return-to-employee` | POST | Bearer | department_head |
| **Staff Notifications** | — | `GET /api/v1/department_head/notifications`, `PATCH /api/v1/department_head/notifications/{id}/read`, `PATCH /api/v1/department_head/notifications/read-all`, `DELETE /api/v1/department_head/notifications/{id}` | GET/PATCH/DELETE | Bearer | department_head |
| **Reports** | `/admin/reports` | `GET /api/v1/department_head/reports/applications/by-status`, `GET /api/v1/department_head/reports/applications/throughput`, `GET /api/v1/department_head/reports/applications/time-to-decision`, `GET /api/v1/department_head/reports/applications/acceptance-rate` | GET | Bearer | department_head |

### 3.4 Admission Dean Role

| Frontend Page | Route | Endpoint(s) | Method | Auth | Role |
|---|---|---|---|---|---|
| Dean Dashboard | `/admin` | `GET /api/v1/admission_dean/dashboard` | GET | Bearer | admission_dean |
| **Reports** | `/admin/reports` | `GET /api/v1/admission_dean/reports/applications/by-status`, `GET /api/v1/admission_dean/reports/applications/by-faculty`, `GET /api/v1/admission_dean/reports/applications/by-department`, `GET /api/v1/admission_dean/reports/applications/by-program`, `GET /api/v1/admission_dean/reports/applications/time-in-status`, `GET /api/v1/admission_dean/reports/documents/upload-volume`, `GET /api/v1/admission_dean/reports/applications/acceptance-rate` | GET | Bearer | admission_dean |

### 3.5 Admin Role

| Frontend Page | Route | Endpoint(s) | Method | Auth | Role |
|---|---|---|---|---|---|
| Admin Applications | `/admin/applications` | `GET /api/v1/admin/applications` | GET | Bearer | admin |
| Application Details | `/admin/applications/{id}` | `GET /api/v1/admin/applications/{id}` | GET | Bearer | admin |
| Assign Reviewer | — | `POST /api/v1/admin/applications/{id}/assign-reviewer` | POST | Bearer | admin |
| Cancel Application | — | `POST /api/v1/admin/applications/{id}/cancel` | POST | Bearer | admin |
| Users | `/admin/users` | `GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PUT|PATCH /api/v1/admin/users/{id}`, `DELETE /api/v1/admin/users/{id}` | CRUD | Bearer | admin |
| Programs | `/admin/programs` | `GET /api/v1/admin/programs`, `POST /api/v1/admin/programs`, `PUT|PATCH /api/v1/admin/programs/{id}`, `DELETE /api/v1/admin/programs/{id}` | CRUD | Bearer | admin |
| Admission Cycles | `/admin/admission-cycles` | `GET /api/v1/admin/admission-cycles`, `POST /api/v1/admin/admission-cycles`, `PUT|PATCH /admin/admission-cycles/{id}`, `DELETE /admin/admission-cycles/{id}` | CRUD | Bearer | admin |
| Faculties | (master data) | `GET /api/v1/admin/faculties`, `POST /api/v1/admin/faculties`, `PUT|PATCH /api/v1/admin/faculties/{id}`, `DELETE /api/v1/admin/faculties/{id}` | CRUD | Bearer | admin |
| Departments | (master data) | `GET /api/v1/admin/departments`, `POST /api/v1/admin/departments`, `PUT|PATCH /api/v1/admin/departments/{id}`, `DELETE /api/v1/admin/departments/{id}` | CRUD | Bearer | admin |
| Document Types | (master data) | `GET /api/v1/admin/document-types`, `POST /api/v1/admin/document-types`, `PUT|PATCH /api/v1/admin/document-types/{id}`, `DELETE /api/v1/admin/document-types/{id}` | CRUD | Bearer | admin |
| Application Types | (master data) | `GET /api/v1/admin/application-types`, `POST /api/v1/admin/application-types`, `PUT|PATCH /api/v1/admin/application-types/{id}`, `DELETE /api/v1/admin/application-types/{id}` | CRUD | Bearer | admin |
| **Reports** | `/admin/reports` | `GET /api/v1/admin/reports/applications/by-status`, `GET /api/v1/admin/reports/applications/by-faculty`, `GET /api/v1/admin/reports/applications/by-department`, `GET /api/v1/admin/reports/applications/by-program`, `GET /api/v1/admin/reports/applications/time-in-status`, `GET /api/v1/admin/reports/documents/upload-volume`, `GET /api/v1/admin/reports/applications/acceptance-rate` | GET | Bearer | admin |

### 3.6 NOT Documented in API (Frontend pages with no backend endpoint)

| Frontend Page | Route | Status |
|---|---|---|
| Settings | `/admin/settings` | ❌ No endpoint documented. **Out of scope — remove from frontend.** |
| Legal Policies | `/admin/legal-policies` | ❌ No endpoint documented. **Out of scope — remove from frontend.** |
| Application Submitted | `/application/submitted` | ⚠️ Success page — no API call needed. |
| Unauthorized | `/unauthorized` | ⚠️ Static page — no API call needed. |

---

## 4. State/Data-Fetching Strategy

### 4.1 Paginated Endpoints

The following endpoints are paginated per the docs:

- `GET /api/v1/public/admission-cycles`
- `GET /api/v1/public/faculties`
- `GET /api/v1/public/departments/{department}/programs`
- `GET /api/v1/student/applications`
- `GET /api/v1/student/documents`
- `GET /api/v1/student/notifications`
- `GET /api/v1/admission_employee/notifications`
- `GET /api/v1/department_head/notifications`
- `GET /api/v1/admin/applications`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/programs`
- `GET /api/v1/admin/admission-cycles`
- `GET /api/v1/admin/faculties`
- `GET /api/v1/admin/departments`
- `GET /api/v1/admin/document-types`
- `GET /api/v1/admin/application-types`

**Strategy:**
- Use React Query with `keepPreviousData: true` for paginated lists
- Default `per_page` is 15 — match this in query params
- Implement cursor-based or offset-based pagination controls in UI
- Cache paginated data with `staleTime: 1000 * 60` (1 minute) to avoid hammering rate-limited endpoints

### 4.2 Cached Endpoints

Per the docs, these are cached for 1 hour on the backend:

- `GET /api/v1/public/admission-cycles`
- `GET /api/v1/public/faculties`
- `GET /api/v1/public/departments/{department}/programs`
- `GET /api/v1/public/programs/{program}`
- `GET /api/v1/public/document-types`

**Strategy:**
- Set React Query `staleTime: 1000 * 60 * 60` (1 hour) for these endpoints
- Use `cacheTime: 1000 * 60 * 60 * 24` (24 hours) for public catalog data
- Do not send `Cache-Control: no-cache` on these requests — let the backend cache control headers pass through

### 4.3 Rate-Limited Endpoints

| Throttle Group | Endpoints | Limit |
|---|---|---|
| `auth` | login, register | 10/min |
| `password-reset` | forgot/reset password | — |
| `email-verify` | email verification | 5/min |
| `api` | general authenticated API | 60/min |
| `admin` | all admin routes | — |
| `public-catalog` | public catalog | — |
| `health` | health check | 60/min |
| `uploads` | document upload | — |

**Strategy:**
- Implement exponential backoff on 429 responses
- Show countdown timer to user before retrying
- Pre-fetch public catalog data on app load (cached aggressively)
- For auth endpoints, disable React Query retries entirely

### 4.4 Application Status State Machine

The docs define this flow:

```
draft → submitted → under_review
                                ├── returned_for_revision → submitted
                                ├── forwarded_to_department_head → accepted / rejected
                                └── returned_to_employee → submitted
under_review → rejected
forwarded_to_department_head → accepted / rejected
Any editable state → cancelled (admin only)
```

**Current frontend status constants** (`src/constants/application-workflow.ts`) use legacy frontend-only statuses (`ai_review`, `ai_approved`, `ai_failed`, `employee_review`, `head_review`, `payment_pending`, etc.) that do **not** exist in the backend API.

**Action required:**
- Replace `application-workflow.ts` with the exact backend statuses: `draft`, `submitted`, `under_review`, `returned_for_revision`, `forwarded_to_department_head`, `returned_to_employee`, `accepted`, `rejected`, `cancelled`
- The `normalizeStatus()` function can be removed once all frontend code uses backend statuses directly
- The `LegacyUIStatus` type should be deleted

**Editable states:** `draft`, `returned_for_revision`, `returned_to_employee` (after being returned by department head)

**Corrected reject behavior:**
- Admission employees can reject from `under_review` **or** `returned_to_employee`
- Department heads can reject from `forwarded_to_department_head` only
- Once rejected, the application cannot be reopened

### 4.5 Role-Based Data Fetching

| Role | Dashboard Endpoint | What it returns |
|---|---|---|
| `student` | `GET /student/dashboard` | User's own applications, documents, stats |
| `admission_employee` | `GET /admission_employee/applications` | Applications assigned to the employee |
| `department_head` | `GET /department_head/applications` | Applications forwarded to the department head |
| `admission_dean` | `GET /admission_dean/dashboard` | System-wide statistics |
| `admin` | No documented dashboard endpoint — see gap in Section 7 | — |

**Current frontend:** The admin dashboard page checks `isAdmissionEmployee` and shows a different component. This logic needs to be expanded to handle all 5 roles with their respective dashboard endpoints.

---

## 5. Form Validation Alignment

### 5.1 Registration Form

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name` | required, max 255 | Present | ✅ Match |
| `email` | required, valid email, max 255, unique | Present | ✅ Match |
| `phone` | required, max 50, unique | Present | ✅ Match |
| `password` | required, min 8 | Present | ✅ Match |
| `password_confirmation` | required, must match password | Present | ✅ Match |

### 5.2 Login Form

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `email` | required, valid email | Present | ✅ Match |
| `password` | required, non-empty | Present | ✅ Match |

### 5.3 Application Creation

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `application_type_id` | required, exists in `application_types` | Not in frontend payload | ❌ Missing — **needs redesign** |
| `admission_cycle_id` | required, exists in `admission_cycles` | Not in frontend payload | ❌ Missing — **needs redesign** |
| `program_id` | required, exists in `programs` | Present as `selectedPrograms` array | ⚠️ Different shape — **needs redesign** |
| `student_notes` | optional, nullable, max 1000 | Present | ✅ Match |

**Action:** The frontend's `ApplicationPayload` type sends `personalInfo`, `contactInfo`, `academicInfo`, and `selectedPrograms` as an array. The API expects `application_type_id`, `admission_cycle_id`, `program_id`, and `student_notes`. The payload shapes are completely different. The frontend must be **fully redesigned** to match the API's expected payload.

### 5.4 Application Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `program_id` | sometimes, exists in `programs` | Not aligned | ⚠️ Needs mapping |
| `student_notes` | nullable, max 1000 | Present | ✅ Match |

**Action:** Map frontend update fields to `program_id` and `student_notes`. Only editable in `draft` or `returned_for_revision` states.

### 5.5 Application Preferences Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `program_ids` | required, array of int, min 1, max 3, each must exist in `programs` | Present as `preferences` array | ⚠️ Different field name |

**Action:** Rename `preferences` to `program_ids` in the PUT request body. Ensure the array contains program IDs, not objects.

### 5.6 Profile Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name` | optional, nullable, max 255 | Present | ✅ Match |
| `phone` | optional, nullable, max 50 | Present | ✅ Match |
| `personal_information` | optional object | Present | ✅ Match |
| `addresses` | optional array | Not in frontend | ❌ Missing |
| `emergency_contacts` | optional array | Not in frontend | ❌ Missing |

**Action:** Add `addresses` and `emergency_contacts` to the profile update form and payload. The entire update runs in a transaction — if `addresses` or `emergency_contacts` are provided, they replace all existing records.

### 5.7 Social Information Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| All fields | optional, nullable | Present | ✅ Match |
| `father_status` | in: `alive`, `deceased`, `abandoned`, sometimes | Present | ✅ Match |
| `father_is_working` | nullable bool | Present | ✅ Match |
| `mother_is_working` | nullable bool | Present | ✅ Match |

### 5.8 Document Upload

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `file` | required, max 10240KB (10MB), mimes: pdf, jpeg, png | Present | ✅ Match |
| `document_type_id` | required, exists in `document_types` | Present | ✅ Match |
| `notes` | optional, nullable, max 1000 | Present | ✅ Match |

**Note:** Rate-limited under `uploads` throttle.

### 5.9 Secondary School Records

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `student_school_id` | required, max 255 | Not in frontend | ❌ Missing |
| `graduation_year` | required, int, min 1990, max current year | Not in frontend | ❌ Missing |
| `average` | required, numeric, min 0, max 100 | Not in frontend | ❌ Missing |

**Action:** Add secondary school record fields to the profile wizard. Route parameter is `secondarySchoolRecord` (camelCase).

### 5.10 Admin User Creation

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name` | required, max 255 | Present | ✅ Match |
| `email` | required, valid email, max 255, unique | Present | ✅ Match |
| `phone` | required, max 50, unique | Present | ✅ Match |
| `password` | required, min 8 | Present | ✅ Match |
| `is_active` | optional bool | Not in frontend | ❌ Missing |
| `roles` | optional array of role names | Present as `role` string | ⚠️ Different shape — API expects array of strings |

**Action:** Change `role` from string to `roles: string[]` array in admin user forms. Add `is_active` field. Note: `admin` and `admission_dean` are singleton roles — only one user can hold each.

### 5.11 Admin Program Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `department_id` | required, exists in `departments` | Not in frontend | ❌ Missing — **needs redesign** |
| `name_en` | required, max 255 | Present as `title` | ⚠️ Different field name |
| `name_ar` | required, max 255 | Not in frontend | ❌ Missing — **needs redesign** |
| `description_en` | optional, nullable | Present as `description` | ⚠️ Different field name |
| `description_ar` | optional, nullable | Not in frontend | ❌ Missing — **needs redesign** |
| `minimum_average` | optional, numeric, min 0, max 100 | Present as `minimumRate` | ✅ Match (different name) |
| `is_active` | optional bool | Present as `status` | ⚠️ Different field name/shape |

**Action:** Map frontend fields to API fields: `title` → `name_en`, `status` → `is_active`, add `name_ar` and `description_ar`. Add `department_id` selector.

### 5.12 Admission Cycle Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name` | required, max 255 | — | Check current form |
| `academic_year` | required, max 255 | — | Check current form |
| `semester` | required, in: `first`, `second`, `summer` | — | Check current form |
| `starts_at` | required, valid date | — | Check current form |
| `ends_at` | required, valid date, after `starts_at` | — | Check current form |
| `is_active` | optional bool | — | Check current form |

**Note:** Deleting an admission cycle with associated applications returns 409 with message: `"Cannot delete this admission cycle because it has associated applications."`

### 5.13 Faculty Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name_en` | required, max 255, unique | — | Check current form |
| `name_ar` | required, max 255, unique | — | Check current form |
| `description_en` | optional, nullable | — | Check current form |
| `description_ar` | optional, nullable | — | Check current form |
| `is_active` | optional bool | — | Check current form |

### 5.14 Department Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `faculty_id` | required, exists in `faculties` | — | Check current form |
| `name_en` | required, max 255, unique within faculty | — | Check current form |
| `name_ar` | required, max 255, unique within faculty | — | Check current form |
| `description_en` | optional, nullable | — | Check current form |
| `description_ar` | optional, nullable | — | Check current form |
| `is_active` | optional bool | — | Check current form |

### 5.15 Document Type Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `name` | required, max 255, unique | — | Check current form |
| `display_name_en` | required, max 255 | — | Check current form |
| `display_name_ar` | required, max 255 | — | Check current form |
| `description` | optional, nullable | — | Check current form |
| `is_required` | optional bool | — | Check current form |

### 5.16 Application Type Creation/Update

| Field | API Rules | Frontend Current | Gap |
|---|---|---|---|
| `code` | required, max 255, unique | — | Check current form |
| `name_ar` | required, max 255 | — | Check current form |
| `name_en` | required, max 255 | — | Check current form |
| `requires_department_head_approval` | optional bool | — | Check current form |
| `is_active` | optional bool | — | Check current form |

### 5.17 Admission Employee Action Payloads

| Endpoint | Request Body | Frontend Gap |
|---|---|---|
| `POST /admission_employee/applications/{id}/reject` | `{ decision_reason: string (required, max 1000) }` | ❌ Missing — form needs textarea |
| `POST /admission_employee/applications/{id}/comments` | `{ comment: string (required, max 2000) }` | ❌ Missing — form needs textarea |
| `POST /admission_employee/applications/{id}/verify-ai` | `{ decision_reason: string (nullable, max 1000) }` | ❌ Missing — optional textarea |
| `POST /admission_employee/documents/{document}/verify` | `{ status: string (required, in: verified, rejected), review_notes: string (nullable, max 2000) }` | ❌ Missing — form needs status selector + optional textarea |
| `POST /department_head/applications/{id}/reject` | Empty body (no request fields) | ✅ No payload needed |

---

## 6. Error Handling Strategy

### 6.1 Error Shape Catalog

All errors return `{ success: false, message: string, errors?: Record<string, string[]> | null }` except:

| Status | Shape | Example |
|---|---|---|
| 401 | `{ success: false, message: "Unauthorized." }` | Missing/invalid JWT |
| 403 | `{ success: false, message: "Forbidden." }` | Insufficient permissions |
| 403 | `{ success: false, message: "Account inactive or unverified.", errors: null }` | Account state issue |
| 404 | `{ success: false, message: "Not found." }` | Resource not found |
| 422 Validation | `{ success: false, message: "Validation failed.", errors: { field: ["msg"] } }` | Field-level validation |
| 422 Business rule | `{ success: false, message: "You already have an active application...", errors: null }` | Business logic violation |
| 422 Missing documents | `{ success: false, message: "Missing required documents.", errors: ["Academic Transcript", "ID Copy"] }` | Document checklist failure |
| 429 | Laravel throttle response (no standard envelope) | Rate limit exceeded |
| 500 | `{ success: false, message: "An unexpected error occurred." }` | Server error |

**204 No Content:** Returns raw `null` with no envelope body.

### 6.2 Current Frontend Error Handling

The current `api-error.ts` (`src/lib/api/api-error.ts`) already extracts `message` and `errors` from Axios errors. This matches the API envelope.

**Gaps:**
- No special handling for 429 responses
- No special handling for 403 "Account inactive or unverified" — the frontend should log the user out
- No handling for business-rule 422 errors (e.g., "already has an active application")
- The `notifications.service.ts` silently swallows all errors with empty `catch` blocks

### 6.3 Proposed Error Handling Pattern

1. **Validation errors (422):** Map `errors` object to form field errors using React Hook Form's `setError()`
2. **Business rule errors (422):** Show as toast or inline alert
3. **401:** Trigger refresh flow. If refresh fails, clear auth and redirect to login.
4. **403 inactive/unverified:** Clear auth and redirect to login with message.
5. **403 forbidden:** Show "You don't have permission" and redirect to unauthorized page.
6. **404:** Show "Not found" message.
7. **429:** Show "Too many requests. Please wait X minutes." with countdown.
8. **500:** Show generic error message. Log to error tracking (Sentry).
9. **Network errors:** Show "Network error. Please check your connection."

---

## 7. Gaps and Open Questions

### 7.1 Ambiguous Response Shapes

| Endpoint | Question |
|---|---|
| `GET /auth/me` | The docs show `personal_information`, `social_information`, etc. as nullable objects. What happens when they're null? Does the frontend need to handle missing nested objects? |
| `GET /student/dashboard` | The `applications` array inside the dashboard response — is it paginated or a flat list? The docs don't specify pagination params, so assume flat list. |
| `PATCH /student/notifications/read-all` | The docs say it returns `{ data: [...] }` — an array of updated notification objects. Does it return ALL notifications or just updated ones? |
| `GET /student/applications` | Does this include `preferences` relationship? The list response shows `selected_program` but not preferences. |

### 7.2 Missing Frontend Endpoints

The API docs mention these endpoints that the frontend does **not** currently implement:

| Endpoint | Purpose | Frontend Gap |
|---|---|---|
| `GET /auth/email/verify/{id}/{hash}` | Email verification link | No email verification flow in frontend |
| `POST /auth/email/verification-notification` | Resend verification email | No "resend verification" button |
| `GET /student/secondary_school_records` | Get secondary school record | Not in frontend |
| `PUT|PATCH /student/secondary_school_records/{id}` | Update secondary school record | Not in frontend |
| `DELETE /student/notifications/{notification}` | Delete notification | Service exists but UI doesn't have delete action |
| `GET /admission_dean/dashboard` | Dean dashboard | No dedicated dean dashboard page |
| All `admin/faculties`, `admin/departments`, `admin/document-types`, `admin/application-types` CRUD | Master data management | Not implemented in frontend UI |
| `POST /admission_employee/documents/{document}/verify` | Manual document verification | Not in frontend |
| `GET /admission_employee/notifications` | Staff notifications list | Not in frontend |
| `PATCH /admission_employee/notifications/{id}/read` | Mark staff notification as read | Not in frontend |
| `PATCH /admission_employee/notifications/read-all` | Mark all staff notifications as read | Not in frontend |
| `DELETE /admission_employee/notifications/{id}` | Delete staff notification | Not in frontend |
| `GET /department_head/notifications` | Staff notifications list | Not in frontend |
| `PATCH /department_head/notifications/{id}/read` | Mark staff notification as read | Not in frontend |
| `PATCH /department_head/notifications/read-all` | Mark all staff notifications as read | Not in frontend |
| `DELETE /department_head/notifications/{id}` | Delete staff notification | Not in frontend |
| `GET /department_head/reports/applications/by-status` | Reports | Not in frontend |
| `GET /department_head/reports/applications/throughput` | Reports | Not in frontend |
| `GET /department_head/reports/applications/time-to-decision` | Reports | Not in frontend |
| `GET /department_head/reports/applications/acceptance-rate` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/by-status` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/by-faculty` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/by-department` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/by-program` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/time-in-status` | Reports | Not in frontend |
| `GET /admission_dean/reports/documents/upload-volume` | Reports | Not in frontend |
| `GET /admission_dean/reports/applications/acceptance-rate` | Reports | Not in frontend |
| `GET /admin/reports/applications/by-status` | Reports | Not in frontend |
| `GET /admin/reports/applications/by-faculty` | Reports | Not in frontend |
| `GET /admin/reports/applications/by-department` | Reports | Not in frontend |
| `GET /admin/reports/applications/by-program` | Reports | Not in frontend |
| `GET /admin/reports/applications/time-in-status` | Reports | Not in frontend |
| `GET /admin/reports/documents/upload-volume` | Reports | Not in frontend |
| `GET /admin/reports/applications/acceptance-rate` | Reports | Not in frontend |

### 7.3 Application Type Mismatch

The API expects `application_type_id` and `admission_cycle_id` when creating an application, but the frontend's `ApplicationPayload` sends `personalInfo`, `contactInfo`, `academicInfo`, and `selectedPrograms` arrays. The payload shapes are completely incompatible.

**This requires a frontend payload redesign** to match the API's expected structure.

### 7.4 Admin Dashboard Gap

There is **no** `GET /admin/dashboard/stats` or `GET /admin/dashboard` endpoint in the current API. Admin users have full CRUD access to applications, users, programs, faculties, departments, admission cycles, document types, and application types, plus access to all report endpoints. If a dedicated admin dashboard is required, it must be implemented as a new endpoint.

---

## 8. Suggested Implementation Order

### Phase 1: Foundation (Auth → Public Catalog)
1. Fix API base URL normalization in `src/lib/api/client.ts`
2. Implement JWT refresh-and-retry interceptor with queue
3. Add 429 rate-limit handling
4. Add email verification flow (`/auth/email/verify/{id}/{hash}`)
5. Wire public catalog endpoints (`/public/programs`, `/public/faculties`, `/public/admission-cycles`, `/public/document-types`)
6. Replace all mock data with real API calls for public pages

### Phase 2: Student Core Flow
7. Fix application creation payload to match API (`application_type_id`, `admission_cycle_id`, `program_id`) — **full redesign**
8. Wire student dashboard (`/student/dashboard`)
9. Wire applications list (`/student/applications`)
10. Wire application detail/update/submit (`/student/applications/{id}`)
11. Wire document upload (`/student/documents`)
12. Wire profile update (`/student/profile`) — add `addresses` and `emergency_contacts`
13. Wire social information (`/student/social-information`)
14. Wire secondary school records (`/student/secondary_school_records`)
15. Wire notifications (`/student/notifications`)
16. Replace legacy status constants with backend statuses

### Phase 3: Admin/Employee/Head/Dean Core Workflows
17. Implement employee workflow endpoints (`/admission_employee/applications/*`) including corrected reject behavior
18. Implement **manual document verification** (`POST /admission_employee/documents/{document}/verify`)
19. Implement **staff notifications** for admission_employee (`/admission_employee/notifications/*`)
20. Implement department head workflow endpoints (`/department_head/applications/*`)
21. Implement **staff notifications** for department_head (`/department_head/notifications/*`)
22. Implement dean dashboard (`/admission_dean/dashboard`)
23. Implement admin CRUD for users, programs, admission cycles
24. Implement master data CRUD (faculties, departments, document types, application types)

### Phase 4: Reports
25. Implement reports for department_head (`/department_head/reports/*`)
26. Implement reports for admission_dean (`/admission_dean/reports/*`)
27. Implement reports for admin (`/admin/reports/*`)

### Phase 5: Cleanup
28. Remove `LegacyUIStatus` and `normalizeStatus()` once all code uses backend statuses
29. Remove duplicate role-check logic from `auth-helpers.ts`
30. Remove mock data files and demo auth
31. Add proper loading/error states for all data-fetching pages
32. Remove Settings and Legal Policies pages from frontend routing and navigation (confirmed out of scope)
33. Replace `sweetalert2` with shadcn/ui dialogs for consistency

---

## 9. Critical Pre-Integration Checklist

- [ ] Backend team confirms CORS configuration includes `http://localhost:3000`
- [ ] Backend team confirms role names match: `student`, `admission_employee`, `department_head`, `admission_dean`, `admin`
- [ ] Backend team confirms `/auth/me` response shape (especially `role` object structure and nullable nested objects)
- [ ] Backend team confirms `GET /admin/dashboard` does not exist (or provides alternative if needed)
- [ ] Frontend fixes API base URL normalization
- [ ] Frontend implements JWT refresh-and-retry interceptor
- [ ] Frontend redesigns application creation payload to match API
- [ ] Frontend removes legacy status types and uses backend statuses only
