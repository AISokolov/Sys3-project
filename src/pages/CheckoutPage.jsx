import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import TopButton from '../components/TopButton/TopButton';

function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <div>
      <AppHeader
        title="Payment Details"
        actions={
          <>
            <TopButton onClick={() => navigate('/main')}>Back to Services</TopButton>
            <TopButton variant="primary" onClick={() => navigate('/profile')}>
              Go to Profile
            </TopButton>
          </>
        }
      />

      <div className="app-container page-content">
        <section className="payment-page__layout">
          <article className="section-card payment-page__summary">
            <h2 className="payment-page__service-name">Payment page comes later</h2>
            <p className="payment-page__service-copy">
              We paused this step on purpose so the landing page stays easy to understand while you build the first real backend connection.
            </p>
          </article>

          <article className="section-card payment-page__form">
            <div className="payment-page__form-inner">
              <p className="page-subtitle">Next we can create a simple payment form together when the landing page is finished.</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default CheckoutPage;
