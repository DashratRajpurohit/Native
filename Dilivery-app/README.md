# Delivery Chacker

## Description
Delivery Chacker is a full-stack React Native application designed to solve a common e-commerce problem: documenting and proving the condition of damaged, incorrect, or tampered deliveries. By allowing users to securely capture photo evidence with exact GPS coordinates and upload it securely, Delivery Chacker ensures that both buyers and sellers have a verified trail of evidence for processing claims.

## Problem Statement
When a package arrives damaged, missing items, or entirely wrong, customers often struggle to prove it wasn't their fault. Couriers require concrete evidence to process insurance claims. Delivery Chacker streamlines this by instantly logging the condition, secure photo evidence, and location coordinates to an immutable database.

## Features
- **Authentication**: Secure JWT-based user login and registration.
- **Create Parcel Proof**: A structured form to log Order ID, Courier, and Condition.
- **Camera Evidence**: Native camera integration to snap real-time photos of the parcel.
- **GPS Location**: Native location capture to verify exactly where the parcel was received.
- **Cloudinary Image Upload**: Images are uploaded directly to secure cloud storage instead of bloating the database.
- **MongoDB Storage**: Fast NoSQL data storage for all proof reports.
- **Proof Status & Timeline**: Visual UI tracking whether a proof is Submitted, In Progress, Resolved, or Closed.
- **Search & Filter**: Real-time frontend search by Order ID or Report ID, plus status filtering.
- **Clipboard**: Quick-copy Report IDs and coordinates.
- **Share**: Native OS sharing to send the proof report directly to a courier or seller via email/text.
- **Notifications**: Local device notifications confirming successful upload.
- **User-wise Proofs**: Backend security ensuring users can only see and modify their own proofs.
- **Permissions**: Graceful handling of Camera and Location permissions.
- **REST API**: Clean, structured Express backend.

## Tech Stack
**Frontend:**
- React Native
- Expo
- Expo Router

**Backend:**
- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Cloudinary / Multer

## Project Structure
```text
Delivery Chacker/
├── frontend/    # Expo React Native App
│   ├── app/         # Expo Router screens (index, login, proofs, etc.)
│   ├── components/  # Reusable UI components (StatusBadge)
│   └── services/    # API and Notification helpers
└── backend/     # Express Node.js Server
    ├── config/      # Database connection
    ├── controllers/ # Route logic (authController, proofController)
    ├── middleware/  # JWT Protection and Multer upload handling
    ├── models/      # Mongoose Schemas (User, Proof)
    └── routes/      # Express Router endpoints
```

## Installation

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in the `backend/` directory using this template:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/delivery chacker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For the frontend (if deploying), set `EXPO_PUBLIC_API_URL` to point to your live backend.

## API Routes
- `POST /api/auth/register`: Create a new user account and return a JWT.
- `POST /api/auth/login`: Authenticate an existing user and return a JWT.
- `POST /api/proofs`: Upload a new parcel proof (requires JWT and multipart/form-data for image).
- `GET /api/proofs`: Fetch all proofs belonging to the logged-in user.
- `GET /api/proofs/:id`: Fetch details of a specific proof.
- `PATCH /api/proofs/:id/status`: Update the status of a specific proof.
- `GET /api/health`: Check if the backend is running.

## Application Flow
Login
↓
Home
↓
Create Proof
↓
Camera
↓
Location
↓
Summary
↓
Submit
↓
My Proofs
↓
Proof Details

## Native Features Used
- **Camera**: Leverages `expo-camera` to capture live evidence instead of relying on easily faked gallery uploads.
- **Location**: Uses `expo-location` to retrieve exact latitude/longitude coordinates to prove delivery address.
- **Clipboard**: Uses `expo-clipboard` to allow users to easily copy Report IDs for customer service chats.
- **Share**: Uses React Native's `Share` API to generate a readable text summary of the proof for external apps.
- **Notifications**: Uses `expo-notifications` to trigger a local success alert after backend confirmation.
- **Permissions**: Dynamically asks for user consent only when a feature (Camera/Location) is actually opened.

## Backend Architecture
React Native App
↓ (fetch API via api.js)
REST API (JSON)
↓ 
Express Server
↓ (authMiddleware validates JWT)
Controllers (Logic & Validation)
↓
MongoDB (Stores text data & URL) / Cloudinary (Stores actual image file)

## Future Improvements
- Automatic parcel damage detection using AI image analysis.
- OCR scanning for Order IDs on shipping labels.
- Email/SMS automated claim generation to couriers.
- Courier API integration for real-time ticket creation.
- PDF proof report generation.
- Admin dashboard for support teams.
- Delivery tracking integration via Webhooks.

## Screenshots
*(Add screenshots here)*

## Author
Developed as a Full-Stack React Native Student Project.
