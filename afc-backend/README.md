# 🚌 Automated Fare Collection (AFC) System

A full-stack, production-ready bus ticketing system with RFID-based tap-in/tap-out, GPS-based fare calculation, and smart wallet management.

---

## 🏗️ Architecture Overview

```
afc-system/
├── afc-backend/          # Node.js + Express + MongoDB API
└── afc-frontend/         # Next.js 14 App Router UI
```

---

## 🔧 Backend Setup (`afc-backend/`)

### Tech Stack
- **Node.js** + **Express.js** — REST API
- **MongoDB** + **Mongoose** — Database with transactions
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Winston** — Logging
- **Helmet + express-rate-limit** — Security

### Installation

```bash
cd afc-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

### Environment Variables (`.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/afc_system
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
BASE_FARE=10
PER_KM_RATE=2
```

### API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register with RFID |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Current user profile |
| GET | `/api/wallet` | ✅ | Balance + transactions |
| POST | `/api/wallet/recharge` | ✅ | Top up wallet |
| POST | `/api/trip/tap-in` | ✅ | Start trip (RFID + GPS) |
| POST | `/api/trip/tap-out` | ✅ | End trip, deduct fare |
| GET | `/api/trip/history` | ✅ | Paginated trip history |
| GET | `/api/admin/stats` | 🔐 | System statistics |
| GET | `/api/admin/users` | 🔐 | All users |
| GET | `/api/admin/transactions` | 🔐 | All transactions |
| GET | `/api/admin/trips` | 🔐 | All trips |

### Fare Calculation (Haversine)

```
Total Fare = BASE_FARE + (distance_km × PER_KM_RATE)
           = ₹10       + (km × ₹2)
```

### Folder Structure

```
afc-backend/
├── server.js                  # Entry point
├── config/
│   └── database.js            # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── walletController.js
│   ├── tripController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js                # JWT protect + adminOnly
│   ├── validation.js          # express-validator rules
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # name, email, rfidUID, walletBalance
│   ├── Trip.js                # tapIn/Out, fare, status
│   └── Transaction.js         # recharge/deduction ledger
├── routes/
│   ├── auth.js
│   ├── wallet.js
│   ├── trip.js
│   └── admin.js
├── services/
│   ├── authService.js         # Register + login logic
│   ├── walletService.js       # Balance + recharge (DB sessions)
│   └── tripService.js         # Tap-in/out + fare deduction
└── utils/
    ├── logger.js              # Winston logger
    ├── fareCalculator.js      # Haversine + fare formula
    └── response.js            # Standardized API responses
```

---

## 🎨 Frontend Setup (`afc-frontend/`)

### Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — Utility styling
- **Custom UI Components** — Card, Button, Input, Badge, Table, Modal, Toast
- **Axios** — API calls with JWT interceptors

### Installation

```bash
cd afc-frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### Pages

| Route | Description |
|-------|-------------|
| `/login` | JWT login with demo credentials hint |
| `/signup` | Register with RFID UID |
| `/dashboard` | Overview, tap panel, recent trips |
| `/wallet` | Balance hero, recharge modal, transaction log |
| `/trips` | Paginated trip table with filters |

### Folder Structure

```
afc-frontend/
├── app/
│   ├── layout.jsx             # Root layout with fonts + providers
│   ├── globals.css            # Design tokens + animations
│   ├── page.jsx               # Redirect to dashboard or login
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── dashboard/page.jsx
│   ├── wallet/page.jsx
│   └── trips/page.jsx
├── components/
│   ├── ui/index.jsx           # Button, Input, Card, Badge, Table, Modal, StatCard...
│   ├── layout/
│   │   ├── Sidebar.jsx        # Nav with active states
│   │   └── DashboardLayout.jsx # Auth guard wrapper
│   └── TapPanel.jsx           # Tap-in/out with GPS
├── context/
│   ├── AuthContext.jsx        # JWT user session
│   └── ToastContext.jsx       # Global notifications
├── hooks/
│   ├── useWallet.js           # Wallet fetch + recharge
│   └── useTrips.js            # Trip fetch + tap-in/out
└── services/
    └── api.js                 # Axios instance + all API calls
```

---

## 🚀 Running Both Together

```bash
# Terminal 1 — Backend
cd afc-backend && npm run dev

# Terminal 2 — Frontend
cd afc-frontend && npm run dev

# Backend:  http://localhost:5000
# Frontend: http://localhost:3000
```

---

## 🔒 Security Features

- Passwords hashed with **bcrypt (salt 12)**
- **JWT** tokens with configurable expiry
- **Helmet** security headers
- **Rate limiting**: 100 req/15min globally, 10 req/15min for auth
- **MongoDB sessions** for atomic wallet deductions
- Input validation on all routes via **express-validator**
- Minimum balance check before tap-in
- Duplicate active trip prevention

---

## 📐 Data Models

### User
```json
{ "name": "Arjun Sharma", "email": "arjun@example.com",
  "rfidUID": "A1B2C3D4", "walletBalance": 250.50,
  "role": "user", "isActive": true }
```

### Trip
```json
{ "rfidUID": "A1B2C3D4",
  "tapIn":  { "lat": 28.6139, "lng": 77.2090, "timestamp": "..." },
  "tapOut": { "lat": 28.6562, "lng": 77.2410, "timestamp": "..." },
  "distanceKm": 6.24, "duration": 22,
  "fare": { "baseFare": 10, "perKmRate": 2, "distanceFare": 12.48, "totalFare": 22.48 },
  "status": "completed" }
```

### Transaction
```json
{ "type": "deduction", "amount": 22.48,
  "balanceBefore": 272.98, "balanceAfter": 250.50,
  "description": "Fare deduction for trip" }
```
