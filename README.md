# SkillVerse — Full App (Backend + Frontend + Admin Panel)

This is now a complete, working app: Express + MongoDB backend, a plain
HTML/CSS/JS frontend that talks to that backend over the real API (no more
localStorage demo data), an Admin Panel, and email notifications.

## Quick Start (do this in order)

### 1. Install & configure the backend

```bash
cd "Mini Project"
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (local Mongo or MongoDB Atlas — see §2)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — leave as `*` while developing, or set to the exact origin your
  frontend is served from (e.g. `http://127.0.0.1:5500`) once you know it
- `EMAIL_USER` / `EMAIL_PASS` / `ADMIN_EMAIL` — see §4 (Email Notifications) below.
  You can leave these blank for now; the app still works, it just skips sending mail.

### 2. Start MongoDB

- **Local MongoDB**: install MongoDB Community Server, then just run `mongod` (or it
  may already run as a service). `MONGO_URI=mongodb://127.0.0.1:27017/skillverse` (default) will work.
- **MongoDB Atlas (no local install)**: create a free cluster at
  https://www.mongodb.com/cloud/atlas, get its connection string, and paste it into
  `MONGO_URI` in `.env`.

### 3. Run the backend

```bash
npm run dev
```

You should see `SkillVerse backend running on port 5000` and a MongoDB connected
message. Leave this running in its own terminal.

### 4. Create the admin account

```bash
npm run seed:admin
```

This creates an admin using `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` from `.env`
(defaults: `admin@skillverse.com` / `Admin@12345`). Log in with these on the normal
login page — you'll be redirected straight to the Admin Panel (`admin.html`) instead
of the regular dashboard.

### 5. Open the frontend

The frontend is plain HTML/CSS/JS — no build step. The easiest way to serve it so
`fetch()` calls behave correctly is a simple static server, e.g. with VS Code's
**Live Server** extension (right-click `index.html` → "Open with Live Server"), or:

```bash
npx serve .
```

Then open the printed URL (e.g. `http://127.0.0.1:5500` or `http://localhost:3000`)
in your browser. If your frontend runs on a different port than `5000`, that's
expected and fine — the frontend talks to the backend via `js/api.js`, which points
at `http://localhost:5000/api` by default. Change `API_BASE` in `js/api.js` if you
run the backend on a different port.

### 6. Test the full flow

1. Sign up a normal account on `signup.html` → you land on `dashboard.html`.
2. Go to **My Skills** → add a skill.
3. Sign up a *second* account, go to **Explore Skills**, and book a session with the
   skill from step 2 → check **Bookings** on both accounts (confirm/complete/cancel).
4. Go to **Certificates & Impact** → upload a certificate and submit an activity.
5. Log in as the admin (step 4 above) → **Admin Panel** → approve/reject the
   certificate and activity. Approving an activity auto-awards credits.
6. Check **Credit Wallet** and **Leaderboard** on the student account — the new
   credits and ranking should show up.
7. If you configured email (§4 below), check the admin inbox for signup/review
   notifications, and the student's inbox for approval/rejection emails.

## Email Notifications (Nodemailer + Gmail)

The configured SkillVerse admin inbox is `sehisaniyamirsha@gmail.com`. New signups, certificate submissions, and activity submissions are routed to this address when SMTP credentials are configured.

The backend emails you (the admin) whenever someone signs up or submits a
certificate/activity for review, and emails the student when you approve or
reject their submission. To turn this on:

1. Go to https://myaccount.google.com/apppasswords (requires 2-Step Verification
   turned on for the Gmail account) and generate an **App Password**.
2. In `.env`, set:
   ```
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=the_16_character_app_password
   ADMIN_EMAIL=where_you_want_admin_notifications_to_land@gmail.com
   ```
3. Restart the backend (`npm run dev`). No code changes needed — if these are
   blank, email sending is silently skipped (logged to the console) so the rest
   of the app still works.

## Admin Panel

`admin.html` has 4 tabs: **Dashboard** (live stats), **Users** (suspend/reactivate),
**Certificates** (approve/reject with an optional rejection reason), and
**Activities** (approve/reject — approving auto-awards credits). It's protected
two ways: the frontend redirects non-admins away, and every `/api/admin/*` route
on the backend also checks `role: admin` server-side, so a non-admin can't reach
admin data even by typing the URL directly.

## What Changed From the Original Project

The frontend used to be a localStorage-only demo with no real backend connection.
It now uses a shared `js/api.js` client (JWT-based) so every page — auth, dashboard,
my skills, explore, bookings, learning, wallet, leaderboard, notifications, settings
— reads and writes real MongoDB data. Two pages were added: `impact.html`
(certificate upload + activity submission) and `admin.html` (the Admin Panel).

---

# SkillVerse Backend (API Reference)


Node.js + Express + MongoDB REST API for the SkillVerse platform (skill sharing, learning, bookings, social impact credits, leaderboard, badges, rewards, and admin verification).

## 1. Setup

```bash
cd skillverse-backend
npm install
cp .env.example .env
```

Edit `.env` and set:
- `MONGO_URI` — your MongoDB connection string (local MongoDB or MongoDB Atlas)
- `JWT_SECRET` — a long random string
- `CLIENT_URL` — your frontend's origin (for CORS), e.g. `http://127.0.0.1:5500`

## 2. Run

```bash
npm run dev     # development (auto-restart with nodemon)
npm start        # production
```

Server runs at `http://localhost:5000` by default.

## 3. Create the first admin account

```bash
npm run seed:admin
```

This creates an admin user using `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` from `.env`. Login with those credentials to get an admin JWT and access `/api/admin/*` routes.

## 4. Folder Structure

```
skillverse-backend/
├── server.js              # entry point, mounts all routes
├── config/db.js           # MongoDB connection
├── models/                # Mongoose schemas (User, Skill, Booking, Learning,
│                             Activity, Certificate, Transaction, Notification,
│                             Badge, Reward)
├── controllers/            # Route logic
├── routes/                 # Express routers
├── middleware/              # auth (JWT), adminOnly, upload (multer), error handler
├── utils/                   # generateToken, notify, awardCredits, badgeLogic, seedAdmin
└── uploads/                 # uploaded certificates / activity proof / profile photos
```

## 5. Authentication

All routes except `/api/auth/signup` and `/api/auth/login` require:
```
Authorization: Bearer <token>
```
Get the token from the `signup`/`login` response.

## 6. API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/signup | Register (name, email, password, confirmPassword) |
| POST | /api/auth/login | Login (email, password) |
| GET  | /api/auth/me | Get logged-in user |

### Profile
| Method | Route | Description |
|---|---|---|
| GET | /api/users/profile | Full profile incl. skills, certificates, badges |
| PUT | /api/users/profile | Update name/bio/profilePhoto (multipart: `profilePhoto`) |

### Skills
| Method | Route | Description |
|---|---|---|
| GET | /api/skills?search=&category= | Explore all active skills |
| GET | /api/skills/mine | My skills (that I can teach) |
| GET | /api/skills/:id | Single skill |
| POST | /api/skills | Add a new skill |
| PUT | /api/skills/:id | Edit my skill |
| DELETE | /api/skills/:id | Delete my skill |

### Learning
| Method | Route | Description |
|---|---|---|
| GET | /api/learning | My learning list |
| POST | /api/learning | Start learning a skill `{ skillId }` |
| PUT | /api/learning/:id | Update progress `{ progress }` |

### Bookings
| Method | Route | Description |
|---|---|---|
| GET | /api/bookings | My bookings (as student or mentor) |
| POST | /api/bookings | Create booking `{ skillId, date, time, notes }` |
| PUT | /api/bookings/:id/status | Update status `{ status }` |

### Social Impact Activities
| Method | Route | Description |
|---|---|---|
| GET | /api/activities | My submitted activities |
| POST | /api/activities | Submit activity (multipart: `proof`, fields: type, description, date, itemCount) |

### Certificates
| Method | Route | Description |
|---|---|---|
| GET | /api/certificates | My certificates |
| POST | /api/certificates | Upload certificate (multipart: `certificate`, field: skillName) |

### Credits / Wallet
| Method | Route | Description |
|---|---|---|
| GET | /api/credits/wallet | Balance + recent transactions |
| GET | /api/credits/transactions | Full transaction history |

### Leaderboard
| Method | Route | Description |
|---|---|---|
| GET | /api/leaderboard?period=overall\|weekly\|monthly | Ranked users |

### Badges
| Method | Route | Description |
|---|---|---|
| GET | /api/badges | All badges in the system |
| GET | /api/badges/mine | My earned badges |

### Rewards
| Method | Route | Description |
|---|---|---|
| GET | /api/rewards | List of planned/announced rewards |

### Notifications
| Method | Route | Description |
|---|---|---|
| GET | /api/notifications | My notifications |
| PUT | /api/notifications/:id/read | Mark one as read |
| PUT | /api/notifications/read-all | Mark all as read |

### Admin (requires `role: admin`)
| Method | Route | Description |
|---|---|---|
| GET | /api/admin/dashboard | Platform stats |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/status | Suspend/reactivate `{ status }` |
| GET | /api/admin/certificates?status= | List certificates |
| PUT | /api/admin/certificates/:id/review | Approve/reject `{ status, note }` |
| GET | /api/admin/activities?status= | List social-impact activities |
| PUT | /api/admin/activities/:id/review | Approve/reject `{ status, note }` (auto-awards credits) |
| POST | /api/admin/credits/adjust | Manual credit adjustment `{ userId, amount, reason }` |
| POST | /api/admin/rewards | Create a reward `{ title, rank, amount, period }` |
| PUT | /api/admin/rewards/:id/announce | Announce winner `{ winnerId }` |

## 7. Automatic Business Logic

- **Approving a social-impact activity** automatically awards credits (Book Donation: 30, E-Waste Recycling: 20, Skill Teaching: 50, Community Activity: 25), logs a transaction, sends a notification, and checks for new badges.
- **Badges** are auto-evaluated after credit changes, completed bookings, and completed learning — no manual admin action needed for badge awarding.
- **Notifications** are auto-created for: booking updates, certificate review, activity review, credit changes, badge earned, reward announcements.

## 8. Connecting Your Frontend

From your frontend JavaScript, call the API like this:

```js
const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
// data.token -> save it (e.g. localStorage) and send as
// Authorization: Bearer <token> on every subsequent request
```

Make sure `CLIENT_URL` in `.env` matches where your frontend is served from (CORS).
