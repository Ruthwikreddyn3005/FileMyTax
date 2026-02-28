# FileMyTax

**Live app: [file-my-tax.vercel.app](https://file-my-tax.vercel.app)**

**Free, accurate, and secure US federal income tax filing — right in your browser.**

FileMyTax is a web application that lets you prepare and file your federal 1040 tax return for free. All tax calculations run entirely in your browser. Your data is saved to your account in the cloud, so you can pick up where you left off from any device.

---

## Features

- **Multi-account login** — Email/password or Google Sign-In
- **Cloud sync** — Your tax data is saved to your account and accessible from any device
- **Free filing** — No hidden fees, no upsells
- **Privacy-first** — Tax calculations happen in the browser

## Supported Income Forms

- W-2
- 1099-INT
- 1099-DIV
- 1099-B
- 1098-E (student loan interest)
- 1099-R (IRA and pension distributions)
- SSA-1099 (Social Security)

## Supported Schedules

- Schedule 1 (Schedule E and 1098-E)
- Schedule 2
- Schedule 3 (excess FICA tax)
- Schedule 8812 (child tax credit)
- Schedule B
- Schedule D
- Schedule E
- F1040-V
- F8949 (uncovered investment transactions)
- F8889 (Health Savings Accounts)
- F8959 (Additional Medicare Tax)
- F8960 (Net Investment Income Tax)

## Supported Credits

- Child and dependent care credit
- Earned income credit

## Supported States

### States with implemented returns
- Illinois (partial, tax year 2021)

### No-income-tax states (federal filing only needed)
Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, Wyoming

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 17, TypeScript, Material-UI v4, Redux |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL (Neon) |
| Auth | JWT, Google OAuth 2.0 |
| Hosting | Vercel (frontend), Railway (backend) |

---

## Running Locally

### Prerequisites
- Node.js 16.7+
- npm 7+

### Frontend
```bash
npm install
npm start
```

### Backend
```bash
cd server
npm install
npm run dev
```

Create `server/.env` from `server/.env.example` and fill in your values.

---

## Environment Variables

### Frontend (`.env`)
```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (`server/.env`)
```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

Built by **Ruthwik Reddy**
