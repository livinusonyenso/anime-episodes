# Anime Episodes Backend (Express + MongoDB)

A production-style backend that:
- Scrapes episode metadata (canon/filler/mixed) from existing sources
- Caches results in MongoDB with lazy updates
- Prefetches episode data when a title is searched (~0 latency later)
- Tracks watched/unwatched per user
- Provides auth (register/login) + password reset via email
- Uses CORS, Helmet, and global rate-limiting

> This API serves **metadata only**. No streaming involved.

---

## Tech
- Node.js, Express
- MongoDB + Mongoose
- Scraping: `axios` + `cheerio`
- Auth: JWT
- Email (reset): Nodemailer (SMTP)
- Security: `helmet`, `cors`, `express-rate-limit`
- Logging: `morgan`

## Structure
```
anime-episodes-backend/
├─ config/
│  ├─ db.js
│  └─ rateLimit.js
├─ controllers/
│  ├─ animeController.js
│  ├─ authController.js
│  └─ episodeController.js
├─ middleware/
│  ├─ auth.js
│  └─ error.js
├─ models/
│  ├─ Anime.js
│  ├─ Episode.js
│  └─ User.js
├─ services/
│  ├─ email.js
│  └─ scraper/
│     └─ animeScraper.js
├─ routes/
│  ├─ animeRoutes.js
│  ├─ authRoutes.js
│  └─ episodeRoutes.js
├─ .env.example
├─ server.js
├─ index.js
├─ package.json
└─ README.md
```

## 1) Setup
```bash
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLIENT_URL, and SMTP_* values
```

## 2) Run
Development:
```bash
npm run dev
```
Production:
```bash
npm start
```

Health check:
```
GET http://localhost:3001/health
```

## 3) API

### Auth (email + password)
**Register**
```
POST /api/auth/register
Content-Type: application/json
{
  "email": "livinusonyenso@gmail.com",
  "password": "secret123",
  "name": "Livinus"
}
```
**Login**
```
POST /api/auth/login
{
  "email": "you@example.com",
  "password": "secret123"
}
```
Returns `{ token, user }`.

**Request Password Reset**
```
POST /api/auth/request-reset
{ "email": "you@example.com" }
```
An email is sent with a `token` link to your frontend: `CLIENT_URL/reset-password?token=...&email=...`

**Reset Password**
```
POST /api/auth/reset-password
{
  "email":"you@example.com",
  "token":"<token-from-email>",
  "newPassword":"newSecret123"
}
```

### Anime & Episodes
**Search or Create + Prefetch**
```
GET /api/anime?q=naruto
```
- Discovers/creates the anime doc if missing
- Prefetches (scrapes) episodes immediately
- Returns `{ id, title, slug, episodeCount }`

**Get Episodes (cached, lazy update)**
```
GET /api/anime/:id/episodes
```
Returns an array of episodes:
```
[
  { "_id":"...", "number":1, "title":"...", "type":"canon|filler|mixed|unknown" },
  ...
]
```

### Watch Status (per user, auth required)
**Set watched/unwatched**
```
POST /api/episodes/watch
Authorization: Bearer <JWT>
Content-Type: application/json
{
  "episodeId": "<Episode _id>",
  "watched": true
}
```
Response includes your `watchedEpisodes` list.

## 4) Scraping Notes
- `services/scraper/animeScraper.js` contains a **skeleton** scraper with placeholder selectors.
- Update the selectors to match your chosen source site(s) and **ensure scraping is permitted** under their ToS.
- The cache uses `sourceHash` per episode batch to detect changes and lazily update.

## 5) Security & Policies
- **Rate limiting** is applied to all `/api` routes. Tune `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` in `.env`.
- **CORS** origin is controlled by `CLIENT_URL` env.
- **Auth** is only required for saving watch status.

## 6) Deployment (Client-Owned Infra)
- Host on **Render** or similar under the **client’s account**.
- Database: **MongoDB Atlas** under the client’s account.
- SMTP: Use the client’s email service (Namecheap PrivateEmail, etc.).
- Environment variables live in the client’s dashboard (Render -> Environment).

## 7) Testing with cURL

Register:
```bash
curl -X POST http://localhost:3001/api/auth/register  -H "Content-Type: application/json"  -d '{"email":"me@test.com","password":"secret123","name":"Me"}'
```

Search/prefetch anime:
```bash
curl "http://localhost:3001/api/anime?q=naruto"
```

Get episodes:
```bash
curl http://localhost:3001/api/anime/<animeId>/episodes
```

Set watched (requires token from login):
```bash
curl -X POST http://localhost:3001/api/episodes/watch  -H "Content-Type: application/json"  -H "Authorization: Bearer <TOKEN>"  -d '{"episodeId":"<EP_ID>","watched":true}'
```

## 8) Extend
- Add a cron to re-scrape daily/weekly.
- Add more sources and merge results.
- Add `PUT /api/users/profile`.
- Add admin endpoints for manual refresh.

---

**Note:** This repo contains scraping utilities. Be sure you have the right to scrape, respect robots.txt, and cache responsibly.
