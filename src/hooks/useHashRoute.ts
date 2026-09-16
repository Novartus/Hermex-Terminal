import { useState, useEffect } from 'react';

export function useHashRoute(defaultView: 'WELCOME' | 'DASHBOARD' = 'WELCOME') {
  const getInitialView = (): 'WELCOME' | 'DASHBOARD' => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('dashboard')) return 'DASHBOARD';
    if (hash === '#/' || hash === '' || hash === '#') return 'WELCOME';
    const saved = localStorage.getItem('hermex_active_view') || localStorage.getItem('fintrack_active_view');
    return (saved === 'DASHBOARD' || saved === 'WELCOME') ? saved : defaultView;
  };

  const [currentView, setCurrentView] = useState<'WELCOME' | 'DASHBOARD'>(getInitialView);

  // Sync state to URL hash and localStorage
  useEffect(() => {
    localStorage.setItem('hermex_active_view', currentView);
    const targetHash = currentView === 'DASHBOARD' ? '#/dashboard' : '#/';
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [currentView]);

  // Sync URL hash changes (back/forward) to state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('dashboard')) {
        setCurrentView('DASHBOARD');
      } else {
        setCurrentView('WELCOME');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDashboard = () => {
    window.location.hash = '#/dashboard';
    setCurrentView('DASHBOARD');
  };

  const navigateToWelcome = () => {
    window.location.hash = '#/';
    setCurrentView('WELCOME');
  };

  return {
    currentView,
    navigateToDashboard,
    navigateToWelcome,
  };
}
