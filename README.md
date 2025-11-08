# Anime Episodes Web Application

A full-stack web application that displays anime episodes with classification (filler/canon/mixed) and allows users to track their watch status. The application scrapes data from existing sources, caches it in MongoDB, and provides a fast, user-friendly interface.

## 📋 Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Security Features](#security-features)
- [Deployment](#deployment)

## ✨ Features

1. **Anime Display**: Browse all anime titles or search for specific ones
2. **Episode Classification**: Each episode is classified as:
   - **Canon**: Based on original source material
   - **Filler**: Anime-only content
   - **Mixed**: Combination of canon and filler
   - **Unknown**: Classification not available
3. **Smart Caching**: 
   - Episodes are scraped and cached when an anime is first searched
   - Lazy updates only when source data changes
   - Zero latency when viewing episodes (data served from DB)
4. **Watch Status Tracking**: 
   - Users can mark episodes as watched/unwatched
   - Status is saved per user (requires authentication)
5. **Complete Authentication**:
   - User registration
   - Login/Logout
   - Password reset via email
6. **Security**: Rate limiting, CORS policies, JWT authentication

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend    │ ──────> │  MongoDB    │
│  (Next.js)  │         │  (Express)   │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Scraper    │
                       │  (External   │
                       │   Sources)   │
                       └──────────────┘
```

### Key Components

1. **Frontend (Next.js)**: React-based UI with client-side routing
2. **Backend (Express)**: RESTful API with authentication and scraping
3. **Database (MongoDB)**: Stores anime, episodes, and user data
4. **Scraper**: Fetches episode data from external sources (Anime Filler List)

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**: Server framework
- **MongoDB** + **Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **Nodemailer**: Email service for password reset
- **Axios** + **Cheerio**: Web scraping
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **express-rate-limit**: API rate limiting

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **Tailwind CSS**: Styling
- **React Hot Toast**: Notifications

## 📁 Project Structure

```
anime-episodes/
├── anime-episodes-backend/          # Backend API
│   ├── config/                       # Configuration files
│   │   ├── db.js                     # MongoDB connection
│   │   └── rateLimit.js              # Rate limiting config
│   ├── controllers/                  # Request handlers
│   │   ├── animeController.js        # Anime CRUD operations
│   │   ├── authController.js        # Authentication logic
│   │   └── episodeController.js      # Episode watch status
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT authentication
│   │   ├── maybeAuth.js              # Optional authentication
│   │   └── error.js                  # Error handling
│   ├── models/                       # Mongoose schemas
│   │   ├── Anime.js                  # Anime model
│   │   ├── Episode.js                # Episode model
│   │   └── User.js                   # User model
│   ├── routes/                       # API routes
│   │   ├── animeRoutes.js            # Anime endpoints
│   │   ├── authRoutes.js             # Auth endpoints
│   │   └── episodeRoutes.js          # Episode endpoints
│   ├── services/                     # Business logic
│   │   ├── email.js                  # Email service
│   │   └── scraper/
│   │       └── animeScraper.js       # Web scraper
│   ├── scripts/
│   │   └── seed.js                   # Database seeding
│   ├── server.js                     # Express app entry
│   └── package.json
│
└── frontend/                         # Frontend application
    ├── app/                          # Next.js App Router
    │   ├── page.js                   # Homepage (all anime)
    │   ├── anime/
    │   │   └── page.js               # Episode list page
    │   ├── login/
    │   │   └── page.js               # Login page
    │   ├── register/
    │   │   └── page.js               # Registration page
    │   ├── reset-password/
    │   │   └── page.js               # Password reset page
    │   ├── layout.js                 # Root layout
    │   └── globals.css               # Global styles
    ├── components/
    │   └── Navbar.js                 # Navigation component
    ├── context/
    │   └── AppContext.js             # React context for state
    ├── lib/
    │   └── api.js                    # API utility functions
    └── package.json
```

## 🔄 Data Flow

### 1. Anime Discovery Flow

```
User searches "Naruto"
    ↓
Frontend: GET /api/anime?q=naruto
    ↓
Backend: ensureAnimeCached("naruto", prefetch=true)
    ↓
Check if anime exists in DB
    ├─ Yes → Check if episodes need update
    │         ├─ Stale → Scrape episodes
    │         └─ Fresh → Return anime
    └─ No → Create anime doc → Scrape episodes → Return anime
    ↓
Episodes cached in MongoDB
    ↓
Return anime metadata to frontend
```

### 2. Episode Viewing Flow

```
User clicks "View Episodes"
    ↓
Frontend: GET /api/anime/:id/episodes (with optional JWT)
    ↓
Backend: 
    ├─ Check if episodes need lazy update
    ├─ Fetch episodes from DB
    ├─ If user logged in: Mark watched episodes
    └─ Return episode list
    ↓
Frontend displays episodes with watch status
```

### 3. Watch Status Update Flow

```
User toggles episode watch status
    ↓
Frontend: POST /api/episodes/watch (requires JWT)
    Body: { episodeId, watched: true/false }
    ↓
Backend:
    ├─ Verify JWT token
    ├─ Find user
    ├─ Add/remove episode from watchedEpisodes array
    └─ Save user
    ↓
Return updated watchedEpisodes list
```

### 4. Authentication Flow

```
User Registration:
    User submits form → POST /api/auth/register
    → Hash password → Create user → Generate JWT → Return token

User Login:
    User submits form → POST /api/auth/login
    → Verify password → Generate JWT → Return token

Password Reset:
    Request: POST /api/auth/request-reset
    → Generate reset token → Send email with link
    
    Reset: POST /api/auth/reset-password
    → Verify token → Update password → Clear token
```

## 📝 Step-by-Step Implementation

### Phase 1: Backend Setup

1. **Initialize Express Server**
   - Set up Express app with middleware (CORS, Helmet, body parser)
   - Configure rate limiting
   - Set up error handling middleware

2. **Database Models**
   - Create `Anime` model (title, slug, episodeCount, lastScrapedAt)
   - Create `Episode` model (anime ref, number, title, type, sourceHash)
   - Create `User` model (email, password, watchedEpisodes, resetToken)

3. **Scraper Service**
   - Implement `fetchFillerJSON()` to get data from Anime Filler List
   - Implement `extractEpisodesFromData()` to parse JSON
   - Implement `ensureAnimeCached()` to create/find anime
   - Implement `refreshEpisodesIfStale()` with hash-based lazy updates

4. **Authentication**
   - JWT token generation/verification
   - Password hashing with bcrypt
   - Email service for password reset
   - Auth middleware (required and optional)

5. **API Endpoints**
   - `GET /api/anime` - List all or search anime
   - `GET /api/anime/:id/episodes` - Get episodes (with watch status)
   - `POST /api/episodes/watch` - Update watch status
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/request-reset` - Request password reset
   - `POST /api/auth/reset-password` - Reset password

### Phase 2: Frontend Setup

1. **Next.js App Structure**
   - Set up App Router
   - Create layout with Navbar
   - Set up global styles (Tailwind)

2. **State Management**
   - Create AppContext for global state (user, token)
   - Implement API functions (login, register, search, etc.)
   - Handle localStorage for session persistence

3. **Pages**
   - Homepage: Display all anime + search functionality
   - Anime detail: Episode list with watch checkboxes
   - Login/Register: Authentication forms
   - Reset password: Two-step form (request + reset)

4. **User Experience**
   - Loading states
   - Error handling
   - Toast notifications
   - Responsive design

### Phase 3: Integration

1. **Connect Frontend to Backend**
   - Configure API base URL
   - Handle CORS
   - Implement token-based authentication

2. **Watch Status Sync**
   - Pass JWT token in episode requests
   - Display watched status from backend
   - Update status on toggle

3. **Lazy Loading & Caching**
   - Episodes pre-cached on search
   - Lazy updates only when source changes
   - Fast response times from DB

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database (local or Atlas)
- SMTP credentials for email (optional, for password reset)

### Backend Setup

1. Navigate to backend directory:
```bash
cd anime-episodes-backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create `.env` file:
```env
# Database
MONGO_URI=mongodb://localhost:27017/anime-episodes
# or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@example.com

# Server
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev    # Development with nodemon
# or
npm start      # Production
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

5. Open browser:
```
http://localhost:3000
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": { "id": "...", "email": "...", "name": "..." }
  }
}
```

#### Request Password Reset
```http
POST /api/auth/request-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### Anime Endpoints

#### List All Anime
```http
GET /api/anime?page=1&limit=50
```

#### Search Anime (creates if not exists, prefetches episodes)
```http
GET /api/anime?q=naruto
```

#### Get Episodes
```http
GET /api/anime/:id/episodes
Authorization: Bearer <token>  # Optional, for watch status

Response: {
  "success": true,
  "data": [
    {
      "_id": "...",
      "number": 1,
      "title": "Enter Naruto",
      "type": "canon",
      "__watched": true  # Only if authenticated
    }
  ]
}
```

### Episode Endpoints

#### Update Watch Status (requires authentication)
```http
POST /api/episodes/watch
Authorization: Bearer <token>
Content-Type: application/json

{
  "episodeId": "episode-id",
  "watched": true
}
```

## 🎨 Frontend Pages

### Homepage (`/`)
- Displays all anime in a grid layout
- Search functionality to find/create anime
- Pagination for large lists
- Click anime card to view episodes

### Anime Detail (`/anime?id=...`)
- Lists all episodes for selected anime
- Shows episode number, title, and type (canon/filler/mixed)
- Watch status checkbox (requires login)
- Real-time updates when toggling watch status

### Login (`/login`)
- Email and password form
- Link to password reset
- Redirects to homepage on success

### Register (`/register`)
- Name, email, and password form
- Creates account and logs in automatically
- Redirects to homepage on success

### Reset Password (`/reset-password`)
- Two-step process:
  1. Request reset: Enter email
  2. Reset password: Enter token from email + new password
- Auto-fills token/email from URL if accessed via email link

## 🔒 Security Features

1. **Rate Limiting**: Prevents API abuse (120 requests per minute by default)
2. **CORS**: Configured to allow requests only from specified origin
3. **Helmet**: Security headers to prevent common attacks
4. **Password Hashing**: Bcrypt with salt rounds
5. **JWT Authentication**: Secure token-based auth
6. **Input Validation**: Email validation, password requirements
7. **Password Reset Security**: Time-limited tokens (1 hour expiry)

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables in hosting dashboard
4. Deploy

Required environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `SMTP_*` (for email)
- `PORT` (usually auto-set by host)

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variable:
   - `NEXT_PUBLIC_API_BASE` = your backend URL
4. Deploy

### Database (MongoDB Atlas)

1. Create account at mongodb.com/atlas
2. Create cluster
3. Get connection string
4. Add to backend `.env` as `MONGO_URI`

## 📊 Database Schema

### Anime Collection
```javascript
{
  _id: ObjectId,
  title: String (unique),
  slug: String (unique),
  sourceUrl: String,
  episodeCount: Number,
  lastScrapedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Episode Collection
```javascript
{
  _id: ObjectId,
  anime: ObjectId (ref: Anime),
  number: Number,
  title: String,
  type: String (enum: 'canon', 'filler', 'mixed', 'unknown'),
  sourceHash: String,  // For lazy update detection
  createdAt: Date,
  updatedAt: Date
}
```

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  name: String,
  watchedEpisodes: [ObjectId] (ref: Episode),
  resetToken: String,
  resetTokenExp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 How Lazy Updates Work

1. **Source Hash**: Each episode batch gets a hash based on its content
2. **Comparison**: When fetching episodes, compare current source hash with stored hash
3. **Update Only If Changed**: If hashes differ, scrape and update episodes
4. **Efficiency**: Avoids unnecessary scraping when source hasn't changed

## 🎯 Key Features Explained

### Pre-caching Episodes
When a user searches for an anime:
1. Anime is created/found in DB
2. Episodes are immediately scraped and cached
3. When user views episodes later, data comes from DB (fast)

### Watch Status Per User
- Each user has a `watchedEpisodes` array
- When fetching episodes, backend checks if episode ID is in user's array
- Adds `__watched: true/false` to each episode in response
- Only authenticated users see their watch status

### Episode Classification
- **Canon**: Episodes based on original manga/source
- **Filler**: Anime-only episodes not in source material
- **Mixed**: Episodes with both canon and filler content
- **Unknown**: Classification not available

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB connection fails**: Check `MONGO_URI` in `.env`
- **Scraper not working**: Verify internet connection and source URL
- **Email not sending**: Check SMTP credentials

### Frontend Issues
- **API calls failing**: Verify `NEXT_PUBLIC_API_BASE` matches backend URL
- **CORS errors**: Ensure `CLIENT_URL` in backend matches frontend URL
- **Auth not working**: Check JWT token in localStorage

## 📝 Notes

- This application only displays episode metadata. No streaming functionality.
- Scraping respects source website's terms of service
- Data is cached to reduce load on source websites
- Authentication is only required for saving watch status (viewing is public)

## 🔮 Future Enhancements

- Admin panel for manual data updates
- Scheduled cron jobs for automatic re-scraping
- Multiple source support with data merging
- User profiles and preferences
- Episode filtering (show only canon, hide fillers, etc.)
- Watch progress tracking (percentage complete)
- Export watch list

---

**Built with ❤️ for anime fans who want to skip the fillers!**

