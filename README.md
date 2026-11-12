# CM Kerala Grievance Portal (Prototype)

> ⚠️ **DISCLAIMER: Recruitment Prototype. Not an official Government of Kerala / Chief Minister's Office website. All data is fictional.**

A complete, production-style prototype of the Chief Minister's Public Grievance Redressal Portal built for the WhiteMatrix Software Solutions recruitment machine test.

---

## 🌐 Live URLs (Deployment Placeholders)
- **Frontend:** `https://cmk-grievance.vercel.app` *(deploy to Vercel)*
- **Backend API:** `https://cmk-grievance-api.render.com` *(deploy to Render)*
- **API Docs:** `https://cmk-grievance-api.render.com/api/docs`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| CMO Admin | `cmo.demo@example.com` | `Demo@12345` |
| Dept. Officer (PWD) | `officer.pwd@example.com` | `Demo@12345` |
| Dept. Officer (Health) | `officer.health@example.com` | `Demo@12345` |
| Citizen | `citizen.demo@example.com` | `Demo@12345` |

> All demo accounts use `Demo@12345` as password. See `/DOCUMENTATION/06_Setup_and_Testing.md` for full credentials list.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6, Tailwind CSS |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js 22 + Express.js |
| Database | MongoDB 8 + Mongoose |
| Auth | JWT (httpOnly cookie + bearer), bcryptjs |
| AI | Google Gemini 1.5 Flash (Anthropic Claude fallback) |
| File Upload | multer (local `/uploads`) |
| Security | helmet, CORS allowlist, express-rate-limit, zod, express-validator |
| Testing | Jest + Supertest (API); Vitest + Testing Library (frontend) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd unemployedkochi

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and AI API key

# Frontend
cd ../client
npm install
cp .env.example .env.local
```

### 2. Configure Environment

**server/.env** (minimum required):
```
MONGODB_URI=mongodb://localhost:27017/cmk_grievance
JWT_SECRET=your-random-secret-here
CLIENT_URL=http://localhost:5173
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
```

**client/.env.local** (minimum required):
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Open: http://localhost:5173

---

## 📋 Features Implemented

### Public Website
- [x] Home page with live stats, featured departments, quick track
- [x] About Us, How It Works, Departments, FAQ pages
- [x] Track Grievance by Reference ID (public, no login)
- [x] Contact form with validation

### Citizen Portal
- [x] Registration with mobile (+91) validation, password strength
- [x] Login/Logout with JWT
- [x] Submit Grievance with file upload (jpg/png/pdf ≤5MB)
- [x] AI Grievance Assistant (Gemini API, with rule-based fallback)
- [x] Reference ID format: CMK-YYYY-XXXXXX
- [x] Track and view own grievances
- [x] Notifications
- [x] Post-resolution feedback (1-5 star rating)
- [x] Reopen resolved grievance

### CMO Admin Dashboard
- [x] Full grievances table with 8+ filters, sorting, pagination
- [x] Status transitions (state machine enforced server-side)
- [x] Assign to department + specific officer
- [x] Internal remarks (admin-only), public remarks
- [x] Escalate overdue grievances
- [x] Review action-taken reports (Accept = Resolve, Return = In Progress)
- [x] Statistics: 6 charts (district, department, status, trend, resolution time, priority)

### Department Officer Dashboard
- [x] View only department-assigned grievances
- [x] Update progress (In Progress + remarks)
- [x] Submit action-taken report with optional attachment
- [x] Stats overview

### AI Integration
- [x] Real LLM call (Gemini 1.5 Flash) with JSON schema validation (zod)
- [x] Retry once on failure, then rule-based fallback
- [x] PII masking before sending to AI
- [x] Prompt-injection hardening (delimiters)
- [x] Duplicate detection (cosine similarity TF-IDF)
- [x] Advisory only - never auto-changes status

### Security
- [x] Helmet, CORS allowlist, rate limiting (auth: 20/15min, AI: 30/15min, general: 200/15min)
- [x] JWT httpOnly cookies + bearer
- [x] bcrypt password hashing (12 rounds)
- [x] Input validation (zod + express-validator)
- [x] Role-based access control (CITIZEN, CMO_ADMIN, DEPT_OFFICER)
- [x] Parameterised queries (Mongoose ORM)
- [x] File path traversal protection
- [x] MIME type + size validation for uploads

---

## 🧪 Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

---

## 📁 Repository Structure

```
unemployedkochi/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI + layout components
│   │   ├── context/        # React context (Auth)
│   │   ├── lib/            # API client, utilities
│   │   ├── pages/          # Route pages (public, auth, citizen, cmo, officer)
│   │   └── test/           # Test setup
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── middleware/      # auth, upload, validate
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── seed/           # Database seed script
│   │   ├── services/       # AI service
│   │   └── utils/          # Helpers, notifications
│   ├── uploads/            # Local file storage (gitignored)
│   └── package.json
└── DOCUMENTATION/
    ├── 01_Project_Overview.md
    ├── 02_System_Architecture.md
    ├── 03_Database_Design.md
    ├── 04_API_Documentation.md
    ├── 05_AI_Integration.md
    ├── 06_Setup_and_Testing.md
    └── 07_User_Guide.md
```

---

## 🤖 AI Tools Disclosure

This project was built with assistance from AI coding tools:
- **Antigravity (Google DeepMind)** - Used for code generation and scaffolding
- **Google Gemini 1.5 Flash API** - Used as the AI grievance analysis service

All generated code was reviewed and adapted. The AI integration features (endpoint, service, fallback) are purpose-built and not AI-generated boilerplate.

---

## ⚖️ License & Disclaimer

**Recruitment Prototype only.** Not affiliated with or endorsed by the Government of Kerala, Chief Minister's Office, or any official body. All data, departments, officials, and grievances are entirely fictional and created for demonstration purposes.

Built by: [Candidate Name]  
For: WhiteMatrix Software Solutions Recruitment Test  
Date: November 2026
