# InterviewHub — Technical Interview & Hiring Portal

Full-stack MERN web application for managing technical job openings, candidate applications, interview scheduling, live evaluation scorecards, and job offers.

**Developer:** Bablu Kumar

---

## Project Structure

```text
InterviewHub/
├── .env                        Root environment configuration (Server + Client)
├── package.json                Root workspace scripts
├── client/                     React 19 + Vite + Tailwind CSS v4 frontend
│   ├── public/                 Static assets & sample documents
│   └── src/
│       ├── api/                Axios client & domain API modules
│       ├── components/         Reusable UI components grouped by domain
│       │   ├── applications/
│       │   ├── auth/
│       │   ├── candidate/
│       │   ├── dashboard/
│       │   ├── evaluation/
│       │   ├── forms/
│       │   ├── interviews/
│       │   ├── jobs/
│       │   ├── layout/
│       │   ├── questions/
│       │   └── recruiter/
│       ├── context/            Authentication context provider
│       ├── pages/              Route views organized by role
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── candidate/
│       │   ├── interviewer/
│       │   ├── jobs/
│       │   ├── public/
│       │   └── recruiter/
│       ├── routes/             Protected & role-based route guards
│       ├── utils/              Frontend helper utilities
│       └── validators/         Zod form validation schemas
└── server/                     Node.js + Express 5 + MongoDB backend
    ├── config/                 Database, environment & Passport OAuth setup
    ├── constants/              Role, status, evaluation & career field constants
    ├── controllers/            Express route controllers
    ├── middleware/             Auth, role, upload, validation & error middleware
    ├── models/                 Mongoose schemas & models
    ├── routes/                 REST API v1 route definitions
    ├── services/               Core business logic services
    ├── uploads/                Uploaded resumes & offer letters
    ├── utils/                  Token, response & database verification helpers
    └── validators/             Backend request payload validators
```

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4, React Router v7, Recharts, React Hook Form, Zod, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT (HTTP-Only Cookies & Bearer Tokens), Passport OAuth 2.0, Multer, Zod
- **Authentication:** Role-Based Access Control (`ADMIN`, `RECRUITER`, `INTERVIEWER`, `CANDIDATE`) + Google & GitHub OAuth support

---

## Local Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Variables (`.env`)

Configure the root `.env` file:

```env
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/interviewhub
JWT_SECRET=interviewhub_super_secret_jwt_key_2026_safe_dev_secret
JWT_EXPIRES_IN=7d

VITE_API_URL=http://localhost:5000/api/v1
VITE_MIN_PROFILE_COMPLETION=60
```

### 3. Seed Sample Data

```bash
npm run seed
```

### 4. Run the Application

Start backend (`http://localhost:5000`):

```bash
npm run dev:server
```

Start frontend (`http://localhost:5173`):

```bash
npm run dev:client
```

---

## Demo Credentials (Password: `password123`)

| Role | Name | Email |
| :--- | :--- | :--- |
| **Admin** | Bablu Kumar | `admin@interviewhub.com` |
| **Recruiter** | Neha Kulkarni | `recruiter@interviewhub.com` |
| **Interviewer** | Rohan Mehta | `interviewer@interviewhub.com` |
| **Candidate** | Aman Verma | `candidate@interviewhub.com` |
