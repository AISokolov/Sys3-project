import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/main" element={<SubscriptionsPage />} />
            <Route path="/payment" element={<CheckoutPage />} />
            <Route path="/profile" element={<AccountPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
