# Deployment & Setup Guide

Instructions for local setup, Docker Compose deployment, and environment variable configuration.

---

## 1. Quick Start with Local Node.js & MySQL

### Prerequisites
- Node.js 20+
- MySQL 8.0 running on `localhost:3306`

### Steps:
```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Configure Environment (.env)
# DATABASE_URL="mysql://root:0786@localhost:3306/standardsai"
# GEMINI_API_KEY="your-gemini-key"

# 3. Initialize Prisma & Database
npx prisma db push

# 4. Seed Database with 50+ Standards & Embeddings
npm run seed

# 5. Start Backend Server
npm run dev

# 6. In a new terminal, start Frontend UI
cd ../frontend
npm install
npm run dev
```

---

## 2. Docker Compose Deployment

```bash
docker-compose up --build -d
```

Services started:
- `mysql`: Port 3306
- `backend`: Port 5000 (Express REST API)
- `frontend`: Port 80 (Nginx React SPA)
