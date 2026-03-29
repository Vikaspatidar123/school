# 🏫 SmartSchool ERP — Advanced School Management System

A modern, enterprise-grade School Management Platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Prisma**, and **NextAuth.js v5**. Features **15+ modules**, **5 color themes**, **5 languages** (with RTL), **RBAC**, animated UI, and real-time analytics.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Demo Login Credentials](#-demo-login-credentials)
- [Modules](#-modules)
- [API Endpoints](#-api-endpoints)
- [Themes & Languages](#-themes--languages)
- [Database Schema](#-database-schema)
- [User Roles & RBAC](#-user-roles--rbac)
- [Project Structure](#-project-structure)
- [Pages & URLs](#-pages--urls)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

### Core Platform
- **Modern Glass UI** — Gradient cards, animations, hover effects, shimmer loading
- **5 Color Themes** — Blue, Green, Purple, Orange, Dark (saved to localStorage)
- **5 Languages** — English, Hindi, Spanish, French, Arabic (RTL support)
- **Role-Based Access Control (RBAC)** — Dynamic permission matrix per module
- **Responsive Design** — Desktop + tablet optimized
- **Real-time Analytics** — Donut charts, bar charts, progress bars, SVG visualizations

### Modules (15+)
- **Student Management** — CRUD, search, filters, detail slide-out panel, admission tracking
- **Teacher Management** — Card-based grid, qualifications, salary, leave tracking
- **Attendance System** — Bulk marking with toggle buttons, gradient stat cards, date/class filters
- **Fee Management** — Donut chart analytics, payment collection, status tracking, receipt view
- **Timetable** — Weekly grid view with color-coded subjects, class selector
- **Library System** — Book inventory, issue/return tracking, overdue management, tabs view
- **Examination & Results** — Exam creation, marks entry, grade calculation, rank system
- **Reports & Analytics** — Circular progress charts, fee breakdown, attendance analytics, export button
- **Notifications** — Type-based alerts (info/warning/urgent), mark as read, unread count
- **Announcements** — Priority-based, role-targeted broadcasting
- **Events Calendar** — Month view calendar, event types (holiday/exam/meeting), add events
- **Leave Management** — Teacher leave requests, approval/rejection workflow
- **Transport** — Bus routes, student allocation, driver info
- **Settings** — Theme picker, language selector, RBAC permission matrix display
- **Dashboard** — Welcome banner, animated stat cards, attendance chart, fee donut, quick actions

---

## 🛠 Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Framework      | Next.js 16 (App Router)        |
| Language       | TypeScript                     |
| Styling        | Tailwind CSS 4 + CSS Variables |
| Authentication | NextAuth.js v5 (JWT)           |
| Database       | SQLite (Prisma ORM)            |
| ORM            | Prisma 6                       |
| Password Hash  | bcryptjs                       |
| Icons          | Custom SVG Components          |
| Animations     | CSS Keyframes + Transitions    |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
# 1. Navigate to the project
cd sms-app

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Create database and apply schema
npx prisma db push

# 5. Seed database with demo data (15 students, 3 teachers, events, timetable, books, etc.)
npm run seed

# 6. Start development server
npm run dev
```

Open **http://localhost:3000**

### Available Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start development server             |
| `npm run build`     | Create production build              |
| `npm run start`     | Start production server              |
| `npm run seed`      | Seed database with demo data         |
| `npm run db:push`   | Push Prisma schema to database       |
| `npm run db:studio` | Open Prisma Studio (DB browser)      |

---

## 🔐 Demo Login Credentials

After running `npm run seed`:

| Role        | Email                    | Password       | Access Level                        |
|-------------|--------------------------|----------------|-------------------------------------|
| **Admin**   | `admin@school.com`       | `admin123`     | Full control — all 15+ modules      |
| **Teacher** | `rajesh@school.com`      | `teacher123`   | Attendance, marks, timetable        |
| **Teacher** | `priya.sharma@school.com`| `teacher123`   | Attendance, marks, timetable        |
| **Teacher** | `anand@school.com`       | `teacher123`   | Attendance, marks, timetable        |
| **Student** | `student1@school.com`    | `student123`   | View own data                       |
| **Parent**  | `suresh@school.com`      | `parent123`    | View child data                     |

> 15 student accounts: `student1@school.com` through `student15@school.com` (password: `student123`)
> 3 parent accounts: `suresh@school.com`, `meena@school.com`, `ramesh@school.com`

---

## 🧩 Modules

### 1. Dashboard (`/dashboard`)
- Gradient welcome banner
- Animated stat cards (students, teachers, attendance rate, pending fees)
- Attendance bar chart with progress bars
- Fee collection donut chart (SVG)
- Upcoming events sidebar
- Recent students list
- Quick action grid (6 shortcuts)

### 2. Student Management (`/dashboard/students`)
- Stats: total, active, classes count
- Search + class filter
- Modern table with avatar, email, class badge, status pill
- Slide-out detail panel (click student row)
- Add/Edit modal with 6-field form
- Delete with confirmation

### 3. Teacher Management (`/dashboard/teachers`)
- Card-based grid layout (not table)
- Each card: avatar, name, subject, employee ID, phone, qualification, status badge
- Add Teacher modal
- Search filter
- Stats: Total, Active, On Leave

### 4. Attendance (`/dashboard/attendance`)
- Gradient stat cards (Present/Absent/Late with percentages)
- Date picker + class filter + search
- Bulk mark mode with toggle buttons (Present/Absent/Late)
- Alternating row colors
- Status pills with dot indicators

### 5. Fee Management (`/dashboard/fees`)
- Donut chart with paid/pending ratio
- Paid & Pending summary cards with icons
- Status filter dropdown
- Fee table with type/amount/due date/status columns
- Collect Fee one-click button
- Add Fee modal

### 6. Timetable (`/dashboard/timetable`)
- Class selector dropdown
- Weekly grid: Mon-Fri columns × time slots rows
- Color-coded by subject
- Shows subject, teacher name, room

### 7. Library (`/dashboard/library`)
- Tabs: Books / Issued Books
- Book grid cards with category badge, availability count
- Issue table with student, book, dates, status, return button
- Add Book modal
- Stats: Total, Issued, Available, Overdue

### 8. Reports (`/dashboard/reports`)
- Gradient text stats (attendance %, fee collection, pending)
- Bar chart with rounded gradient bars
- Circular attendance rate progress (SVG donut)
- Fee breakdown by type with progress bars
- Overdue fees list with avatar cards
- Export Report button

### 9. Notifications (`/dashboard/notifications`)
- Tabs: Notifications / Announcements
- Type badges (info/warning/success/urgent)
- Mark as read toggle
- Unread highlight
- Create announcement modal (admin)
- Priority & target role badges

### 10. Events (`/dashboard/events`)
- Calendar month view grid
- Event type badges (event/holiday/exam/meeting)
- Add Event modal
- Color-coded event indicators

### 11. Settings (`/dashboard/settings`)
- Tabs: General / Roles & Permissions / School Info
- Theme picker (5 circles with labels)
- Language selector
- RBAC permission matrix table
- School info form

### 12. Leave Management (API: `/api/leaves`)
- Teacher leave requests
- Approval/rejection workflow
- Leave types: sick, casual, earned

---

## 📡 API Endpoints (18 Routes)

### Authentication
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| POST   | `/api/auth/[...nextauth]`   | NextAuth handler   |

### Students
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/students`       | List students (search, classId) |
| POST   | `/api/students`       | Create student (admin)   |
| GET    | `/api/students/:id`   | Get student details      |
| PUT    | `/api/students/:id`   | Update student (admin)   |
| DELETE | `/api/students/:id`   | Delete student (admin)   |

### Teachers
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/api/teachers`    | List all teachers        |
| POST   | `/api/teachers`    | Create teacher (admin)   |

### Attendance
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | `/api/attendance`   | Get records (date, classId) |
| POST   | `/api/attendance`   | Bulk mark attendance     |

### Fees
| Method | Endpoint      | Description          |
|--------|---------------|----------------------|
| GET    | `/api/fees`   | List fees (status, studentId) |
| POST   | `/api/fees`   | Create fee (admin)   |
| PUT    | `/api/fees`   | Update status (admin)|

### Timetable
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/timetable`  | Get schedule (classId, day) |
| POST   | `/api/timetable`  | Create entry (admin)     |

### Library
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | `/api/library`       | List books           |
| POST   | `/api/library`       | Add book (admin)     |
| GET    | `/api/library/issue` | List issued books    |
| POST   | `/api/library/issue` | Issue book           |
| PUT    | `/api/library/issue` | Return book          |

### Other
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | `/api/dashboard`       | Dashboard analytics   |
| GET    | `/api/classes`         | List classes          |
| GET    | `/api/subjects`        | List subjects         |
| GET    | `/api/events`          | List events           |
| POST   | `/api/events`          | Create event          |
| GET    | `/api/notifications`   | User notifications    |
| PUT    | `/api/notifications`   | Mark as read          |
| GET    | `/api/announcements`   | List announcements    |
| POST   | `/api/announcements`   | Create announcement   |
| GET    | `/api/leaves`          | List leave requests   |
| POST   | `/api/leaves`          | Create leave request  |
| PUT    | `/api/leaves`          | Approve/reject leave  |

---

## 🎨 Themes & Languages

### 5 Color Themes
| Theme    | Primary  | Accent   | Sidebar  |
|----------|----------|----------|----------|
| 🔵 Blue   | `#4f46e5` | `#06b6d4` | `#0f172a` |
| 🟢 Green  | `#059669` | `#14b8a6` | `#064e3b` |
| 🟣 Purple | `#7c3aed` | `#d946ef` | `#2e1065` |
| 🟠 Orange | `#ea580c` | `#f59e0b` | `#431407` |
| 🌑 Dark   | `#6366f1` | `#22d3ee` | `#020617` |

### 5 Languages
| Language | Code | RTL |
|----------|------|-----|
| English  | `en` | No  |
| Hindi    | `hi` | No  |
| Spanish  | `es` | No  |
| French   | `fr` | No  |
| Arabic   | `ar` | Yes |

---

## 🗄 Database Schema (20+ Models)

```
RBAC:
  Permission (module, action, role)

Users & Roles:
  User → Student, Teacher, Parent

Academics:
  Class, Subject, Timetable, Assignment, Submission

Attendance:
  Attendance (studentId, date, status, markedBy)

Finance:
  Fee (amount, type, status, fine, receiptNo, paymentMode)

Examination:
  Exam, Result (marks, grade, rank)

Library:
  Book, BookIssue

Transport:
  Route, TransportAllocation

Communication:
  Notification, Announcement, Message

Events & Leave:
  Event, Leave
```

Browse database: `npm run db:studio`

---

## 👥 User Roles & RBAC

| Module     | Admin | Principal | Teacher    | Student | Parent |
|------------|-------|-----------|------------|---------|--------|
| Students   | CRUD  | Read      | Read       | Own     | Child  |
| Teachers   | CRUD  | Read      | Own        | -       | -      |
| Attendance | CRUD  | Read      | Create/Read| Own     | Child  |
| Fees       | CRUD  | Read      | -          | Own     | Child  |
| Exams      | CRUD  | Approve   | Create     | Own     | Child  |
| Timetable  | CRUD  | Read      | Read       | Read    | -      |
| Library    | CRUD  | Read      | Read       | Read    | -      |
| Reports    | Full  | Full      | Class      | Own     | Child  |
| Settings   | Full  | -         | -          | -       | -      |

---

## 📁 Project Structure

```
sms-app/
├── prisma/
│   └── schema.prisma          # 20+ models
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (animated hero, features, stats)
│   │   ├── login/page.tsx     # Split-screen login with quick demo buttons
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Analytics dashboard
│   │   │   ├── students/      # Student CRUD + detail panel
│   │   │   ├── teachers/      # Teacher card grid
│   │   │   ├── attendance/    # Bulk marking
│   │   │   ├── fees/          # Payment tracking + donut chart
│   │   │   ├── timetable/     # Weekly grid view
│   │   │   ├── library/       # Books + issues tabs
│   │   │   ├── reports/       # Charts + analytics
│   │   │   ├── notifications/ # Alerts + announcements tabs
│   │   │   ├── events/        # Calendar + events
│   │   │   └── settings/      # Theme, language, RBAC matrix
│   │   ├── components/
│   │   │   ├── Icons.tsx      # 17 SVG icon components
│   │   │   ├── Sidebar.tsx    # Collapsible sidebar with icons
│   │   │   ├── Header.tsx     # Search, notifications, theme, language, user dropdown
│   │   │   └── Providers.tsx  # Theme + Language + Session + Sidebar state
│   │   └── api/ (18 route files)
│   └── lib/
│       ├── prisma.ts          # Prisma singleton
│       ├── auth.ts            # NextAuth config
│       ├── i18n.ts            # 5 language translations
│       └── seed.ts            # Comprehensive seed (560+ lines)
```

---

## 📸 Pages & URLs

| Page                | URL                              |
|---------------------|----------------------------------|
| Landing Page        | http://localhost:3000             |
| Login               | http://localhost:3000/login       |
| Dashboard           | http://localhost:3000/dashboard   |
| Students            | http://localhost:3000/dashboard/students   |
| Teachers            | http://localhost:3000/dashboard/teachers   |
| Attendance          | http://localhost:3000/dashboard/attendance |
| Fees                | http://localhost:3000/dashboard/fees       |
| Timetable           | http://localhost:3000/dashboard/timetable  |
| Library             | http://localhost:3000/dashboard/library    |
| Reports             | http://localhost:3000/dashboard/reports    |
| Notifications       | http://localhost:3000/dashboard/notifications |
| Events              | http://localhost:3000/dashboard/events     |
| Settings            | http://localhost:3000/dashboard/settings   |

---

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] AI-based student performance prediction
- [ ] Face recognition attendance
- [ ] Payment gateway (Razorpay integration)
- [ ] Parent WhatsApp notifications
- [ ] Smart attendance via QR code
- [ ] Multi-school SaaS (multi-tenant)
- [ ] Offline sync for village schools
- [ ] PDF report card generation
- [ ] Chatbot for parents
- [ ] Advanced timetable auto-generator
- [ ] GPS transport tracking
- [ ] Staff payroll system
- [ ] GDPR compliance & audit logs
- [ ] Export reports to PDF/Excel

---

## 📄 License

MIT

---

**Built with Next.js 16 + TypeScript + Tailwind CSS 4 + Prisma 6 + NextAuth.js v5**
