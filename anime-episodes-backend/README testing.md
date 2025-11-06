
# Anime Episodes Backend — Complete Testing Guide

A production-style **Node.js + Express + MongoDB** backend that:
- Discovers anime and **scrapes episode metadata** (canon / filler / mixed)
- **Caches** results in MongoDB with **lazy updates**
- Tracks **watched / unwatched** episodes **per user**
- Provides **Auth** (register/login) + **Password Reset via Email**
- Security hardening: **Helmet**, **CORS**, **Rate Limiting**
- Logging with **morgan**

> ⚠️ This API serves **metadata only** (no streaming).


---

## 0) Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- SMTP creds (Mailtrap / Namecheap Private Email / etc.)

---

## 1) Clone & Install
```bash
git clone <YOUR_REPO_URL>
cd anime-episodes-backend
npm install
cp .env.example .env
```

### `.env` — required vars
```ini
# General
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Mongo
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
JWT_SECRET=replace_me_with_a_long_random_string
JWT_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# SMTP (for password reset)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>
FROM_EMAIL="Anime App <no-reply@yourdomain.com>"
```

---

## 2) Run the API
Development:
```bash
npm run dev
```
Production:
```bash
npm start
```

Health check (should return `{ ok: true }`):
```
GET http://localhost:5000/health
```

Root (simple JSON “server is running”):
```
GET http://localhost:5000/
```

---

## 3) API Endpoints (with Postman-ready details)

> Base URL assumed to be `http://localhost:5000`

### 🔐 Auth
#### 3.1 Register
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth:** ❌ Not required
- **Body (JSON):**
```json
{
  "email": "example@mail.com",
  "password": "secret123",
  "name": "John Doe"
}
```
- **Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "user": { "id": "USER_ID", "email": "example@mail.com", "name": "John Doe" }
  }
}
```

#### 3.2 Login
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth:** ❌ Not required
- **Body (JSON):**
```json
{
  "email": "example@mail.com",
  "password": "secret123"
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "user": { "id": "USER_ID", "email": "example@mail.com", "name": "John Doe" }
  }
}
```

> ℹ️ Keep the `token` — you will need it to mark episodes as watched.

#### 3.3 Request Password Reset
- **Method:** `POST`
- **URL:** `/api/auth/request-reset`
- **Auth:** ❌ Not required
- **Body (JSON):**
```json
{ "email": "example@mail.com" }
```
- **Response (200):**
```json
{ "success": true, "message": "If an account exists, an email has been sent" }
```

#### 3.4 Reset Password
- **Method:** `POST`
- **URL:** `/api/auth/reset-password`
- **Auth:** ❌ Not required
- **Body (JSON):**
```json
{
  "email": "example@mail.com",
  "token": "TOKEN_FROM_EMAIL",
  "newPassword": "newSecret123"
}
```
- **Response (200):**
```json
{ "success": true, "message": "Password updated successfully" }
```


### 🎌 Anime & Episodes
#### 3.5 Search Anime (ensures cache + prefetch)
- **Method:** `GET`
- **URL:** `/api/anime?q=naruto`
- **Auth:** ❌ Not required
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64af...",
    "title": "naruto",
    "slug": "naruto",
    "episodeCount": 220
  }
}
```
> ℹ️ If the anime doesn’t exist, it is created; episodes are scraped & cached.

#### 3.6 Get Episodes (cached, lazy updates)
- **Method:** `GET`
- **URL:** `/api/anime/:id/episodes`
- **Auth:** ❌ Not required
- **Example:** `/api/anime/64af.../episodes`
- **Response (200):**
```json
{
  "success": true,
  "data": [
    { "_id": "ep1", "number": 1, "title": "Enter Naruto", "type": "canon" },
    { "_id": "ep2", "number": 2, "title": "Training Day", "type": "filler" }
  ]
}
```
> ℹ️ Episodes refresh lazily inside the controller if stale.


### ✅ Watch Tracking (per user)
#### 3.7 Mark Episode Watched / Unwatched
- **Method:** `POST`
- **URL:** `/api/episodes/watch`
- **Auth:** ✅ **Bearer Token required**
  - **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Body (JSON):**
```json
{
  "episodeId": "EPISODE_ID",
  "watched": true
}
```
- **Response (200):**
```json
{
  "success": true,
  "data": { "watchedEpisodes": ["EPISODE_ID"] }
}
```

To **unwatch**:
```json
{
  "episodeId": "EPISODE_ID",
  "watched": false
}
```


---

## 4) Testing With cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"me@test.com","password":"secret123","name":"Me"}'
```

### Login (copy the token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@test.com","password":"secret123"}'
```

### Search Anime
```bash
curl "http://localhost:5000/api/anime?q=naruto"
```

### Get Episodes
```bash
curl "http://localhost:5000/api/anime/<ANIME_ID>/episodes"
```

### Mark Episode Watched
```bash
curl -X POST http://localhost:5000/api/episodes/watch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"episodeId":"<EP_ID>","watched":true}'
```


---

## 5) Typical Workflow (Manual Testing)
1. **Register** → `/api/auth/register`
2. **Login** → `/api/auth/login` → copy `token`
3. **Search** → `/api/anime?q=naruto` → copy `id`
4. **Episodes** → `/api/anime/:id/episodes` → copy one episode `_id`
5. **Watch** → `/api/episodes/watch` with token + `{ episodeId, watched: true }`


---

## 6) Common Issues & Fixes

| Issue | Cause | Fix |
|------|------|-----|
| `{ "success": false, "message": "Route not found" }` | Calling wrong path | Prefix all endpoints with `/api/...` as documented |
| `Illegal arguments: string, undefined` (bcrypt) | Login query didn’t select password | Use `.select('+password')` in login query |
| `ERR_ERL_CREATED_IN_REQUEST_HANDLER` | Creating rate limiter inside a function | Export a **single limiter instance** and `app.use('/api', apiLimiter)` |
| CORS blocked | Wrong `CLIENT_URL` | Set `CLIENT_URL` in `.env` to your frontend origin |


---

## 7) Notes About Scraper
- `services/scraper/animeScraper.js` contains **placeholder selectors**.
- You **must** update DOM selectors to match your chosen source(s).
- Respect site ToS and robots.txt; cache responsibly.


---

## 8) Frontend (Optional)
A ready-to-use **Next.js + Tailwind** static frontend is available in a separate ZIP.  
Set `NEXT_PUBLIC_API_BASE` in the frontend `.env` to `http://localhost:5000`.

---

## 9) License
MIT
