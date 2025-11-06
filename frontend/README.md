# Anime Episodes Frontend (Next.js + Tailwind)

Client-only (static export) app that consumes the Anime Episodes Backend.

## Quick Start
```bash
npm install
cp .env.example .env
# set NEXT_PUBLIC_API_BASE to your backend e.g. http://localhost:5000
npm run dev
```

## Build Static
```bash
npm run build
# outputs to out/
```

## Pages
- `/` Search anime and navigate to episodes
- `/login` Login
- `/register` Register
- `/anime/[id]` Episode list with watched checkbox (requires login to save)
