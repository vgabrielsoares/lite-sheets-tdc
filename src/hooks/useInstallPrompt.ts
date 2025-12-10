import { useState, useEffect } from 'react';

/**
 * Interface para o evento beforeinstallprompt
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Retorna um Promise que resolve com o choice do usuário
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Exibe o prompt de instalação
   */
  prompt(): Promise<void>;
}

/**
 * Hook para gerenciar o prompt de instalação PWA
 *
 * Detecta quando a aplicação pode ser instalada e fornece
 * métodos para exibir o prompt de instalação.
 *
 * Features:
 * - Detecta evento beforeinstallprompt
 * - Fornece método para exibir prompt
 * - Respeita preferência do usuário (não mostrar novamente)
 * - Detecta se app já está instalado
 * - SSR-safe
 *
 * @returns Objeto com estado e métodos de instalação
 *
 * @example
 * const { canInstall, isInstalled, promptInstall, dismissPrompt } = useInstallPrompt();
 *
 * if (canInstall && !isInstalled) {
 *   return (
 *     <button onClick={promptInstall}>
 *       Instalar App
 *     </button>
 *   );
 * }
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se está no navegador (SSR-safe)
    if (typeof window === 'undefined') return;

    // Verificar se usuário já dismissou o prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Verificar se app já está instalado
    // Via display-mode media query
    const checkIfInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore - iOS específico
        window.navigator.standalone === true;

      setIsInstalled(isStandalone);
    };

    checkIfInstalled();

    // Handler para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o prompt automático do navegador
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;

      // Armazenar o evento para usar depois
      setDeferredPrompt(promptEvent);
      setCanInstall(true);

      console.log('📱 PWA: Prompt de instalação disponível');
    };

    // Handler para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA: App instalado com sucesso');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);

      // Limpar preferência de dismiss ao instalar
      localStorage.removeItem('pwa-install-dismissed');
    };

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Exibe o prompt de instalação
   */
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('⚠️ PWA: Prompt de instalação não disponível');
      return false;
    }

    try {
      // Exibir o prompt
      await deferredPrompt.prompt();

      // Aguardar escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`📱 PWA: Usuário ${outcome} a instalação`);

      if (outcome === 'accepted') {
        // Limpar o prompt após instalação
        setDeferredPrompt(null);
        setCanInstall(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ PWA: Erro ao exibir prompt de instalação:', error);
      return false;
    }
  };

  /**
   * Dispensa o prompt e salva preferência
   */
  const dismissPrompt = () => {
    setIsDismissed(true);
    setCanInstall(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    console.log('🚫 PWA: Prompt dismissado pelo usuário');
  };

  /**
   * Reseta a preferência de dismiss (para testes)
   */
  const resetDismiss = () => {
    setIsDismissed(false);
    localStorage.removeItem('pwa-install-dismissed');
    // Recarregar para detectar prompt novamente
    if (deferredPrompt) {
      setCanInstall(true);
    }
  };

  return {
    /** Se a instalação está disponível */
    canInstall: canInstall && !isDismissed && !isInstalled,
    /** Se o app já está instalado */
    isInstalled,
    /** Se o usuário dismissou o prompt */
    isDismissed,
    /** Exibe o prompt de instalação */
    promptInstall,
    /** Dispensa o prompt permanentemente */
    dismissPrompt,
    /** Reseta preferência de dismiss (debug) */
    resetDismiss,
  };
}
