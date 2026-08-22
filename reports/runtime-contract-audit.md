# Runtime API Contract Audit Report

**Execution Date**: 2026-08-22T13:24:16.628Z
**API Base URL**: `https://university-admission-backend.onrender.com/api/v1`

## Application Lifecycle & Submission Workflow Audit

| Route | Method | Status | Created App ID | In List? | Detail Status | Dash Count | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /student/applications (before create)` | `GET` | 200 | N/A | N/A | N/A | 0 | **PASS** | Initial applications count: 0 |
| `POST /student/applications` | `POST` | 201 | 21 | N/A | draft | N/A | **PASS** | Created draft application ID: 21 (AppNo: APP-69329742) |
| `GET /student/applications (after create)` | `GET` | 200 | 21 | YES | draft | 1 | **PASS** | Verified created ID 21 appears in applications list (Count: 1) |
| `GET /student/dashboard (after create)` | `GET` | 200 | 21 | YES | draft | 1 | **PASS** | Dashboard reflects total applications: 1 |
| `POST /student/applications/21/submit` | `POST` | SKIPPED | 21 | YES | draft | 1 | **BACKEND_422_OR_PREREQUISITE_MISSING** | Submit skipped because Tawjihi record is required by backend business rules. |

## Summary Table

| Route | Role | Status | Key Checks | Value Checks | Classification | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /public/admission-cycles` | Public | 200 | Array: YES | ID: YES | Name/Year: YES | Dates: NO | Status: YES | Count: 1 | First Item: Fall 2026 | **BACKEND_RESPONSE_MISSING_KEY** | Backend returned active cycle without start_date / end_date fields |
| `GET /public/faculties` | Public | 200 | Array: YES | ID: YES | NameAr: YES | NameEn: YES | Code: NO | Count: 4 | First: كلية الآداب والعلوم الإنسانية | **PASS** | Sample faculty ID: 4 |
| `GET /public/faculties/4/departments` | Public | 200 | Array: YES | ID: YES | Name: YES | FacultyID: YES | Code: NO | Count: 2 | First Dept: اللغة العربية | **PASS** | Sample department ID: 8 |
| `GET /public/departments/8/programs` | Public | 200 | Array: YES | ID: YES | Name: YES | Degree: NO | DeptID: YES | Count: 1 | First Program: اللغة العربية والإعلام | **PASS** | Programs for department 8 (Sample Program ID: 8) |
| `GET /public/document-types` | Public | 200 | Array: YES | ID: YES | Name: YES | isRequired: YES | AllowedExt: YES | Count: 14 | Sample: birth_certificate | **PASS** | 14 document types configured |
| `POST /auth/login (Student)` | Student | 401 | Token: NO | Credentials valid: NO | Configured TEST_STUDENT_EMAIL returned status 401 | **BACKEND_401** | Provided student credentials rejected by backend with 401; testing automated registration fallback |
| `POST /auth/register (Test Student)` | Student | 200 | Token: YES | User: YES | NationalID (<=20 chars): YES | Registered student audit_student_1787405040227@university.edu.ps | **PASS** | Registration succeeded and returned valid JWT token |
| `GET /auth/me (Student)` | Student | 200 | ID: YES | Email: YES | Role: YES | Name: YES | NationalID: YES | Email: audit_student_1787405040227@university.edu.ps | NationalID: 956153303 | **PASS** | National ID present directly in /auth/me |
| `GET /student/profile` | Student | 200 | DataObj: YES | PI Key: YES | Name Key: YES | NationalID: YES | Tawjihi Key: YES | Name: طالب فحص تجريبي | NationalID: 956153303 | Contact: YES | **PASS** | Profile normalized cleanly without fake values |
| `GET /student/social-information` | Student | 200 | Unwrapped: YES | Birth Keys: YES | Guardian Keys: YES | Contact Keys: YES | Work Keys: YES | Birth Place: null | City: null | Guardian: null | **PASS** | extractResource unwrap verified; optional nulls handled without crash |
| `GET /student/applications` | Student | 200 | Array: YES | ID: YES | Status: YES | Program/Prefs: YES | Cycle: YES | Count: 0 | Status: Empty list (Valid) | **PASS** | Empty applications list handled as valid |
| `GET /student/dashboard` | Student | 200 | Unwrapped: YES | Stats Obj: YES | Total Apps: YES | Docs Count: YES | Notifs: YES | Stats: {"total_users":null,"total_students":null,"total_applications":0,"total_documents":0,"total_programs":null,"total_departments":null,"total_faculties":null,"total_admission_cycles":null,"pending_applications":0,"under_review_applications":0,"returned_for_revision_applications":0,"accepted_applications":0,"rejected_applications":0} | **PASS** | Dashboard statistics unwrapped and mapped |
| `GET /student/documents` | Student | 200 | Array: YES | ID: YES | TypeID: YES | Count: 0 | **PASS** | 0 student uploaded documents |
| `GET /student/notifications` | Student | 200 | Array: YES | ID: YES | Message: YES | Count: 0 | **PASS** | 0 student notifications |
| `GET /admin/applications` | Admin | 200 | Not 403: YES | Array: YES | ID: YES | Applicant: YES | Status: YES | AppNo: YES | Count: 20 | First: APP-37859730 | **PASS** | Admin applications list (20 records) |
| `GET /admin/users` | Admin | 200 | Array: YES | ID: YES | Role: YES | Email: YES | Name: YES | Count: 20 | First User: System Administrator | **PASS** | Admin users management (20 users) |
| `GET /admin/programs` | Admin | 200 | Array: YES | ID: YES | Name: YES | Dept: YES | Active: YES | Count: 8 | Sample: الهندسة المدنية | **PASS** | Admin programs list (8 programs) |
| `GET /admin/admission-cycles` | Admin | 200 | Array: YES | ID: YES | Year/Name: YES | Dates: NO | Status: YES | Count: 3 | **PASS** | Admin admission cycles (3 cycles) |
| `GET /admin/secondary-school-records` | Admin | 404 | Endpoint Exists: NO | Status: 404 | Count: 0 | **PENDING_BACKEND_API** | Backend only implements POST /admin/secondary-school-records/import; GET listing is pending |
| `GET /admin/notifications` | Admin | 200 | Array: YES | ID: YES | Type: YES | Message: YES | FailedRowsSafe: YES | Count: 2 | **PASS** | Admin notifications endpoint verified with secondary school import payload checks |
| `GET /admission_employee/applications` | Admission Employee | 200 | Not Admin Route: YES | Not 403: YES | Array: YES | ID: YES | Status: YES | Count: 1 | **PASS** | Dedicated employee applications route called (not admin) |
| `GET /admission_employee/notifications` | Admission Employee | 200 | Not Admin Route: YES | Array: YES | Not 403: YES | ID: YES | Count: 0 | **PASS** | Dedicated employee notifications route called (not admin) |
| `GET /department_head/applications` | Department Head | 200 | Not Admin Route: YES | Not 403: YES | Array: YES | ID: YES | Status: YES | Count: 0 | **PASS** | Dedicated head applications route called (not admin) |
| `GET /department_head/notifications` | Department Head | 200 | Not Admin Route: YES | Array: YES | Not 403: YES | ID: YES | Count: 0 | **PASS** | Dedicated head notifications route called (not admin) |

## Issue Classification Guide

- **PASS**: Endpoint responds cleanly, all expected structural keys and values exist and map properly.
- **FRONTEND_MAPPING**: Backend response contains the required key, but frontend mapping or adapter failed to read it.
- **FRONTEND_VALIDATION**: Frontend validation is stricter or inconsistent with backend contract (e.g. 9-digit restriction on national_id).
- **BACKEND_RESPONSE_MISSING_KEY**: Backend response succeeds (200 OK) but omits a required key from its payload.
- **BACKEND_APPLICATION_LIST_NOT_UPDATED**: Application was created or submitted successfully, but does not appear in GET /student/applications.
- **BACKEND_STATUS_NOT_UPDATED**: Application was submitted successfully, but status remains 'draft' in detail or list.
- **BACKEND_422_OR_PREREQUISITE_MISSING**: Prerequisite business rule missing (e.g. Tawjihi records).
- **BACKEND_403_OR_422**: Backend returned 403 Forbidden (RBAC issue) or 422 Unprocessable Entity (validation mismatch).
- **PENDING_BACKEND_API**: Endpoint or test credentials not yet configured or pending backend implementation.
- **FRONTEND_PAYLOAD**: Frontend sent an invalid or deprecated payload shape to the backend.

## Browser Route Test Checklist

| Route | Account Role Used | Main API Endpoints | Displayed Keys Checked | Unknown / Unavailable Fallback | Console / Network Errors | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/ar/login` | Public / Guest | `POST /auth/login` | email, password, token, user, role | Clean error states on bad credentials | None | PASS |
| `/ar/register` | Public / Guest | `POST /auth/register` | name, email, phone, national_id, password | Validates national_id required + max 20 | None | PASS |
| `/ar/profile` | Student | `GET /student/profile`, `GET /student/social-information` | personal_information, display name, national_id, contact, security | Localized fallback "غير متوفر" if missing; user edits preserved | None | PASS |
| `/ar/application` | Student | `GET /public/admission-cycles`, `GET /student/profile`, `GET /student/social-information` | cycles, qualification, tawjihi, personal, guardian, contact, preferences | Pre-fills from profile without overwriting draft edits | None | PASS |
| `/ar/dashboard` | Student | `GET /student/dashboard`, `GET /student/applications` | statistics (total_applications, documents, notifications), activeApplication | 0 or null handled gracefully | None | PASS |
| `/ar/applications` | Student | `GET /student/applications` | list unwrapped, status, preferences, submitted_at | Empty array handled as valid | None | PASS |
| `/ar/documents` | Student | `GET /student/documents`, `GET /public/document-types` | document list, type id, status, verification_notes | Empty list valid | None | PASS |
| `/ar/notifications` | Student | `GET /student/notifications` | list unwrapped, id, title, type, read_at | Empty list valid | None | PASS |
| `/ar/admin` | Admin | `GET /admin/stats` / `GET /admin/applications` | statistics, application count, recent admissions | 403 guarded by role | None | PASS |
| `/ar/admin/applications` | Admin | `GET /admin/applications` | applications array unwrapped, student, program, status | Filters and status chips | None | PASS |
| `/ar/admin/users` | Admin | `GET /admin/users` | users list unwrapped, id, name, email, role | Role badge and actions | None | PASS |
| `/ar/admin/secondary-school-records` | Admin | `POST /admin/secondary-school-records/import` (Upload UI) | file picker (.xlsx/.xls), 50MB max, 202 accepted processing | Upload-only; no GET listing called | None | PASS |
| `/ar/admin/notifications` | Admin | `GET /admin/notifications` | notifications list unwrapped, failed_rows summary | Failed rows expandable table | None | PASS |

