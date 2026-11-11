# Life & Health Tracker — MERN Full-Stack Application

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

A comprehensive, production-quality personal life management and health tracking web application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, Recharts, and Lucide React.

Designed around the core lifestyle workflow:
**RECORD → STORE → ANALYSE → VISUALIZE → UNDERSTAND → IMPROVE**

---

## 🌟 Application Modules

1. **Module 1: Main Dashboard**
   - Instant summary of today's vital metrics: body weight, sleep duration & quality, workout status, steps, water intake, physical & mental energy, mood, and habit completion rate.
   - Fast 1-click quick-action modals for logging events without leaving the page.
   - 7-day multi-metric trend visualization.
   - Chronological real-time health activity feed.

2. **Module 2: Workout & Strength Tracker**
   - Workout categories: Upper body, Lower body, Push, Pull, Legs, Full body, Core, Cardio, Running, Sprinting, Mobility, Custom.
   - Set-level tracking: reps, weight, RPE (1-10), rest seconds, distance, and duration.
   - Dynamic training volume calculations: `Volume = Σ (Weight × Reps)`.
   - Exercise library categorized by target muscle groups with 1RM (Epley formula: `Weight × (1 + Reps/30)`).

3. **Module 3: Sleep & Circadian Tracker**
   - Records bedtime, wake-up time, and net duration (with midnight-crossover handling).
   - Sleep quality (1-10), morning freshness (1-10), time to fall asleep, awakenings, and naps.
   - Longitudinal sleep consistency trends.

4. **Module 4: Nutrition & Weight Tracker**
   - Meal categories: Breakfast, Lunch, Dinner, Morning snack, Evening snack, Custom.
   - Macro nutrient tracking (calories, protein, carbs, fat) with real-time target progress bars.
   - Body weight trend with a 7-day moving average curve filtering out daily hydration fluctuations.

5. **Module 5: Physical Activity Tracker**
   - Steps, walking distance (km), active minutes, sedentary sitting time (hrs), standing time, and hydration.
   - Active vs. inactive day distribution charts.

6. **Module 6: Personal Habit Tracker**
   - Customizable daily/weekly habits with category tags.
   - Quick one-click toggle completion.
   - 30-day consistency score and completion rate.

7. **Module 7: Mental Wellness & Private Journal**
   - Mood (1-10), stress (1-10), mental energy, focus, and fatigue.
   - Emotion tags (Happy, Calm, Motivated, Frustrated, Anxious, etc.).
   - Private daily reflections (Highlights, Challenges, Gratitude, Next-Day Improvements).

8. **Module 8: Daily Energy & Vitality Tracker**
   - Periodic check-ins: Morning, Afternoon, Evening.
   - Multi-dimensional scoring: physical energy, mental energy, freshness, focus, motivation, and muscle soreness.

9. **Module 9: Body Measurements & Physical Progress**
   - Anthropometric tracking: Weight, chest, waist, hips, shoulders, arms, thighs, calves, and body fat %.
   - Before-and-after deltas with chronological progress.

10. **Module 10: Recovery & Readiness Tracker**
    - Biological readiness score (1-100%).
    - Muscle soreness, general fatigue, sleep recovery, workout strain, and rest day management.

11. **Module 11: Digital Wellness & Screen Time**
    - Daily screen time (hours), pre-bed screen exposure (mins), phone pickups, and category breakdown.

12. **Module 12: Goals & Personal Targets**
    - Goal categories: Fitness, Weight, Strength, Sleep, Nutrition, Activity, Habits.
    - Automatic percentage progress bars and status management (active, completed, paused).

13. **Module 13: Central Analytics & Reporting Hub**
    - 7-Day Executive Weekly Health Report.
    - 30-day historical progression curves.
    - 1-click full JSON database backup export.

14. **Module 14: AI Personal Lifestyle Assistant**
    - Natural language health logging with entity extraction (sleep, workout, nutrition, activity, energy).
    - Confirmation preview modal prior to database persistence.
    - Historical question-answering querying real MongoDB records.

15. **Module 15: Settings & User Profile**
    - Measurement units (kg/lbs, km/miles, cm/inches).
    - Daily macro and hydration targets.
    - Theme customization (Dark / Light mode).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v7, Recharts, Lucide React, Axios, React Hook Form |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, bcryptjs, Helmet, Morgan, Cookie-Parser, express-validator |
| **Database** | MongoDB / MongoDB Atlas, Mongoose ODM with indexing and timestamps |
| **Testing** | Jest, Supertest |

---

## 📁 Project Structure

```text
life/
├── package.json               # Root scripts (install, build, start, seed, test)
├── .gitignore                 # Root Git ignore (protects .env and credentials)
├── README.md                  # Project documentation
│
├── client/                    # Frontend React + Vite Application
│   ├── .env.example           # Example frontend environment variables
│   ├── .gitignore             # Frontend Git ignore
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.js         # Vite configuration with /api proxy
│   ├── tailwind.config.js     # Tailwind CSS theme and color tokens
│   ├── vercel.json            # SPA routing rewrite rule for Vercel
│   ├── public/
│   │   └── _redirects         # SPA fallback rule for Netlify
│   └── src/
│       ├── App.jsx            # Route definitions & protected routes
│       ├── main.jsx           # React DOM bootstrap
│       ├── components/        # Reusable UI components & layouts
│       ├── context/           # AuthContext & ThemeContext
│       ├── pages/             # 15 feature pages
│       └── services/          # Centralized Axios API client (api.js)
│
└── server/                    # Backend Node.js + Express Application
    ├── .env.example           # Example backend environment variables
    ├── .gitignore             # Backend Git ignore
    ├── package.json           # Backend dependencies & scripts
    ├── tests/                 # Jest integration tests
    │   └── api.test.js
    └── src/
        ├── app.js             # Express app, security middleware, routes
        ├── server.js          # HTTP server bootstrap & graceful shutdown
        ├── config/
        │   ├── db.js          # MongoDB Atlas connection & error handling
        │   └── env.js         # Environment variable loader
        ├── controllers/       # Controller functions for each module
        ├── middleware/        # JWT auth, error handler, input validators
        ├── models/            # Mongoose schemas & indexes
        ├── routes/            # Express modular routers
        └── seed/
            └── seedData.js    # 30-day realistic historical seed generator
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)

Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

Configure your variables:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.d7hj0wj.mongodb.net/life_health_tracker?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_secure_random_32_character_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=
```

> **Security Note:** Never commit `server/.env` to Git. Both root and `server/.gitignore` exclude all `.env` files automatically.

### Frontend (`client/.env`)

Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```

```env
# In development or unified Express deployment: leave empty (uses Vite /api proxy or same-origin)
# In split deployment (e.g. frontend on Vercel, backend on Render):
VITE_API_URL=https://your-backend-api.onrender.com/api
```

---

## 🚀 Quick Start Guide (Local Development)

### 1. Install Dependencies
```bash
npm run install:all
```
*Or install individually:*
```bash
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Files
Set up `server/.env` with your MongoDB connection string (local MongoDB or MongoDB Atlas).

### 3. Seed Database
Populate 30 days of realistic health data across all 15 modules:
```bash
npm run seed
```

Pre-seeded accounts:
- **User 1 (Primary)**: `user1@lifetracker.com` / `password123` *(Alex Mercer — 30 days of rich health history)*
- **User 2**: `user2@lifetracker.com` / `password123` *(Sarah Connor)*
- **User 3**: `user3@lifetracker.com` / `password123` *(David Miller)*

### 4. Run Integration Tests
```bash
npm run test
```
Verifies health check, user authentication, dashboard analytics, workout volume calculations, and AI parser.

### 5. Start Development Servers
Run both frontend and backend concurrently:
- **Terminal 1 (Backend)**:
  ```bash
  npm run server
  ```
  *Runs on http://localhost:5000*
- **Terminal 2 (Frontend)**:
  ```bash
  npm run client
  ```
  *Runs on http://localhost:5173*

---

## 🚢 Deployment Guide

### Option A: Unified Full-Stack Deployment (Render / Railway / Heroku / VPS)
In this approach, the Express server builds and serves the React frontend statically.

1. **Build the Frontend**:
   ```bash
   npm run build
   ```
   *(Generates optimized assets into `client/dist/`)*
2. **Start the Production Server**:
   ```bash
   npm run start
   ```
3. Express serves the frontend for all non-API paths and handles React Router client-side routing.
4. Set the following environment variables in your cloud provider:
   - `NODE_ENV=production`
   - `PORT=5000` (or leave default assigned by provider)
   - `MONGODB_URI=your_atlas_connection_string`
   - `JWT_SECRET=your_jwt_secret`

---

### Option B: Split Deployment (Backend on Render/Railway + Frontend on Vercel/Netlify)

#### 1. Deploy the Backend (e.g., Render / Railway)
- Root directory: `server`
- Build command: `npm install`
- Start command: `node src/server.js`
- Set Environment Variables:
  - `PORT=5000`
  - `NODE_ENV=production`
  - `MONGODB_URI=your_atlas_connection_string`
  - `JWT_SECRET=your_jwt_secret`
  - `CLIENT_URL=https://your-app.vercel.app` (your frontend domain)
- Note the live backend URL: e.g., `https://life-api.onrender.com`

#### 2. Deploy the Frontend (e.g., Vercel / Netlify)
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set Environment Variable:
  - `VITE_API_URL=https://life-api.onrender.com/api`
- Direct page refresh / SPA routing is already configured via `client/vercel.json` (Vercel) and `client/public/_redirects` (Netlify).

---

## 🔍 Database Troubleshooting (MongoDB Atlas)

If the server reports connection timeout or authentication error:
1. **Network Access**: In MongoDB Atlas -> Security -> **Network Access**, ensure `0.0.0.0/0` (Allow access from anywhere) or your hosting provider's IP range is added.
2. **Database Access**: In MongoDB Atlas -> Security -> **Database Access**, verify your database user credentials and read/write privileges.
3. **Special Characters**: If your database password contains characters like `@`, `:`, `/`, or `#`, URL-encode them (`@` becomes `%40`).
4. **Database Name**: Verify that your connection string includes the database name:
   `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/life_health_tracker?retryWrites=true&w=majority`
