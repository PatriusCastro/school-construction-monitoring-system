# School Construction Monitoring System (SCMS)
 
A full-stack web application for monitoring and managing school construction projects across districts. Built for DepEd to track progress, manage budgets, coordinate projects, and generate reports — all in one place.
 
---
 
## Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Express.js, Node.js, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel (frontend + backend) |
 
---
 
## Features
 
- 🔐 **Authentication** — Login and registration with Supabase Auth; middleware-protected routes
- 🏫 **School Management** — Add, update, and delete school construction projects
- 📍 **Site Maps** — Upload and manage site map files per school
- 📊 **Progress Tracking** — Monitor construction progress per school
- 📋 **Reports** — Generate and export construction reports as PDF
- 📈 **Dashboard** — Overview of stats across all projects
- 👤 **Role-based Access** — Admin and regular user roles with separate route protection
---
 
## Project Structure
 
```
school-construction-monitoring-system/
└── scms/
    ├── frontend/          # Next.js app
    │   ├── src/
    │   │   ├── app/       # App router pages
    │   │   ├── components/
    │   │   ├── lib/       # Supabase client, API helpers
    │   │   └── middleware.ts
    │   └── public/
    │       └── assets/
    └── backend/           # Express.js API
        └── src/
            ├── controllers/
            ├── routes/
            ├── middleware/
            └── index.ts
```
 
---
