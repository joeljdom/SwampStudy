HOW TO RUN

Install Node.js (LTS) from https://nodejs.org/

Project layout

This repo is organized as a small monorepo with two main folders:

- `server/` - Express backend (API routes, now backed by MongoDB)
- `client/` - Vite + React frontend

Overview

We recently migrated the server data from local JSON fixtures into MongoDB. The migration scripts, models, and updated server code are on the `mongodb-migration` branch. The `server/.env.example` file shows the required env variables (notably `MONGODB_URI`).

Prerequisites

- Node.js LTS (18+ recommended)
- Git
- Access to a MongoDB instance (Atlas or local). If using Atlas, ensure your partner's IP is allowed in Network Access and share the connection string securely.

Quick start (developer, PowerShell)

1) Clone and checkout the migration branch

```powershell
git clone https://github.com/joeljdom/SwampStudy.git
cd SwampStudy
git fetch origin
git checkout mongodb-migration
git pull
```

2) Create a local `server/.env` from the example and set your MongoDB connection

```powershell
Copy-Item .\server\.env.example .\server\.env
notepad .\server\.env
# Edit MONGODB_URI and PORT inside the file
```

Examples for `MONGODB_URI`:
- Local MongoDB: `mongodb://localhost:27017/swampstudy`
- Atlas (SRV): `mongodb+srv://<user>:<pass>@cluster0.xzy.mongodb.net/swampstudy?retryWrites=true&w=majority`

3) Install server deps and run migration

```powershell
cd .\server
npm install
# This reads the JSON fixtures and writes them into MongoDB
node migrate.js
```

You should see logs like "Connected to MongoDB" and "Migrated X users". If you get a connection/authorization error, re-check `server/.env` and Atlas network access.

4) Start the backend

```powershell
# from repo root or server/
cd .\server
npm start
```

Server logs should show "Connected to MongoDB" and the listening port (default 3000).

5) Start the frontend (Vite)

```powershell
cd ..\client
npm install
npm run dev
```

Open the Vite URL printed in the client terminal (usually http://localhost:5173). The Vite dev server proxies `/api` requests to the backend on port 3000.

Direct API check (optional)

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/availability/l -Method Get
```

Production build (optional)

To build the client and serve the static files from the server (one process):

```powershell
cd client
npm run build
# copy the generated `dist` into server/public or configure the server to serve client/dist
```

Security and notes

- Do NOT commit `server/.env`. It is ignored via `.gitignore`. Use `server/.env.example` as the template to create local env files.
- The `server/` JSON fixture files are kept for reference but the app now reads from MongoDB. You can remove them once you're satisfied with the migration.
- If you need to give your partner access to the same Atlas DB, share the URI securely and add their IP to Atlas Network Access.

Need help?

- I can add a top-level `dev` script that starts server+client together (using `concurrently`) and push it to the branch.
- I can also add a short `README` section under `server/` with only the server-specific steps.

Team

Joel Domenech

Ethan Hatcher

Tyler Hering
