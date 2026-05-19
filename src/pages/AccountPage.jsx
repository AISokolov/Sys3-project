import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import TopButton from '../components/TopButton/TopButton';
import FormField from '../components/FormField/FormField';
import Modal from '../components/Modal/Modal';

function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);
  const [managedService, setManagedService] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('http://localhost:3001/profile', {
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load profile.');
        }

        const data = await response.json();
        const loadedProfile = {
          id: data.id || data.u_id,
          username: data.username || data.user_name || '',
          email: data.email || '',
        };

        setProfile(loadedProfile);
        setUsername(loadedProfile.username);
        setEmail(loadedProfile.email);
        getSubscriptionDetails();
      } catch (loadError) {
        setError('Could not load profile data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  async function handleLogout() {
    try {
      const response = await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      } else {
        setError('Logout failed.');
      }
    } catch (logoutError) {
      setError('Logout failed.');
    }
  }

  async function handleUpdateProfile() {
    try {
      setError('');
      setMessage('');

      const response = await fetch('http://localhost:3001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setUsername(updatedProfile.username || '');
      setEmail(updatedProfile.email || '');
      setPassword('');
      setMessage('Profile updated successfully.');
    } catch (updateError) {
      setError('Failed to update profile.');
    }
  }

  async function getSubscriptionDetails() {
    try {
      const response = await fetch('http://localhost:3001/profile/subscriptions', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load subscriptions.');
      }

      const data = await response.json();
      setSubscriptionDetails(data);
    } catch (subscriptionsError) {
      setError('Could not load subscription details.');
    }
  }

  async function unsubscribe(subId) {
    try {
      const response = await fetch(`http://localhost:3001/profile/subscriptions/${subId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe.');
      }

      setSubscriptionDetails((prevDetails) => prevDetails.filter((service) => service.id !== subId));
      setManagedService(null);
      setMessage('Subscription removed.');
    } catch (unsubscribeError) {
      setError('Failed to unsubscribe from the service.');
    }
  }

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
            <h2 className="page-title">Account Details</h2>
            {isLoading ? <p className="profile-page__empty">Loading profile...</p> : null}
            {error ? <p className="profile-page__error">{error}</p> : null}
            {message ? <p className="profile-page__saved">{message}</p> : null}

            {!isLoading && profile ? (
              <div className="profile-page__form">
                <FormField label="Username">
                  <input value={username} onChange={(event) => setUsername(event.target.value)} />
                </FormField>
                <FormField label="Email">
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </FormField>
                <FormField label="New password" hint="Leave it empty if you do not want to change it.">
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </FormField>
                <TopButton variant="primary" onClick={handleUpdateProfile}>
                  Save
                </TopButton>
              </div>
            ) : null}
          </article>

          <article className="section-card profile-page__panel">
            <h2 className="page-title" style={{ marginBottom: '24px' }}>My Subscriptions</h2>
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
                variant="danger"
                onClick={async () => {
                  await unsubscribe(managedService.id);
                }}
              >
                Unsubscribe
              </TopButton>
            </>
          }
        >
          <div className="modal-service-details">
            <p>{managedService.description}</p>
            <p>EUR {managedService.cost.toFixed(2)} per month</p>
            <p>Next billing date: {new Date(managedService.billingDate).toLocaleDateString()}</p>
          </div>
        </Modal>
      )}
    </div >
  );
}

export default AccountPage;
