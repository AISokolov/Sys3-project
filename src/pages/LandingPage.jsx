import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RootPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import FeatureCard from '../components/FeatureCard/FeatureCard';
import FormField from '../components/FormField/FormField';
import Modal from '../components/Modal/Modal';
import ServiceCard from '../components/ServiceCard/ServiceCard';
import TopButton from '../components/TopButton/TopButton';
import { useAppContext } from '../context/AppContext';
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
  const { login, signUp, services, isAuthenticated } = useAppContext();
  const [optionIndex, setOptionIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [loginValues, setLoginValues] = useState({ username: '', password: '' });
  const [signUpValues, setSignUpValues] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOptionIndex((currentIndex) => (currentIndex + 1) % rotatingOptions.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main');
    }
  }, [isAuthenticated, navigate]);

  const openModal = (type) => {
    setError('');
    setActiveModal(type);
  };

  const closeModal = () => {
    setError('');
    setActiveModal(null);
  };

  const handleLogin = () => {
    const result = login(loginValues);

    if (!result.success) {
      setError(result.message);
      return;
    }

    closeModal();
    navigate('/main');
  };

  const handleSignUp = () => {
    const result = signUp(signUpValues);

    if (!result.success) {
      setError(result.message);
      return;
    }

    closeModal();
    navigate('/main');
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
            <span className="landing-hero__pill">Frontend prototype mode</span>
            <h2 className="landing-hero__headline">
              Share your subscription expenses with <span className="landing-hero__accent">{rotatingOptions[optionIndex]}</span>
            </h2>
            <p className="landing-hero__text">
              Keep the current visual style, simplify the structure, and click through the whole app while the backend is
              temporarily out of the picture.
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
          <h2>Why this flow still works without the backend</h2>
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
            <p className="modal-form__message">Use any username and password to move through the frontend flow.</p>
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
            <p className="modal-form__message">This keeps the same idea as registration, but it now behaves like a centered modal.</p>
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
