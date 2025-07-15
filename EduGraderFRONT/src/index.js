import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthContextProvider } from './components/auth/AuthContext';
import { Toaster } from 'react-hot-toast';

// 🔁 Resetuj sve pre nego se app učita
localStorage.removeItem("authState");
sessionStorage.removeItem("email");
sessionStorage.removeItem("role");

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
        <Toaster position="top-center" />
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
