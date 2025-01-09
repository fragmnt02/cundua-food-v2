import { useState, useEffect } from 'react';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('admin') === 'true');
  }, []);

  const handleUserIconClick = () => {
    const clicks = parseInt(localStorage.getItem('userIconClicks') || '0');
    const newClicks = clicks + 1;
    localStorage.setItem('userIconClicks', newClicks.toString());

    if (newClicks === 10) {
      localStorage.setItem('admin', 'true');
      setIsAdmin(true);
      alert('¡Ahora eres administrador!');
    }
  };

  return { isAdmin, handleUserIconClick };
};
