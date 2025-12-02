HOW TO RUN

Install Node.js (LTS) from https://nodejs.org/

Project layout and how to run

This repo is organized as a small monorepo with two main folders:

- `server/` - Express backend (API routes, local JSON data)
- `client/` - Vite + React frontend

Quick start

1. Install Node.js (LTS) from https://nodejs.org/
2. From the repository root, run the setup script (installs all dependencies and fixes permissions):

```bash
npm run setup
```

   Or on Windows (PowerShell/CMD):
```powershell
npm run setup
```

   Or manually:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

3. Start both server and client concurrently (recommended):

```bash
npm run dev
```

Or run them separately:

```bash
# start backend
npm --prefix server start

# in a second terminal, start frontend
npm --prefix client run dev
```

Open the Vite dev URL printed in the client terminal (usually `http://localhost:5173`). The frontend proxies API requests to the backend (port 3000).

Notes

- **Cross-platform**: This project works on Windows, macOS, and Linux. The setup script automatically handles platform-specific requirements.
- Backend data files (`users.json`, `availability.json`) live in `server/`.
- Frontend static assets are served from the repository `public/` folder (so both client and server can access the same images).
- If you change dependencies, run `npm --prefix <folder> install` in the specific folder.
- The `postinstall` hook automatically sets up subdirectories when you run `npm install` at the root.

Team

Joel Domenech

Ethan Hatcher

Tyler Hering
