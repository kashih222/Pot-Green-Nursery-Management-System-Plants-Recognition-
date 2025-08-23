# 🌿 Plant Recognition Setup Guide

This guide will help you set up the plant recognition feature in your Final Year Project.

## 🚀 Quick Start

### 1. Start the Flask API (Python)
```bash
cd "Final year project/flask-api"
python app.py
```
**Expected Output:** `✅ Model loaded successfully` and server running on port 9080

### 2. Start the Node.js Backend
```bash
cd "Final year project/Backend"
nodemon index
```
**Expected Output:** `🚀 Server running on http://localhost:8020`

### 3. Start the React Frontend
```bash
cd "Final year project/Frontend"
npm run dev
```
**Expected Output:** Server running on `http://localhost:5173`

## 🔗 Flow Architecture

```
Frontend (React) → Backend (Node.js) → Python (Flask API)
     ↓                    ↓                    ↓
Plant Recognition → plants_names.json → plant_classifier.h5
```

## 📁 Files Added/Modified

### Backend (Node.js)
- ✅ `plants_names.json` - Plant class names
- ✅ `App/Controllers/Web/plantRecognitionController.js` - Recognition logic
- ✅ `App/Routes/Web/plantRecognitionRoutes.js` - API routes
- ✅ `index.js` - Added recognition routes
- ✅ `package.json` - Added axios & form-data dependencies

### Frontend (React)
- ✅ `src/components/PUBLIC PANEL/Pages/Recognition/PlantRecognition.jsx` - Beautiful UI
- ✅ Added react-icons dependency

## 🎯 How to Test

1. Open your browser and go to `http://localhost:5173`
2. Navigate to the "Recognition" page
3. Upload a plant image (drag & drop or click to browse)
4. Click "Identify Plant"
5. View the results with confidence scores

## 🔧 Troubleshooting

### If Flask API fails to start:
- Make sure `plant_classifier.h5` exists in the flask-api folder
- Check if Python and required packages are installed
- Run: `pip install flask tensorflow opencv-python numpy`

### If Backend fails to start:
- Make sure all dependencies are installed: `npm install`
- Check if port 8020 is available
- Verify MongoDB connection

### If Frontend fails to start:
- Make sure all dependencies are installed: `npm install`
- Check if port 5173 is available

## 🌟 Features

- **Drag & Drop Upload**: Modern file upload interface
- **Real-time Preview**: See your image before analysis
- **Loading States**: Beautiful loading animations
- **Confidence Scores**: See how confident the AI is
- **Error Handling**: Graceful error messages
- **Responsive Design**: Works on all devices
- **Professional UI**: Modern, clean interface

## 📊 API Endpoints

- **POST** `/api/web/plant-recognition/recognize` - Upload and recognize plant image
- **GET** `/uploads/:filename` - Access uploaded images

## 🎨 UI Components

- Upload area with drag & drop
- Image preview with remove option
- Loading spinner during analysis
- Results display with confidence bar
- Error messages for failed uploads
- "How It Works" section
- Try again functionality

The plant recognition feature is now fully integrated into your Final Year Project! 🎉 