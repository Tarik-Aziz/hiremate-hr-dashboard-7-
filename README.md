# HireMate HR Dashboard (Fresh Setup)

A polished, full-stack HR management dashboard built with **React**, **Node.js**, and **MongoDB**.

## 🔴 IMPORTANT: Fix for "Failed to load config from vite.config.ts"
If you see an error related to `@tailwindcss/oxide` or `vite.config.ts` in VS Code, follow these steps:

1. **Delete** your `node_modules` folder and `package-lock.json` file.
2. **Open your terminal** in VS Code and run:
   ```bash
   npm install
   ```
3. This will reset your environment to the stable Tailwind v3 setup I have prepared.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher) installed.
- **MongoDB** (Local or Atlas):
  - **Atlas (Recommended):** Get your connection string from [mongodb.com](https://www.mongodb.com/).
  - **Local:** Ensure MongoDB is running on `127.0.0.1:27017`.

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/hiremate

# Gemini AI API Key (For AI Job Descriptions & Resume Parsing)
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run the App
```bash
# Start the full-stack app
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🏗️ Project Structure
- `server.ts`: Node.js Express server & MongoDB logic.
- `src/App.tsx`: Main React component (includes Mock Login for easy access).
- `src/pages/`: All HR modules (Employees, Jobs, Candidates).
- `src/components/`: Reusable UI components.
- `tailwind.config.js`: Tailwind styling configuration.

---

## ✨ Features
- **MongoDB Integration:** All data is saved to your real database.
- **Mock Auth:** Just click "Sign in as Admin" to enter.
- **Demo Data:** If your DB is empty, click "Seed Demo Data" on the dashboard to fill it instantly.
- **Download Reports:** Export your dashboard stats as `.csv` files.
