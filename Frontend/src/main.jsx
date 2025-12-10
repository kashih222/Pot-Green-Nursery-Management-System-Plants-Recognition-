import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AuthProvider } from "../src/components/auth/AuthContext.jsx";
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Speed Insights for performance monitoring
injectSpeedInsights();

createRoot(document.getElementById('root')).render(
   <AuthProvider>
   <BrowserRouter>
    <App />
   </BrowserRouter>
   </AuthProvider>
)
