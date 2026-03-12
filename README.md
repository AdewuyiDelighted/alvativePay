## ALVATIVEPAY - Digital Wallet
This is a Fintech App that simulates a digital wallet with features like user registration, login, fund transfers, transaction history, and real-time notifications. The app is built using a Node.js/Express.js backend and a React frontend, with PostgreSQL as the database and WebSockets for real-time notifications.

# Features
- User Authentication:

   User registration and login with JWT-based authentication.

   Secure password hashing using bcrypt.

* Fund Management:

  Add funds using a mock payment gateway (Paystack).

   Transfer funds between users.

+ Transaction History:

  View user transaction history.

- Real-Time Notifications:

  Receive real-time notifications for transactions using WebSockets.

 + Currency Conversion:

  Convert currencies using the CurrencyLayer API.

# Tech Stack
Backend
Node.js: Runtime environment.

Express.js: Web framework.

PostgreSQL: Relational database.

Prisma: ORM for database interactions.

JWT: JSON Web Tokens for authentication.

Paystack: Mock payment gateway.

Socket.IO: Real-time notifications.

CurrencyLayer API: Currency conversion.

# Setup Instructions
## Prerequisites

  Node.js: Install from [nodejs.org](https://nodejs.org/en/download)

  PostgreSQL: Install from [postgresql.org](https://www.postgresql.org/download/).

  Paystack API Key: Sign up at Paystack.

  CurrencyLayer API Key: Sign up at CurrencyLayer.

# Backend Setup
### Clone the Repository
- [][]

### Install Dependencies:


- npm install
### Set Up Environment Variables:
- Create a .env file in the backend folder:


```
DATABASE_URL="postgresql://user:password@localhost:5432/fintech"
JWT_SECRET="your-jwt-secret-key"
PAYSTACK_SECRET_KEY="your-paystack-secret-key"
CURRENCY_LAYER_API_KEY="your-currencylayer-api-key"
PORT=3000
```
### Set Up Database:

### Run Prisma migrations:

```
npx prisma migrate dev --name init

```
### Generate Prisma client:
```
npx prisma generate
```
### Start the Backend Server:


```
npm run dev
```

# API Endpoints
### Authentication
- POST /api/user/register: Register a new user.

* POST /api/user/login: Log in and receive a JWT token.

# Transactions

- POST /api/transaction/initialize-payment: Initialize a payment to add funds.

* POST /api/transaction/verify-payment: Verify a payment and update the user's balance.

+ POST /api/transaction/transfer-fund: Transfer funds between users.

- GET /api/transaction/transaction-history: Fetch transaction history for a user.

# WebSocket
Real-Time Notifications: Listen for notification events on the WebSocket connection.

# Example Requests
### Register a User
```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```
### Log In
```
POST /api/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
### Initialize Payment
```
POST /api/initialize-payment
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "user_id":"31f8ef4a-b031-47c8-ac0e-79fb50649001",
    "password":"bukky@111",
    "amount":"2000"
}
```
### Transfer funds
```
POST /api/initialize-payment
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "sender_id": "31f8ef4a-b031-47c8-ac0e-79fb50649001",
    "receiver_id":"0ee314d8-ce70-43a8-930f-300e685f1fda",
    "amount":"500",
    "password":"bukky@111"
}
```
### Fetch Transaction History

```GET /api/transaction-history
Authorization: Bearer <your-jwt-token>
{
   "user_id":"31f8ef4a-b031-47c8-ac0e-79fb50649001",
    "password":"bukky@111"
}
```
### Real-Time Notifications
When a transaction occurs fund transfer the server emits a notification event to all connected clients.
