import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import FormField from '../components/FormField/FormField';
import Modal from '../components/Modal/Modal';
import ServiceCard from '../components/ServiceCard/ServiceCard';
import TopButton from '../components/TopButton/TopButton';
import cashLogo from '../assets/images/cash.png';
import securityLogo from '../assets/images/cyber-security.png';
import meetingLogo from '../assets/images/meeting.png';
import doneLogo from '../assets/images/done.png';

const rotatingOptions = [
  'friends',
  'roommates',
  'family',
  'colleagues',
  'partners',
  'classmates',
  'teammates',
  'neighbors',
];

const features = [
  {
    title: 'Easy Expense Splitting',
    icon: cashLogo,
    description: 'Keep the same simple flow while making it easier to plan who pays for what.',
  },
  {
    title: 'Track Everything',
    icon: doneLogo,
    description: 'See your subscriptions in one clean dashboard without waiting for backend data.',
  },
  {
    title: 'Share Smoothly',
    icon: meetingLogo,
    description: 'Navigate through the interface and prepare your groups before the backend returns.',
  },
  {
    title: 'Private by Default',
    icon: securityLogo,
    description: 'Your current prototype stores only local frontend state in this browser session.',
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [optionIndex, setOptionIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [loginValues, setLoginValues] = useState({ username: '', password: '' });
  const [signUpValues, setSignUpValues] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOptionIndex((currentIndex) => (currentIndex + 1) % rotatingOptions.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('http://localhost:3001/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services.');
        }
        const backendServices = await response.json();
        setServices(backendServices);
      } catch (fetchError) {
        setServices([]);
      }
    }

    loadServices();
  }, []);

  async function handleLogin() {
    if (!loginValues.username.trim() || !loginValues.password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: loginValues.username,
          password: loginValues.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      closeModal();
      navigate('/main');
    } catch (error) {
      setError(error.message || 'Could not connect to the server.');
    }
  }

  async function handleSignUp() {
    if (!signUpValues.username.trim() || !signUpValues.email.trim() || !signUpValues.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: signUpValues.username,
          email: signUpValues.email,
          password: signUpValues.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      closeModal();
      navigate('/main');
    } catch (error) {
      setError(error.message || 'Could not connect to the server.');
    }
  }


  const openModal = (type) => {
    setError('');
    setActiveModal(type);
  };

  const closeModal = () => {
    setError('');
    setActiveModal(null);
  };
  return (
    <div className="landing-page">
      <AppHeader
        title="Share subscription costs with zero hussle"
        actions={<TopButton onClick={() => openModal('login')}>Login</TopButton>}
      />

      <div className="app-container page-content">
        <section className="landing-hero">
          <div className="landing-hero__copy section-card">
            <span className="landing-hero__pill">Share subscriptions together</span>
            <h2 className="landing-hero__headline">
              Share your subscription expenses with <span className="landing-hero__accent">{rotatingOptions[optionIndex]}</span>
            </h2>
            <p className="landing-hero__text">
              Find a service, create your account, and start organizing shared subscription costs in one place.
            </p>
            <div>
              <TopButton variant="primary" onClick={() => openModal('signup')}>
                Start Exploring
              </TopButton>
            </div>
          </div>

          <div className="landing-hero__services section-card">
            <h2>Supported Services</h2>
            <div className="landing-services-grid">
              {services.slice(0, 4).map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.name}
                  price={service.cost}
                  image={service.image}
                  onClick={() => openModal('signup')}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="landing-features section-card">
          <h2>Why Split Helps</h2>
          <div className="landing-features__grid">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>
      </div>

      {activeModal === 'login' && (
        <Modal
          title="Login"
          onClose={closeModal}
          footer={<TopButton variant="primary" onClick={handleLogin}>Continue</TopButton>}
        >
          <div className="modal-form">
            <p className="modal-form__message">Sign in to continue to your subscriptions.</p>
            <FormField label="Username">
              <input
                value={loginValues.username}
                onChange={(event) => setLoginValues((current) => ({ ...current, username: event.target.value }))}
                placeholder="Enter your username"
              />
            </FormField>
            <FormField label="Password">
              <input
                type="password"
                value={loginValues.password}
                onChange={(event) => setLoginValues((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter your password"
              />
            </FormField>
            {error ? <p className="modal-form__error">{error}</p> : null}
          </div>
        </Modal>
      )}

      {activeModal === 'signup' && (
        <Modal
          title="Create account"
          onClose={closeModal}
          footer={<TopButton variant="primary" onClick={handleSignUp}>Create Account</TopButton>}
        >
          <div className="modal-form">
            <p className="modal-form__message">Create your account to get started.</p>
            <FormField label="Username">
              <input
                value={signUpValues.username}
                onChange={(event) => setSignUpValues((current) => ({ ...current, username: event.target.value }))}
                placeholder="Choose a username"
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={signUpValues.email}
                onChange={(event) => setSignUpValues((current) => ({ ...current, email: event.target.value }))}
                placeholder="Enter your email"
              />
            </FormField>
            <FormField label="Password">
              <input
                type="password"
                value={signUpValues.password}
                onChange={(event) => setSignUpValues((current) => ({ ...current, password: event.target.value }))}
                placeholder="Create a password"
              />
            </FormField>
            {error ? <p className="modal-form__error">{error}</p> : null}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default LandingPage;
