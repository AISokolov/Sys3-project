import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
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
  );
}

export default App;
