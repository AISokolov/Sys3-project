import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import TopButton from '../components/TopButton/TopButton';

function SubscriptionsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <AppHeader
        title="Available Subscriptions"
        actions={
          <TopButton variant="primary" onClick={() => navigate('/profile')}>
            My Profile
          </TopButton>
        }
      />

      <div className="app-container page-content">
        <section className="section-card main-page__section">
          <div className="main-page__hero">
            <div>
              <h2 className="page-title">Subscriptions page comes next</h2>
              <p className="page-subtitle">
                We cleaned the project so you can finish the landing page first. When you are ready, we can build this page step by step.
              </p>
            </div>
            <div className="main-page__badge">Step 2</div>
          </div>
          <div className="section-card" style={{ marginTop: '1.5rem' }}>
            <p className="page-subtitle">Use the landing page to fetch services, show cards, and finish login and sign-up first.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
