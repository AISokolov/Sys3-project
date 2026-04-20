import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import FormField from '../components/FormField/FormField';
import Modal from '../components/Modal/Modal';
import TopButton from '../components/TopButton/TopButton';
import { useAppContext } from '../context/AppContext';

function AccountPage() {
  const navigate = useNavigate();
  const { profile, subscriptionDetails, updateProfile, unsubscribe, logout, startCheckout } = useAppContext();
  const [values, setValues] = useState({
    email: profile.email,
    password: profile.password,
  });
  const [message, setMessage] = useState('');
  const [managedService, setManagedService] = useState(null);

  const handleSave = () => {
    updateProfile(values);
    setMessage('Profile updated locally.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <AppHeader
        title="My Profile"
        actions={
          <>
            <TopButton onClick={() => navigate('/main')}>Back to Services</TopButton>
            <TopButton variant="danger" onClick={handleLogout}>
              Log Out
            </TopButton>
          </>
        }
      />

      <div className="app-container page-content">
        <section className="profile-page__layout">
          <article className="section-card profile-page__panel">
            <div className="profile-page__form">
              <FormField label="Username" hint="Username is currently driven by your last login or sign-up action.">
                <input value={profile.username} disabled />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                />
              </FormField>
              <FormField label="Password">
                <input
                  type="text"
                  value={values.password}
                  onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                />
              </FormField>
              <TopButton variant="primary" onClick={handleSave}>
                Save Changes
              </TopButton>
              {message ? <p className="profile-page__saved">{message}</p> : null}
            </div>
          </article>

          <article className="section-card profile-page__panel">
            <h2 className="page-title">My Subscriptions</h2>
            <p className="page-subtitle">Every card here is navigable and managed without backend requests.</p>
            <div className="profile-page__grid">
              {subscriptionDetails.length > 0 ? (
                subscriptionDetails.map((service) => (
                  <div className="profile-service" key={service.id}>
                    {service.image ? <img src={service.image} alt="" /> : null}
                    <h3>{service.name}</h3>
                    <p>EUR {service.cost.toFixed(2)} per month</p>
                    <TopButton onClick={() => setManagedService(service)}>Manage</TopButton>
                  </div>
                ))
              ) : (
                <p className="profile-page__empty">
                  You do not have subscriptions yet. Go to the subscriptions page, click a service card, and finish the payment flow.
                </p>
              )}
            </div>
          </article>
        </section>
      </div>

      {managedService && (
        <Modal
          title={managedService.name}
          onClose={() => setManagedService(null)}
          footer={
            <>
              <TopButton
                onClick={() => {
                  startCheckout(managedService.id);
                  setManagedService(null);
                  navigate('/payment');
                }}
              >
                Update Payment
              </TopButton>
              <TopButton
                variant="danger"
                onClick={() => {
                  unsubscribe(managedService.id);
                  setManagedService(null);
                }}
              >
                Unsubscribe
              </TopButton>
            </>
          }
        >
          <p className="profile-manage__copy">
            This is now a true modal action instead of a panel appearing at the top of the page. You can keep the
            service, update payment details, or unsubscribe from it.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default AccountPage;
