HOW TO RUN

Install Node.js (LTS) from https://nodejs.org/

Project layout and how to run

This repo is organized as a small monorepo with two main folders:

- `server/` - Express backend (API routes, local JSON data)
- `client/` - Vite + React frontend

Quick start

1. Install Node.js (LTS) from https://nodejs.org/
2. From the repository root, install dev tooling (concurrently):

```powershell
npm install
```

3a. Start both server and client concurrently (recommended):

```powershell
npm run dev
```

3b. Or run them separately:

```powershell
# start backend
npm --prefix server install
npm --prefix server start

# in a second terminal, start frontend
npm --prefix client install
npm --prefix client run dev
```

Open the Vite dev URL printed in the client terminal (usually `http://localhost:5173`). The frontend proxies API requests to the backend (port 3000).

Notes

- Backend data files (`users.json`, `availability.json`) live in `server/`.
- Frontend static assets are served from the repository `public/` folder (so both client and server can access the same images).
- If you change dependencies, run `npm --prefix <folder> install` in the specific folder.

Team

Joel Domenech

Ethan Hatcher

Tyler Hering
