import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import netflixLogo from '../assets/images/Logonetflix.png';
import spotifyLogo from '../assets/images/spotify.png';
import youtubeLogo from '../assets/images/youtube.png';
import deezerLogo from '../assets/images/Deezer.png';
import appleMusicLogo from '../assets/images/applemusic.png';
import googlePlayPassLogo from '../assets/images/googlePlayPass.png';

const STORAGE_KEY = 'split-app-frontend-state';

const defaultServices = [
  {
    id: 'netflix',
    name: 'Netflix Premium',
    cost: 14.99,
    description: 'A premium streaming plan for shared movie nights and weekend binges.',
    image: netflixLogo,
  },
  {
    id: 'spotify',
    name: 'Spotify Family',
    cost: 11.49,
    description: 'Music for the whole crew with a shared plan and private playlists.',
    image: spotifyLogo,
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    cost: 8.99,
    description: 'Ad-free video and background playback for your everyday routines.',
    image: youtubeLogo,
  },
  {
    id: 'deezer',
    name: 'Deezer Duo',
    cost: 7.49,
    description: 'A compact music subscription that fits two listeners perfectly.',
    image: deezerLogo,
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    cost: 10.99,
    description: 'Lossless listening, curated playlists, and a polished shared experience.',
    image: appleMusicLogo,
  },
  {
    id: 'google-play-pass',
    name: 'Google Play Pass',
    cost: 5.49,
    description: 'Premium games and apps in one bundle without extra purchases.',
    image: googlePlayPassLogo,
  },
];

const defaultProfile = {
  username: 'Alex',
  email: 'alex@example.com',
  password: 'password123',
};

const defaultState = {
  isAuthenticated: false,
  profile: defaultProfile,
  services: defaultServices,
  subscriptions: ['spotify', 'youtube'],
  selectedServiceId: 'spotify',
  savedPayment: null,
};

const AppContext = createContext(null);

function getInitialState() {
  const savedState = window.localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(savedState);
    return {
      ...defaultState,
      ...parsed,
      profile: {
        ...defaultProfile,
        ...parsed.profile,
      },
      services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : defaultServices,
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : defaultState.subscriptions,
    };
  } catch (error) {
    return defaultState;
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const servicesById = state.services.reduce((accumulator, service) => {
      accumulator[service.id] = service;
      return accumulator;
    }, {});

    const subscriptionDetails = state.subscriptions
      .map((serviceId) => servicesById[serviceId])
      .filter(Boolean);

    const login = ({ username, password }) => {
      const hasCredentials = username.trim() && password.trim();

      if (!hasCredentials) {
        return { success: false, message: 'Please enter both username and password.' };
      }

      setState((currentState) => ({
        ...currentState,
        isAuthenticated: true,
        profile: {
          ...currentState.profile,
          username: username.trim(),
        },
      }));

      return { success: true };
    };

    const signUp = ({ username, email, password }) => {
      if (!username.trim() || !email.trim() || !password.trim()) {
        return { success: false, message: 'Please fill in every field.' };
      }

      setState((currentState) => ({
        ...currentState,
        isAuthenticated: true,
        profile: {
          username: username.trim(),
          email: email.trim(),
          password,
        },
      }));

      return { success: true };
    };

    const logout = () => {
      setState((currentState) => ({
        ...currentState,
        isAuthenticated: false,
      }));
    };

    const updateProfile = ({ email, password }) => {
      setState((currentState) => ({
        ...currentState,
        profile: {
          ...currentState.profile,
          email,
          password,
        },
      }));
    };

    const addService = (service) => {
      setState((currentState) => ({
        ...currentState,
        services: [service, ...currentState.services],
      }));
    };

    const selectService = (serviceId) => {
      setState((currentState) => ({
        ...currentState,
        selectedServiceId: serviceId,
      }));
    };

    const startCheckout = (serviceId) => {
      setState((currentState) => ({
        ...currentState,
        selectedServiceId: serviceId,
      }));
    };

    const completePayment = (paymentDetails) => {
      setState((currentState) => {
        const alreadySubscribed = currentState.subscriptions.includes(currentState.selectedServiceId);

        return {
          ...currentState,
          subscriptions: alreadySubscribed
            ? currentState.subscriptions
            : [...currentState.subscriptions, currentState.selectedServiceId],
          savedPayment: paymentDetails,
        };
      });
    };

    const unsubscribe = (serviceId) => {
      setState((currentState) => ({
        ...currentState,
        subscriptions: currentState.subscriptions.filter((id) => id !== serviceId),
      }));
    };

    return {
      ...state,
      selectedService: state.services.find((service) => service.id === state.selectedServiceId) || null,
      subscriptionDetails,
      login,
      signUp,
      logout,
      updateProfile,
      addService,
      selectService,
      startCheckout,
      completePayment,
      unsubscribe,
      isSubscribed: (serviceId) => state.subscriptions.includes(serviceId),
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}
