import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import TopButton from '../components/TopButton/TopButton';
import FormField from '../components/FormField/FormField';

function CheckoutPage() {
  const baseIp = import.meta.env.VITE_BASE_IP;
  const port = import.meta.env.VITE_BACKEND_PORT;
  const apiUrl = `http://${baseIp}:${port}`;

  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state;
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('new');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [rememberCard, setRememberCard] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSavedCards() {
      try {
        const response = await fetch(`${apiUrl}/payments/methods`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load saved cards.');
        }

        const data = await response.json();
        setSavedCards(data);
      } catch (loadError) {
        setError('Could not load saved cards.');
      }
    }

    loadSavedCards();
  }, [navigate]);

  function isUsingSavedCard() {
    return selectedCardId !== 'new';
  }

  async function saveCard() {
    if (isUsingSavedCard() || !rememberCard) {
      return;
    }

    const response = await fetch(`${apiUrl}/payments/methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        cardHolder,
        cardNumber,
        expirationDate,
      }),
    });

    if (response.status === 401) {
      navigate('/');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to save card.');
    }
  }

  function validatePaymentForm() {
    if (isUsingSavedCard()) {
      return true;
    }

    if (!cardHolder.trim() || !cardNumber.trim() || !expirationDate.trim()) {
      setError('Please fill in card holder, card number, and expiration date.');
      return false;
    }

    return true;
  }

  async function payAndFinish() {
    if (!paymentData) {
      setError('Payment data is missing. Please choose a service again.');
      return;
    }

    if (!validatePaymentForm()) {
      return;
    }

    try {
      setIsPaying(true);
      setError('');

      await saveCard();

      const paymentUrl = paymentData.paymentAction === 'renew'
        ? `${apiUrl}/profile/subscriptions/${paymentData.subId}/pay`
        : `${apiUrl}/groups/${paymentData.groupId}/join`;

      const response = await fetch(paymentUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to finish payment.');
      }

      navigate('/profile');
    } catch (paymentError) {
      setError('Payment failed. Please check the card details and try again.');
    } finally {
      setIsPaying(false);
    }
  }

  if (!paymentData) {
    return (
      <div>
        <AppHeader
          title="Payment Details"
          actions={<TopButton onClick={() => navigate('/main')}>Back to Services</TopButton>}
        />

        <div className="app-container page-content">
          <section className="section-card payment-page__form">
            <p className="page-subtitle">No payment selected. Please choose a service first.</p>
            <TopButton variant="primary" onClick={() => navigate('/main')}>
              Choose Service
            </TopButton>
          </section>
        </div>
      </div>
    );
  }

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
            {paymentData.serviceImage ? (
              <img src={paymentData.serviceImage} alt="" className="payment-page__service-image" />
            ) : null}
            <h2 className="payment-page__service-name">{paymentData.serviceName}</h2>
            <p className="payment-page__service-copy">
              {paymentData.paymentAction === 'renew'
                ? `You are renewing your payment for ${paymentData.groupName || 'this group'}.`
                : `You are joining to the group: ${paymentData.groupName || 'this group'}.`}
            </p>
            <p className="payment-page__price">EUR {Number(paymentData.serviceCost).toFixed(2)} per month</p>
          </article>

          <article className="section-card payment-page__form">
            <div className="payment-page__form-inner">
              <h3 className="payment-page__form-title">Choose payment method</h3>

              {savedCards.length > 0 ? (
                <div className="payment-page__saved">
                  <p>Saved cards</p>
                  {savedCards.map((card) => (
                    <label className="payment-page__radio" key={card.id}>
                      <input
                        type="radio"
                        name="payment-method"
                        checked={selectedCardId === String(card.id)}
                        onChange={() => setSelectedCardId(String(card.id))}
                      />
                      <span>
                        {card.cardHolder} - **** {card.cardLastFour} ({card.expirationDate})
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              <label className="payment-page__radio">
                <input
                  type="radio"
                  name="payment-method"
                  checked={selectedCardId === 'new'}
                  onChange={() => setSelectedCardId('new')}
                />
                <span>Use a new card</span>
              </label>

              {selectedCardId === 'new' ? (
                <>
                  <FormField label="Card holder">
                    <input
                      value={cardHolder}
                      onChange={(event) => setCardHolder(event.target.value)}
                      placeholder="Name Surname"
                    />
                  </FormField>
                  <FormField label="Card number" hint="Only the last 4 digits will be saved if you remember this card.">
                    <input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 1234 1234 1234"
                    />
                  </FormField>
                  <FormField label="Expiration date">
                    <input
                      value={expirationDate}
                      onChange={(event) => setExpirationDate(event.target.value)}
                      placeholder="12/28"
                    />
                  </FormField>
                  <label className="payment-page__checkbox">
                    <input
                      type="checkbox"
                      checked={rememberCard}
                      onChange={(event) => setRememberCard(event.target.checked)}
                    />
                    Remember card details
                  </label>
                </>
              ) : null}

              {error ? <p className="payment-page__error">{error}</p> : null}
              <TopButton variant="primary" onClick={payAndFinish} disabled={isPaying}>
                {isPaying ? 'Processing...' : paymentData.paymentAction === 'renew' ? 'Pay Renewal' : 'Pay and Join Group'}
              </TopButton>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default CheckoutPage;
