# SmartSchool ERP - Setup Guide

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Quick Start (5 minutes)

```bash
# 1. Go to project folder
cd sms-app

# 2. Install dependencies
npm install

# 3. Setup environment variables
#    A .env file is already included with defaults.
#    For production, update NEXTAUTH_SECRET with a strong random key.

# 4. Generate Prisma client
npx prisma generate

# 5. Create database & apply schema
npx prisma db push

# 6. Seed database with demo data
npm run seed

# 7. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

| Variable          | Default                                    | Description                  |
|-------------------|--------------------------------------------|------------------------------|
| `DATABASE_URL`    | `file:./dev.db`                            | SQLite database file path    |
| `NEXTAUTH_SECRET` | `your-secret-key-change-in-production`     | JWT signing secret           |
| `NEXTAUTH_URL`    | `http://localhost:3000`                    | App base URL                 |

> For production, generate a secure secret:
> ```bash
> openssl rand -base64 32
> ```

---

## Demo Login Credentials

After running `npm run seed`:

| Role        | Email                      | Password      | Access                              |
|-------------|----------------------------|---------------|-------------------------------------|
| **Admin**   | `admin@school.com`         | `admin123`    | Full access - all 15+ modules       |
| **Teacher** | `rajesh@school.com`        | `teacher123`  | Attendance, marks, timetable        |
| **Teacher** | `priya.sharma@school.com`  | `teacher123`  | Attendance, marks, timetable        |
| **Teacher** | `anand@school.com`         | `teacher123`  | Attendance, marks, timetable        |
| **Student** | `student1@school.com`      | `student123`  | Student portal (dashboard, tests)   |
| **Parent**  | `suresh@school.com`        | `parent123`   | View child data                     |

> 15 student accounts: `student1@school.com` to `student15@school.com` (password: `student123`)
> 3 parent accounts: `suresh@school.com`, `meena@school.com`, `ramesh@school.com`

---

## Available Commands

| Command             | Description                            |
|---------------------|----------------------------------------|
| `npm run dev`       | Start development server (port 3000)   |
| `npm run build`     | Create production build                |
| `npm run start`     | Start production server                |
| `npm run seed`      | Seed database with demo data           |
| `npm run db:push`   | Push Prisma schema changes to database |
| `npm run db:studio` | Open Prisma Studio (DB browser)        |

---

## Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Framework      | Next.js 16 (App Router)        |
| Language       | TypeScript                     |
| Styling        | Tailwind CSS 4 + CSS Variables |
| Authentication | NextAuth.js v5 (JWT)           |
| Database       | SQLite (Prisma ORM)            |
| ORM            | Prisma 6                       |
| Password Hash  | bcryptjs                       |

---

## Project Structure

```
sms-app/
├── prisma/
│   ├── schema.prisma        # Database schema (20+ models)
│   └── dev.db               # SQLite database (auto-created)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── login/page.tsx    # Login page
│   │   ├── globals.css       # Themes, animations, CSS variables
│   │   ├── components/       # Sidebar, Header, Providers, Icons
│   │   ├── dashboard/        # Admin dashboard pages
│   │   │   ├── page.tsx      # Admin dashboard
│   │   │   ├── students/     # Student CRUD
│   │   │   ├── teachers/     # Teacher management
│   │   │   ├── attendance/   # Bulk attendance marking
│   │   │   ├── fees/         # Fee collection + analytics
│   │   │   ├── timetable/    # Weekly schedule grid
│   │   │   ├── library/      # Books + issue tracking
│   │   │   ├── reports/      # Charts + analytics
│   │   │   ├── notifications/# Alerts + announcements
│   │   │   ├── events/       # Calendar view
│   │   │   ├── settings/     # Theme, language, RBAC
│   │   │   └── student/      # Student portal
│   │   │       ├── page.tsx           # Student dashboard
│   │   │       ├── scores/            # Subject score sheet
│   │   │       ├── teachers/          # Teacher list + messaging
│   │   │       ├── messages/          # Inbox / sent messages
│   │   │       ├── practice-tests/    # Online MCQ tests
│   │   │       ├── leaderboard/       # Top students ranking
│   │   │       └── library/           # Browse books
│   │   └── api/              # API routes (25+)
│   │       ├── auth/         # NextAuth handler
│   │       ├── students/     # Student CRUD API
│   │       ├── teachers/     # Teacher API
│   │       ├── attendance/   # Attendance API
│   │       ├── fees/         # Fee API
│   │       ├── dashboard/    # Dashboard analytics API
│   │       ├── timetable/    # Timetable API
│   │       ├── library/      # Library + book issue API
│   │       ├── events/       # Events API
│   │       ├── notifications/# Notification API
│   │       ├── announcements/# Announcement API
│   │       ├── leaves/       # Leave management API
│   │       └── student/      # Student portal APIs
│   │           ├── dashboard/       # Student dashboard data
│   │           ├── scores/          # Score sheet data
│   │           ├── teachers/        # Teacher list
│   │           ├── messages/        # Send/receive messages
│   │           ├── practice-tests/  # Tests + submit answers
│   │           └── leaderboard/     # Top students
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       ├── auth.ts           # NextAuth configuration
│       ├── i18n.ts           # 5-language translations
│       └── seed.ts           # Database seeder
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Features by Role

### Admin
- Full dashboard with analytics (attendance chart, fee donut, events)
- Student & teacher CRUD management
- Bulk attendance marking
- Fee collection & tracking
- Timetable management
- Library management (books + issue/return)
- Reports & analytics with charts
- Notifications & announcements
- Events calendar
- Settings (5 themes, 5 languages, RBAC matrix)

### Student Portal
- Personalized dashboard (attendance %, scores, fees, books)
- Subject-wise score sheet with grades
- Teacher list with direct messaging
- Message inbox (send/receive)
- Online practice tests (5 subjects, 10 MCQ each, timer, review)
- Leaderboard (top 10 students with podium)
- Library (browse books, view issued books)

### Teacher
- View students and classes
- Mark attendance
- View timetable
- Library access

### Parent
- View child data
- View attendance and fees
- Announcements

---

## Themes & Languages

### 5 Color Themes
- Blue, Green, Purple, Orange, Dark
- Saved to localStorage, applied via CSS variables

### 5 Languages
- English, Hindi, Spanish, French, Arabic (RTL)
- Switch from header dropdown or settings page

---

## Database

SQLite is used by default (zero config). The database file is at `prisma/dev.db`.

**Browse database:**
```bash
npm run db:studio
```

**Reset database:**
```bash
npx prisma db push --force-reset
npm run seed
```

---

## Troubleshooting

| Issue                        | Fix                                                      |
|------------------------------|----------------------------------------------------------|
| Login gives "Invalid email"  | Run `npm run seed` to create demo users                  |
| Prisma client errors         | Run `npx prisma generate` then restart dev server        |
| Port 3000 already in use     | Kill process: `lsof -ti :3000 \| xargs kill`            |
| Database locked error        | Stop all processes, delete `prisma/dev.db`, re-seed      |
| Build fails with type errors | Run `npx prisma generate` first, then `npm run build`    |

---

## Production Deployment

```bash
# 1. Set environment variables
export NEXTAUTH_SECRET="your-strong-random-secret-here"
export NEXTAUTH_URL="https://your-domain.com"

# 2. Build
npm run build

# 3. Start
npm run start
```

> For production, consider switching from SQLite to PostgreSQL or MySQL by updating `datasource` in `prisma/schema.prisma` and the `DATABASE_URL` in `.env`.
