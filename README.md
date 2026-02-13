# 🏥 CareOps — AI-Powered Care Operations Platform

CareOps is a full-stack operations management platform built for healthcare and care-based businesses. It streamlines bookings, contacts, conversations, forms, inventory, and staff management — all powered by **Gemini AI** for intelligent automation.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **📅 Booking Management** | Create, track, and manage appointments with conflict detection |
| **👥 Contact CRM** | Searchable contact database with tags, notes, and history |
| **💬 Inbox & Conversations** | Real-time messaging with AI-powered smart reply suggestions |
| **📝 Custom Forms** | Drag-and-drop intake form builder with public submission links |
| **📦 Inventory Tracking** | Stock management with low-threshold alerts |
| **👨‍⚕️ Staff Management** | Invite team members with granular permissions |
| **🤖 AI Business Insights** | Gemini-powered analytics, predictions, and recommendations |
| **📊 Dashboard** | Real-time stats, alerts, and today's schedule at a glance |
| **🌐 Public Booking Page** | Customer-facing booking portal with available slots |
| **⚡ Automation Engine** | Auto-welcome messages, booking confirmations, low-stock alerts |

---

## 🧠 AI Features (Gemini 2.0 Flash)

- **Smart Replies** — Context-aware reply suggestions in the inbox
- **Business Insights** — AI-generated actionable insights from your metrics
- **Contact Summaries** — Auto-generated customer profiles from CRM data
- **Booking Predictions** — Peak hours, busiest days, and trend analysis

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL + Prisma ORM |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT + bcrypt |
| **Email** | Nodemailer (SMTP) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** installed and running
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd careOps

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/careops
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Set Up Database

```bash
cd server
npx prisma db push
npx prisma generate
```

### 4. Run the App

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
careOps/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Dashboard, Bookings, Inbox, Contacts, etc.
│       ├── contexts/        # Auth context
│       ├── components/      # Shared UI components
│       └── utils/           # API client, helpers
├── server/                  # Express backend
│   ├── routes/              # 14 API route modules
│   ├── middleware/          # Auth + permission middleware
│   ├── services/            # AI engine + automation engine
│   ├── prisma/              # Database schema
│   └── config/              # Prisma client singleton
└── README.md
```

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| CRUD | `/api/bookings` | Booking management |
| CRUD | `/api/contacts` | Contact CRM |
| CRUD | `/api/services` | Service catalog |
| CRUD | `/api/inventory` | Inventory items |
| GET/POST | `/api/conversations` | Inbox messaging |
| CRUD | `/api/forms/templates` | Form builder |
| POST | `/api/ai/smart-reply` | AI reply suggestions |
| GET | `/api/ai/insights` | AI business insights |
| GET | `/api/ai/contact-summary/:id` | AI contact summary |
| GET | `/api/ai/booking-predictions` | AI booking predictions |

---

## 📝 License

MIT

---

Built with ❤️ using React, Express, PostgreSQL, Prisma & Google Gemini AI
