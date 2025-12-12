import { useState, useCallback } from 'react';

/**
 * Estado do hook useSidebar
 */
export interface UseSidebarState {
  /**
   * Indica se a sidebar está aberta
   */
  isOpen: boolean;

  /**
   * Abre a sidebar
   */
  open: () => void;

  /**
   * Fecha a sidebar
   */
  close: () => void;

  /**
   * Alterna entre abrir e fechar a sidebar
   */
  toggle: () => void;
}

/**
 * Custom hook para gerenciar estado da Sidebar
 *
 * Fornece controle simples de abertura/fechamento da sidebar
 * com callbacks memoizados para evitar re-renders desnecessários.
 *
 * @param initialOpen - Estado inicial da sidebar (padrão: false)
 * @returns Objeto com estado e métodos de controle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const sidebar = useSidebar();
 *
 *   return (
 *     <>
 *       <button onClick={sidebar.open}>Ver Detalhes</button>
 *       <Sidebar open={sidebar.isOpen} onClose={sidebar.close}>
 *         <p>Conteúdo aqui</p>
 *       </Sidebar>
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * Com estado inicial aberto:
 * ```tsx
 * const sidebar = useSidebar(true);
 * ```
 */
export function useSidebar(initialOpen = false): UseSidebarState {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  /**
   * Abre a sidebar
   */
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Fecha a sidebar
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Alterna o estado da sidebar
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook avançado para gerenciar múltiplas sidebars
 *
 * Útil quando você tem várias sidebars na mesma página
 * e precisa garantir que apenas uma esteja aberta por vez.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const sidebars = useMultipleSidebars(['attributes', 'skills', 'inventory']);
 *
 *   return (
 *     <>
 *       <button onClick={() => sidebars.open('attributes')}>Atributos</button>
 *       <button onClick={() => sidebars.open('skills')}>Habilidades</button>
 *
 *       <Sidebar
 *         open={sidebars.isOpen('attributes')}
 *         onClose={sidebars.close}
 *       >
 *         Detalhes dos atributos
 *       </Sidebar>
 *
 *       <Sidebar
 *         open={sidebars.isOpen('skills')}
 *         onClose={sidebars.close}
 *       >
 *         Detalhes das habilidades
 *       </Sidebar>
 *     </>
 *   );
 * }
 * ```
 */
export interface UseMultipleSidebarsState {
  /**
   * ID da sidebar atualmente aberta (ou null se nenhuma estiver aberta)
   */
  openSidebarId: string | null;

  /**
   * Abre uma sidebar específica (fecha as outras automaticamente)
   */
  open: (id: string) => void;

  /**
   * Fecha a sidebar atualmente aberta
   */
  close: () => void;

  /**
   * Verifica se uma sidebar específica está aberta
   */
  isOpen: (id: string) => boolean;
}

/**
 * Hook para gerenciar múltiplas sidebars
 *
 * @param sidebarIds - Array com IDs das sidebars
 * @returns Objeto com estado e métodos de controle
 */
export function useMultipleSidebars(
  sidebarIds: string[]
): UseMultipleSidebarsState {
  const [openSidebarId, setOpenSidebarId] = useState<string | null>(null);

  /**
   * Abre uma sidebar específica
   */
  const open = useCallback(
    (id: string) => {
      if (sidebarIds.includes(id)) {
        setOpenSidebarId(id);
      } else {
        console.warn(`Sidebar ID "${id}" não existe na lista de sidebars.`);
      }
    },
    [sidebarIds]
  );

  /**
   * Fecha a sidebar atualmente aberta
   */
  const close = useCallback(() => {
    setOpenSidebarId(null);
  }, []);

  /**
   * Verifica se uma sidebar específica está aberta
   */
  const isOpen = useCallback(
    (id: string) => {
      return openSidebarId === id;
    },
    [openSidebarId]
  );

  return {
    openSidebarId,
    open,
    close,
    isOpen,
  };
}
