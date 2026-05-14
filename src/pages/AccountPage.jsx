import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import TopButton from '../components/TopButton/TopButton';

function AccountPage() {
  const navigate = useNavigate();

  return (
    <div>
      <AppHeader
        title="My Profile"
        actions={
          <>
            <TopButton onClick={() => navigate('/main')}>Back to Services</TopButton>
            <TopButton variant="danger" onClick={() => navigate('/')}>
              Log Out
            </TopButton>
          </>
        }
      />

      <div className="app-container page-content">
        <section className="profile-page__layout">
          <article className="section-card profile-page__panel">
            <div className="profile-page__form">
              <h2 className="page-title">Profile page comes later</h2>
              <p className="page-subtitle">We will build profile details after the landing page and login flow are clear.</p>
            </div>
          </article>

          <article className="section-card profile-page__panel">
            <h2 className="page-title">Subscriptions summary comes later</h2>
            <p className="page-subtitle">For now, the project is focused on showing real services on the landing page and making the first user actions easy to follow.</p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
