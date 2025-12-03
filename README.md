
# Minimal Setup Instructions

## Prerequisites
- Node.js LTS (18+)
- Git
- MongoDB (Atlas or local)

## 1. Clone the repo
```powershell
git clone https://github.com/joeljdom/SwampStudy.git
cd SwampStudy
```

## 2. Setup backend
```powershell
Copy-Item .\server\.env.example .\server\.env
# Edit .env with your MongoDB URI
cd server
npm install
node migrate.js   # (optional, only for first-time MongoDB setup)
npm start
```

## 3. Setup frontend
```powershell
cd ..\client
npm install
npm run dev
```

## 4. Access the app
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Notes
- Do not commit `.env` files.
- Use `.env.example` as a template.
- Vite dev server proxies `/api` to backend.
