# Pot Green Nursery Management System with Plant Recognition

A comprehensive nursery management system with plant recognition capabilities, built using React, Node.js, and Flask. This system provides a complete solution for nursery management with an integrated plant recognition feature powered by machine learning.

## Project Structure

### Frontend (React + Vite)
- **Components**:
  - Public Panel with plant catalog, shopping cart, and recognition features
  - Admin Panel with dashboard, analytics, and management interfaces
  - User authentication (login/register)
  - Plant recognition interface with drag & drop functionality
  - Profile management for both admin and public users
- **Technologies**:
  - React 18 with Vite
  - React Router v7 for navigation
  - Tailwind CSS for styling
  - Context API for state management (Auth, Cart, Notifications)
  - Various UI libraries (MUI, SweetAlert2, React-Toastify)
  - Axios for API communication

### Backend (Node.js)
- **Features**:
  - User authentication and authorization with JWT
  - Order processing and management
  - Cart management
  - Plant inventory management
  - Admin controls and analytics
  - Service request handling
  - Plant recognition API proxy

- **API Endpoints**:
  - Auth:
    - POST `/api/web/auth/login` - User login
    - GET `/api/web/logout-id` - User logout
  
  - Users:
    - GET `/api/web/users/me` - Get current user profile
    - GET `/api/web/userdata` - Get user data
    - GET `/api/web/total-users` - Get total users count

  - Admin:
    - GET `/api/admin/plants` - Manage plants
    - GET `/api/admin/notifications` - Manage notifications

  - Cart:
    - GET `/api/cart` - Get user's cart
    - POST `/api/cart` - Add item to cart

  - Orders:
    - POST `/api/orders` - Create new order
    - GET `/api/orders` - Get orders

  - Plant Recognition:
    - POST `/api/web/plant-recognition/recognize` - Recognize plant from image

  - Services:
    - Various endpoints under `/api/web/services`

### Flask API (Plant Recognition)
- **Features**:
  - Plant image classification using TensorFlow
  - EfficientNet model for accurate predictions
  - Image preprocessing with OpenCV
  - RESTful API for integration with main application
- **Endpoints**:
  - POST `/predict` - Analyze plant image and return prediction

## Setup Instructions

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173

### Backend Setup
```bash
cd Backend
npm install
nodemon index
```
Backend will run on http://localhost:8020

### Flask API Setup
```bash
cd flask-api
pip install -r requirements.txt
python app.py
```
Flask API will run on http://localhost:9080

## 🔗 Flow Architecture

```
Frontend (React) → Backend (Node.js) → Python (Flask API)
     ↓                    ↓                    ↓
Plant Recognition → plants_names.json → plant_classifier.h5
```

## Important Notes
- Ensure all required dependencies are installed
- Configure environment variables properly in Backend/.env
- Make sure the machine learning model file (plant_classifier.h5) is present in the flask-api directory
- MongoDB Atlas is used as the database (connection string in Backend/index.js)
- Uploaded plant images are stored in Backend/uploads directory

## Features
- Plant recognition using machine learning with confidence scores
- Real-time inventory management with categories
- Order tracking and management system
- User authentication and role-based authorization
- Admin dashboard with business analytics
- Shopping cart functionality
- Service request management
- Responsive design for all devices
- Profile management for users
- Drag & drop image upload for plant recognition

## Tools Included

All necessary tools required for running the project are included in the `Tools` folder:

- `plant_classifier.h5` → Pre-trained TensorFlow model for plant recognition
- `plants_names.json` → Mapping file for plant labels
- `requirements.txt` → Python dependencies for Flask API
- `package.json` → Node.js dependencies for Backend
- `package-lock.json` → Lock file for Node.js dependencies

## Running the Project from USB

1. Copy the project folder from USB to your local machine.
2. Ensure Node.js and Python are installed.
3. Open terminal/command prompt in each folder (Frontend, Backend, Flask API) and follow the setup instructions above.
4. Make sure `Tools/plant_classifier.h5` is present in `flask-api` directory.
5. Run Frontend, Backend, and Flask API in the correct order.
6. Visit http://localhost:5173 in your browser to access the application.