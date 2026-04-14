import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

// Generate or retrieve persistent device ID for security linking
if (!localStorage.getItem('deviceId')) {
    const newDeviceId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('deviceId', newDeviceId);
}

const GOOGLE_CLIENT_ID = "85687079896-dnotmmkub1hltnc5ipo3ecmcerbdsrp2.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
