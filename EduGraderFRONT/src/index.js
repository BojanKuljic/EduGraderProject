import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthContextProvider } from './components/auth/AuthContext';
import { Toaster } from 'react-hot-toast';

// Reset session only on first full page load 
const navEntry = performance.getEntriesByType("navigation")[0];
const isFirstLoad = navEntry?.type === "navigate";

if (isFirstLoad && window.location.hostname === "localhost") {
  console.log("First load - clearing session");
  sessionStorage.clear();
  localStorage.removeItem("authState");
}

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
