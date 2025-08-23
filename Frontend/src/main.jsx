import React from "react";
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom";
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AuthProvider } from "../src/components/auth/AuthContext.jsx";


createRoot(document.getElementById('root')).render(
   <AuthProvider>
   <BrowserRouter>
    <App />
   </BrowserRouter>
   </AuthProvider>
)
