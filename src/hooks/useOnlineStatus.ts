import { useState, useEffect } from 'react';

/**
 * Hook para detectar e monitorar o status de conexão online/offline
 *
 * @returns {boolean} true se online, false se offline
 *
 * @example
 * const isOnline = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <div>Você está offline</div>;
 * }
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Verificar status inicial
    setIsOnline(navigator.onLine);

    // Handlers para eventos de mudança de status
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Adicionar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
