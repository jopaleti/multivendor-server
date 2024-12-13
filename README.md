# 🚀 Multi-Vendor E-commerce Backend Server

Welcome to the Multi-Vendor E-commerce Backend Server! This is a Node.js application built with TypeScript to power multi-vendor e-commerce platforms.

### ✨ Features

- **📂 Database:** MongoDB is used to store application data efficiently.
- **✅ Two-Factor Authentication:** OTP-based two-factor authentication (2FA) ensures secure user login and account management.
- **💳 Payment Gateway:** Seamlessly integrated with Paystack for secure and reliable payments.
- **🚚 Multi-Vendor Support:** Handles multiple vendors with ease, providing a scalable backend for e-commerce.

### 🔧 Technology Stack

- Backend: Node.js with TypeScript
- Database: MongoDB
- Authentication: OTP-based 2FA
- Payment Integration: Paystack

### 🚫 Prerequisites

Before setting up the project, ensure you have the following installed:

- 🎩 Node.js (v16 or later)
- 💾 MongoDB (local or hosted instance)
- ☎ Paystack API Keys

### 🔧 Setup Instructions

1. Clone the Repository:

```javascript
git clone https://github.com/jopaleti/multivendor-server.git
cd multivendor-server
```

2. Install Dependencies:

```javascript
npm install
```

3. Setup Environment Variables:
Create a .env file in the root directory and add the following:

```javascript
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key
OTP_SECRET=your-otp-secret
```

4. Run the Application:

```javascript
npm run start
```