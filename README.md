# University Admission Frontend

A modern frontend application for a university admission system, built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **React Query**.

This project provides a complete user interface for student admission workflows and admin management dashboards. It is prepared for integration with a Laravel backend API.

---

## Project Overview

The University Admission Frontend is designed to support the full admission process for students and administrators.

Students can browse programs, create an account, submit applications, upload documents, track admission status, receive notifications, and complete payment steps.

Administrators can manage applications, review documents, handle manual review cases, manage users, configure programs, admission cycles, reports, settings, and legal policies.

---

## Main Features

### Student Portal

- Landing page
- Login and registration
- OTP verification flow
- Forgot and reset password pages
- Student dashboard
- Programs listing
- Program details page
- Admission application form
- Application submitted success page
- Document upload page
- Application status tracking
- Student profile page
- Student notifications page
- Payment page
- Payment success and failed pages
- Unauthorized page
- Not found page

### Admin Portal

- Admin dashboard
- Applications list
- Application details
- Manual review page
- Document verification page
- Admin notifications
- Users management
- Programs management
- Admission cycles management
- Reports page
- Settings page
- Legal policies management

### Technical Features

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Responsive layouts
- Dark and light mode
- RTL-ready structure
- Multi-language routing support
- React Query setup
- Axios API client
- Auth store using Zustand
- Role guards for admin and student areas
- Loading and error pages
- API services structure ready for backend integration

---

## Tech Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **React Query**
- **Axios**
- **Zustand**
- **next-intl**
- **Lucide React**
- **Sonner**
- **Radix UI**
- **shadcn/ui compatible setup**

---

## Project Structure

```txt
src/
  app/
    [locale]/
      admin/
      application/
      dashboard/
      documents/
      login/
      notifications/
      payment/
      profile/
      programs/
      register/
      status/
      unauthorized/
    globals.css

  components/
    auth/
    common/
    layouts/
    providers/
    shared/
    ui/

  constants/
    query-keys.ts
    routes.ts

  features/
    admin/
    application/
    application-submitted/
    auth/
    dashboard/
    documents/
    landing/
    notifications/
    payment/
    payment-result/
    profile/
    programs/
    status/
    unauthorized/
    not-found/

  hooks/
    queries/
    use-auth.ts
    use-logout.ts

  i18n/
    routing.ts

  lib/
    api-client.ts
    api-error.ts
    auth-helpers.ts
    fonts.ts
    utils.ts

  services/
    admin.service.ts
    admin-programs.service.ts
    admin-users.service.ts
    application.service.ts
    auth.service.ts
    documents.service.ts
    health.service.ts
    notifications.service.ts
    payment.service.ts
    profile.service.ts
    programs.service.ts

  stores/
    auth.store.ts

  types/
    api.ts
