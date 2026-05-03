# Team Task Manager (TTM)

A full-stack team productivity application built with Node.js, React, and PostgreSQL. It supports role-based access control, project management, task assignment, and a real-time dashboard. The application is deployed on Railway (backend + database) and Vercel (frontend).

Live Demo:  
https://team-task-manager-gn4r-jcf1v960q-rahulkathpal01s-projects.vercel.app/dashboard

---

## Overview

Team Task Manager is a collaborative task tracking tool designed to organize work into Projects and Tasks. It implements two distinct roles:

- ADMIN → Full control over projects and tasks  
- MEMBER → Limited access focused on assigned work  

---

## Features

### Authentication
- Secure signup and login with hashed passwords (bcrypt)
- JWT-based stateless authentication
- Session-based storage (auto logout on browser close)
- Automatic redirect flow (Register → Login → Dashboard)

### Role-Based Access Control (RBAC)

| Capability | ADMIN | MEMBER |
|-----------|:-----:|:------:|
| Create projects | Yes | No |
| Delete projects | Yes | No |
| Create tasks | Yes | No |
| Assign tasks | Yes | No |
| View projects | Yes | Limited |
| Update task status | Yes | Own tasks only |
| Delete tasks | Yes | No |
| Dashboard access | Global | Personal |

### Dashboard
- Total tasks overview
- Status breakdown (Pending, In Progress, Completed)
- Overdue task tracking
- Project count
- Recent activity feed

### Project Management
- Create, view, and delete projects
- Search and filter projects
- Task breakdown per project
- Cascade delete (removes all associated tasks)

### Task Management
- Create tasks with title, description, due date, and assignee
- Inline status updates (no page reload)
- Optimistic UI updates with rollback handling
- Overdue highlighting

---

## Tech Stack

### Backend
- Node.js, Express.js  
- PostgreSQL  
- Prisma ORM  
- bcryptjs, jsonwebtoken  
- express-validator  
- helmet, cors, morgan  

### Frontend
- React (Vite)  
- React Router  
- Axios  
- Tailwind CSS  

### Deployment
- Railway (Backend and Database)  
- Vercel (Frontend)  
- GitHub (Version Control)  

---

## Architecture

Client (React) communicates with the backend (Express), which interacts with PostgreSQL using Prisma ORM.

---

## Project Structure

```
team-task-manager/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── Controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── user.routes.js
│   │   ├── utils/
│   │   │   └── jwt.js
│   │   └── server.js
│   ├── railway.toml
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── DashboardMetrics.jsx
    │   │   ├── ProjectCard.jsx
    │   │   ├── TaskTable.jsx
    │   │   ├── CreateProjectModal.jsx
    │   │   ├── CreateTaskModal.jsx
    │   │   └── StatusBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── ProjectDetail.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vercel.json
    ├── vite.config.js
    └── package.json
```

---

## API Reference

All protected routes require:

Authorization: Bearer <token>

### Auth
- POST /api/auth/register  
- POST /api/auth/login  
- GET /api/auth/me  

### Projects
- GET /api/projects  
- POST /api/projects (ADMIN)  
- GET /api/projects/:id  
- PATCH /api/projects/:id (ADMIN)  
- DELETE /api/projects/:id (ADMIN)  

### Tasks
- GET /api/projects/:projectId/tasks  
- POST /api/projects/:projectId/tasks (ADMIN)  
- PATCH /api/projects/:projectId/tasks/:taskId  
- DELETE /api/projects/:projectId/tasks/:taskId (ADMIN)  

### Other
- GET /api/dashboard  
- GET /api/users (ADMIN)  

---

## Local Development Setup

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## Security

- Password hashing using bcrypt  
- JWT-based authentication  
- Role-based authorization  
- Helmet for secure HTTP headers  
- Restricted CORS policy  
- Safe error handling  

---

## Author

Rahul Kathpal

---

## License

MIT License
