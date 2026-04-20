import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import FormField from '../components/FormField/FormField';
import TopButton from '../components/TopButton/TopButton';
import { useAppContext } from '../context/AppContext';

function CheckoutPage() {
  const navigate = useNavigate();
  const { selectedService, savedPayment, completePayment } = useAppContext();
  const [values, setValues] = useState({
    cardHolder: savedPayment?.cardHolder || '',
    cardNumber: '',
    expiryDate: savedPayment?.expiryDate || '',
    cvv: '',
  });
  const [rememberCard, setRememberCard] = useState(Boolean(savedPayment));

  const service = selectedService;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!values.cardHolder.trim() || !values.cardNumber.trim() || !values.expiryDate.trim() || !values.cvv.trim()) {
      return;
    }

    completePayment(
      rememberCard
        ? {
            cardHolder: values.cardHolder.trim(),
            expiryDate: values.expiryDate.trim(),
            last4: values.cardNumber.slice(-4),
          }
        : null,
    );

    navigate('/profile');
  };

  const applySavedCard = () => {
    if (!savedPayment) {
      return;
    }

    setValues((current) => ({
      ...current,
      cardHolder: savedPayment.cardHolder,
      expiryDate: savedPayment.expiryDate,
      cardNumber: `**** **** **** ${savedPayment.last4}`,
    }));
  };

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
            {service?.image ? <img src={service.image} alt="" className="payment-page__service-image" /> : null}
            <h2 className="payment-page__service-name">{service?.name || 'Choose a service first'}</h2>
            <p className="payment-page__service-copy">
              {service?.description || 'Return to the subscriptions page, select a card, and continue to payment from the service modal.'}
            </p>
            {service ? <p className="payment-page__price">EUR {service.cost.toFixed(2)} per month</p> : null}

            {savedPayment ? (
              <div className="payment-page__saved">
                <p>
                  Saved card for <strong>{savedPayment.cardHolder}</strong> ending in <strong>{savedPayment.last4}</strong>.
                </p>
                <TopButton onClick={applySavedCard}>Use Saved Card</TopButton>
              </div>
            ) : null}
          </article>

          <article className="section-card payment-page__form">
            <form className="payment-page__form-inner" onSubmit={handleSubmit}>
              <FormField label="Card Holder">
                <input
                  value={values.cardHolder}
                  onChange={(event) => setValues((current) => ({ ...current, cardHolder: event.target.value }))}
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Card Number">
                <input
                  value={values.cardNumber}
                  onChange={(event) => setValues((current) => ({ ...current, cardNumber: event.target.value }))}
                  placeholder="1234 5678 9012 3456"
                />
              </FormField>
              <FormField label="Expiry Date">
                <input
                  value={values.expiryDate}
                  onChange={(event) => setValues((current) => ({ ...current, expiryDate: event.target.value }))}
                  placeholder="MM/YY"
                />
              </FormField>
              <FormField label="CVV">
                <input
                  type="password"
                  value={values.cvv}
                  onChange={(event) => setValues((current) => ({ ...current, cvv: event.target.value }))}
                  placeholder="123"
                />
              </FormField>

              <label className="payment-page__checkbox">
                <input
                  type="checkbox"
                  checked={rememberCard}
                  onChange={(event) => setRememberCard(event.target.checked)}
                />
                Remember this card locally in the frontend prototype
              </label>

              <TopButton variant="primary" type="submit">
                Complete Payment
              </TopButton>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}

export default CheckoutPage;
