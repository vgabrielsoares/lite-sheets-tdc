import { renderHook, act, waitFor } from '@testing-library/react';
import { useInstallPrompt } from '../useInstallPrompt';

describe('useInstallPrompt', () => {
  let beforeInstallPromptEvent: Event;
  let promptSpy: jest.Mock;
  let userChoicePromise: Promise<{ outcome: string; platform: string }>;

  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();

    // Mock do evento beforeinstallprompt
    promptSpy = jest.fn();
    userChoicePromise = Promise.resolve({
      outcome: 'accepted',
      platform: 'web',
    });

    beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.assign(beforeInstallPromptEvent, {
      prompt: promptSpy,
      userChoice: userChoicePromise,
    });

    // Mock do matchMedia para detectar standalone mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock do navigator.standalone (iOS)
    Object.defineProperty(window.navigator, 'standalone', {
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    it('deve iniciar com canInstall false', () => {
      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.canInstall).toBe(false);
      expect(result.current.isInstalled).toBe(false);
      expect(result.current.isDismissed).toBe(false);
    });

    it('deve detectar se app já está instalado via display-mode', () => {
      // Mock standalone mode
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isInstalled).toBe(true);
    });

    it('deve detectar se app já está instalado via iOS standalone', () => {
      Object.defineProperty(window.navigator, 'standalone', {
        writable: true,
        value: true,
      });

      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isInstalled).toBe(true);
    });

    it('deve carregar preferência de dismiss do localStorage', () => {
      localStorage.setItem('pwa-install-dismissed', 'true');

      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isDismissed).toBe(true);
    });
  });

  describe('Evento beforeinstallprompt', () => {
    it('deve detectar quando instalação está disponível', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(true);
      });
    });

    it('não deve mostrar prompt se usuário já dismissou', async () => {
      localStorage.setItem('pwa-install-dismissed', 'true');

      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(false);
      });
    });

    it('não deve mostrar prompt se app já está instalado', async () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(false);
      });
    });
  });

  describe('promptInstall', () => {
    it('deve exibir prompt e retornar true quando aceito', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(true);
      });

      let installResult: boolean = false;

      await act(async () => {
        installResult = await result.current.promptInstall();
      });

      expect(promptSpy).toHaveBeenCalled();
      expect(installResult).toBe(true);
      expect(result.current.canInstall).toBe(false);
    });

    it('deve retornar false quando usuário recusa', async () => {
      userChoicePromise = Promise.resolve({
        outcome: 'dismissed',
        platform: 'web',
      });

      beforeInstallPromptEvent = new Event('beforeinstallprompt');
      Object.assign(beforeInstallPromptEvent, {
        prompt: promptSpy,
        userChoice: userChoicePromise,
      });

      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(true);
      });

      let installResult: boolean = true;

      await act(async () => {
        installResult = await result.current.promptInstall();
      });

      expect(promptSpy).toHaveBeenCalled();
      expect(installResult).toBe(false);
    });

    it('deve retornar false se prompt não está disponível', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      let installResult: boolean = true;

      await act(async () => {
        installResult = await result.current.promptInstall();
      });

      expect(promptSpy).not.toHaveBeenCalled();
      expect(installResult).toBe(false);
    });
  });

  describe('dismissPrompt', () => {
    it('deve salvar preferência no localStorage', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(true);
      });

      act(() => {
        result.current.dismissPrompt();
      });

      expect(localStorage.getItem('pwa-install-dismissed')).toBe('true');
      expect(result.current.isDismissed).toBe(true);
      expect(result.current.canInstall).toBe(false);
    });
  });

  describe('resetDismiss', () => {
    it('deve limpar preferência do localStorage', () => {
      localStorage.setItem('pwa-install-dismissed', 'true');

      const { result } = renderHook(() => useInstallPrompt());

      expect(result.current.isDismissed).toBe(true);

      act(() => {
        result.current.resetDismiss();
      });

      expect(localStorage.getItem('pwa-install-dismissed')).toBeNull();
      expect(result.current.isDismissed).toBe(false);
    });
  });

  describe('Evento appinstalled', () => {
    it('deve atualizar estado quando app é instalado', async () => {
      const { result } = renderHook(() => useInstallPrompt());

      act(() => {
        window.dispatchEvent(beforeInstallPromptEvent);
      });

      await waitFor(() => {
        expect(result.current.canInstall).toBe(true);
      });

      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      });

      await waitFor(() => {
        expect(result.current.isInstalled).toBe(true);
        expect(result.current.canInstall).toBe(false);
      });

      expect(localStorage.getItem('pwa-install-dismissed')).toBeNull();
    });
  });
});
