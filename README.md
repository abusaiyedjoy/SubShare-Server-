# SubShare Backend API

A subscription sharing platform backend built with Hono.js, Drizzle ORM, and Cloudflare Workers.

## Features

- 🔐 JWT Authentication
- 💰 Wallet System with Top-up Requests
- 📊 Subscription Sharing & Access Management
- 🛡️ Admin Panel with Verification System
- 📈 Transaction History & Reporting
- 🔒 Encrypted Credentials Storage
- 💸 Automated Commission System

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: JWT

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create D1 database:
```bash
npx wrangler d1 create subshare-db
```

3. Run migrations:
```bash
npx wrangler d1 execute DB --local --file=./src/db/migrations/0001_init.sql
```

4. Create admin user:
```bash
npx wrangler d1 execute DB --local --command="INSERT INTO users (name, email, password, role, balance) VALUES ('Admin User', 'admin@subshare.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 0)"
```

5. Start development server:
```bash
pnpm dev
```

6. Deploy to production:
```bash
pnpm deploy
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/wallet-balance` - Get balance
- `GET /api/users/wallet-transactions` - Get transactions
- `GET /api/users/my-subscriptions` - Get active subscriptions
- `GET /api/users/shared-subscriptions` - Get shared subscriptions

### Wallet
- `POST /api/wallet/topup-request` - Create topup request
- `GET /api/wallet/topup-requests` - Get user's requests
- `GET /api/wallet/admin/topup-requests` - Get all requests (Admin)
- `PUT /api/wallet/admin/topup-requests/:id/approve` - Approve request (Admin)
- `PUT /api/wallet/admin/topup-requests/:id/reject` - Reject request (Admin)

### Platforms
- `GET /api/platforms` - Get all platforms
- `POST /api/platforms` - Create platform (Admin)
- `PUT /api/platforms/:id` - Update platform (Admin)
- `DELETE /api/platforms/:id` - Delete platform (Admin)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Share subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `POST /api/subscriptions/:id/unlock` - Purchase access
- `GET /api/subscriptions/:id/credentials` - Get credentials

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports` - Get all reports (Admin)
- `PUT /api/reports/:id/resolve` - Resolve report (Admin)

### Admin
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/balance` - Adjust balance
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/pending-verifications` - Get pending verifications
- `POST /api/admin/subscriptions/:id/verify` - Verify subscription
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update settings

## Environment Variables

Set in `wrangler.json`:
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRY` - Token expiration time (e.g., "24h")
- `ADMIN_COMMISSION_PERCENTAGE` - Commission percentage (e.g., "10")
- `ENCRYPTION_KEY` - Key for encrypting credentials

## Default Admin Credentials
Email: abusaiyedjoy1@gmail.com
Password: 12345678910

License
MIT

---

🎉 **Your complete backend is ready!**

Type **"test"** if you want me to provide a complete Postman collection JSON file for all endpoints, or let me know if you need anything else!