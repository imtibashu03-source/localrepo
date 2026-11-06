# 🛡️ BhoomiRaksha — Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records

> **Final Year Engineering Project** | Computer Engineering | Government Digital India Initiative

A full-stack web application that combines **blockchain-secured land record management** with **AI-powered cyber threat prediction** to create a tamper-proof, intelligent governance platform.

---

## 🏗️ Architecture

```
Frontend (React + Vite)  ←→  Backend (Node.js + Express)  ←→  MongoDB
                                         ↓
                          Python Flask ML Service (Port 5001)
                          [Random Forest + Decision Tree]
```

---

## 📁 Project Structure

```
major-project/
├── frontend/          # React + Vite + Tailwind CSS v4 + Framer Motion
├── backend/           # Node.js + Express + MongoDB + JWT
└── ml-service/        # Python Flask + scikit-learn ML API
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (running locally)

### 1. Backend Setup

```bash
cd backend
npm install
# Copy .env.example to .env and configure
cp .env.example .env
npm run dev
# Server starts at http://localhost:5000
# Admin auto-seeded: admin@landrecords.gov.in / Admin@123
```

### 2. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python app.py
# Flask starts at http://localhost:5001
# Models auto-trained on first run
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Vite dev server at http://localhost:5173
```

---

## 🔐 Default Credentials

| Role  | Email                         | Password   |
|-------|-------------------------------|------------|
| Admin | admin@landrecords.gov.in      | Admin@123  |
| User  | Register at /register         | Your choice|

---

## 📋 Features

### 🔗 Blockchain Module
- SHA-256 hash chaining with Proof-of-Work
- Genesis block + subsequent blocks for each land record
- Chain integrity validation
- Public Blockchain Explorer with authenticity verifier

### 🤖 AI Threat Intelligence
- **Random Forest** (70% weight) + **Decision Tree** (30% weight) ensemble
- 8 behavioral features analyzed:
  - Failed login attempts
  - Access frequency
  - IP mismatches
  - Modification attempts
  - Off-hours access
  - Geographic anomalies
  - Unusual patterns
  - Session duration
- 4 threat levels: Safe / Low / Medium / High
- Auto-alerts when threat score > 70

### 📜 Land Record Management
- Full CRUD with ownership history tracking
- Blockchain hash auto-generated on create/update
- Search by owner, survey number, location, district
- Paginated results

### 👤 Authentication & Security
- JWT tokens (7-day expiry)
- bcrypt password hashing (12 rounds)
- Account lockout after 5 failed logins
- Role-based access control (User / Admin)
- Rate limiting (5 auth req/15min, 100 general/15min)
- Helmet security headers

### 📊 Admin Dashboard
- System-wide analytics & charts
- User management (activate/deactivate/delete)
- System audit logs
- Threat distribution heatmap

---

## 🎨 Tech Stack

| Layer      | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v4, Framer Motion, Recharts |
| Backend   | Node.js, Express.js, Mongoose                 |
| Database  | MongoDB                                       |
| Auth      | JWT, bcryptjs                                 |
| Security  | Helmet, express-rate-limit, cors              |
| ML        | Python Flask, scikit-learn, Random Forest, Decision Tree |

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me` 🔒

### Records
- `GET    /api/records` 🔒
- `POST   /api/records` 🔒
- `GET    /api/records/:id` 🔒
- `PUT    /api/records/:id` 🔒
- `DELETE /api/records/:id` 🔒

### Blockchain
- `GET /api/blockchain/chain` 🔒
- `GET /api/blockchain/verify/:hash` 🔒
- `GET /api/blockchain/block/:id` 🔒
- `GET /api/blockchain/stats` 🔒

### Threats
- `POST /api/threats/predict` 🔒
- `GET  /api/threats/logs` 🔒
- `GET  /api/threats/alerts` 🔒
- `PUT  /api/threats/alerts/:id/resolve` 🔒
- `GET  /api/threats/stats` 🔒

### Admin (Admin only)
- `GET    /api/admin/stats` 🔒👑
- `GET    /api/admin/users` 🔒👑
- `PUT    /api/admin/users/:id` 🔒👑
- `DELETE /api/admin/users/:id` 🔒👑
- `GET    /api/admin/logs` 🔒👑

---

## 👥 Team

| Name          | Role                    |
|---------------|-------------------------|
| Ananya Singh  | Project Lead, Full Stack|
| Rahul Sharma  | Blockchain Developer    |
| Priya Patel   | ML Engineer             |
| Amit Kumar    | Backend & Security      |

---

## 📄 License

This project is developed for academic purposes as part of a Final Year Engineering Project.

---

*Ministry of Electronics & Information Technology | Government of India Digital Initiative*
