# Library Management System - Backend API

RESTful API backend for the Library Management System built with Node.js, Express, Sequelize, and MySQL.

## Features

- 🔐 JWT-based authentication with role-based access control (Admin/Student)
- 📚 Book management (CRUD operations)
- 📖 Borrow/Return requests with approval workflow
- ✅ Attendance tracking with QR codes and GPS validation
- 💰 Fee management and Razorpay payment integration
- 🔔 Push notifications via Firebase Cloud Messaging
- 📊 Admin dashboard with reports

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** MySQL
- **Auth:** JWT + Bcrypt
- **Payment:** Razorpay
- **Push:** Firebase Cloud Messaging (FCM)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-fcm-sender-id

QR_HMAC_SECRET=your-qr-hmac-secret
QR_TOKEN_TTL=30

LIBRARY_LAT=28.7041  # Optional: Library GPS coordinates
LIBRARY_LON=77.1025
```

4. **Create MySQL database:**
```bash
mysql -u root -p
CREATE DATABASE library_db;
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Create initial admin user (optional):**
```bash
node setup.js
```

Default admin credentials:
- Email: `admin@library.com`
- Password: `admin123` (or from `ADMIN_DEFAULT_PASSWORD` env var)

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register (Student/Admin)
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (authenticated)
- `PUT /api/auth/profile` - Update profile (authenticated)

### Books
- `GET /api/books` - Get all books (with pagination, search, filters)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

### Borrow & Return
- `POST /api/borrow` - Request to borrow a book (Student)
- `GET /api/borrow/my` - Get my borrows (Student)
- `PUT /api/borrow/:id/approve` - Approve borrow request (Admin)
- `PUT /api/borrow/:id/return` - Request return (Student)
- `PUT /api/borrow/:id/approve-return` - Approve return (Admin)
- `GET /api/borrow/all` - Get all borrows (Admin)

### Attendance
- `POST /api/attendance/qrcode` - Generate QR code (Admin/Kiosk)
- `POST /api/attendance/mark` - Mark attendance via QR (Student)
- `GET /api/attendance/my` - Get my attendance (Student)
- `GET /api/attendance/student/:id` - Get student attendance (Admin)
- `GET /api/attendance/all` - Get all attendance (Admin)
- `GET /api/attendance/unverified` - Get unverified attendance (Admin)
- `PUT /api/attendance/:id/verify` - Verify/reject attendance (Admin)

### Fees & Payments
- `GET /api/fees/my` - Get my fees (Student)
- `GET /api/fees/all` - Get all fees (Admin)
- `POST /api/fees` - Create fee (Admin)
- `POST /api/fees/pay` - Create payment order (Student)
- `POST /api/fees/verify` - Verify payment (Student)
- `GET /api/fees/my/history` - Get payment history (Student)
- `POST /api/payments/webhook` - Razorpay webhook handler

### Notifications
- `GET /api/notify/my` - Get my notifications (Student)
- `PUT /api/notify/:id/read` - Mark notification as read (Student)
- `POST /api/notify` - Send notification (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard summary (Admin)
- `GET /api/admin/reports/attendance` - Attendance report (Admin)
- `GET /api/admin/students` - Get all students (Admin)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## QR Code Attendance

1. Admin generates QR code via `/api/attendance/qrcode`
2. QR code expires in 30 seconds (configurable via `QR_TOKEN_TTL`)
3. Student scans QR code and submits via `/api/attendance/mark`
4. System validates:
   - Token signature and expiration
   - GPS location (if configured)
   - Prevents duplicate attendance for same day
5. Attendance marked as "provisional" if GPS doesn't match or selfie required
6. Admin can verify/reject via `/api/attendance/:id/verify`

## Payment Flow

1. Student initiates payment: `POST /api/fees/pay`
2. Backend creates Razorpay order
3. Client opens Razorpay Checkout
4. On success, Razorpay sends webhook to `/api/payments/webhook`
5. Backend verifies webhook signature and updates fee/transaction
6. FCM notification sent to student

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Auth & other middleware
├── models/          # Sequelize models
├── migrations/      # Database migrations
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Entry point
└── package.json
```

## Development

- Use `npm run dev` for development with nodemon
- Use `npm run migrate` to run migrations
- Use `npm run migrate:undo` to undo last migration

## Testing

Create a test database and run:
```bash
npm test
```

## Security Notes

- Change default JWT secret in production
- Use strong passwords for database
- Keep Razorpay keys secure
- Enable HTTPS in production
- Configure CORS properly for production

## License

ISC






"# Library_Management" 
