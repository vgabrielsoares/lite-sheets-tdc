import { renderHook, act } from '@testing-library/react';
import { useSidebar, useMultipleSidebars } from '../useSidebar';

describe('useSidebar', () => {
  it('deve inicializar com isOpen como false por padrão', () => {
    const { result } = renderHook(() => useSidebar());

    expect(result.current.isOpen).toBe(false);
  });

  it('deve inicializar com isOpen como true quando especificado', () => {
    const { result } = renderHook(() => useSidebar(true));

    expect(result.current.isOpen).toBe(true);
  });

  it('deve abrir a sidebar quando open() é chamado', () => {
    const { result } = renderHook(() => useSidebar());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('deve fechar a sidebar quando close() é chamado', () => {
    const { result } = renderHook(() => useSidebar(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('deve alternar o estado quando toggle() é chamado', () => {
    const { result } = renderHook(() => useSidebar());

    // Inicia fechado
    expect(result.current.isOpen).toBe(false);

    // Primeiro toggle - abre
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Segundo toggle - fecha
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('deve manter callbacks estáveis entre re-renders', () => {
    const { result, rerender } = renderHook(() => useSidebar());

    const initialOpen = result.current.open;
    const initialClose = result.current.close;
    const initialToggle = result.current.toggle;

    // Re-render
    rerender();

    // Callbacks devem ser os mesmos (referência)
    expect(result.current.open).toBe(initialOpen);
    expect(result.current.close).toBe(initialClose);
    expect(result.current.toggle).toBe(initialToggle);
  });
});

describe('useMultipleSidebars', () => {
  const sidebarIds = ['attributes', 'skills', 'inventory'];

  it('deve inicializar sem nenhuma sidebar aberta', () => {
    const { result } = renderHook(() => useMultipleSidebars(sidebarIds));

    expect(result.current.openSidebarId).toBeNull();
    expect(result.current.isOpen('attributes')).toBe(false);
    expect(result.current.isOpen('skills')).toBe(false);
    expect(result.current.isOpen('inventory')).toBe(false);
  });

  it('deve abrir uma sidebar específica', () => {
    const { result } = renderHook(() => useMultipleSidebars(sidebarIds));

    act(() => {
      result.current.open('attributes');
    });

    expect(result.current.openSidebarId).toBe('attributes');
    expect(result.current.isOpen('attributes')).toBe(true);
    expect(result.current.isOpen('skills')).toBe(false);
  });

  it('deve fechar a sidebar atualmente aberta', () => {
    const { result } = renderHook(() => useMultipleSidebars(sidebarIds));

    act(() => {
      result.current.open('skills');
    });

    expect(result.current.isOpen('skills')).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.openSidebarId).toBeNull();
    expect(result.current.isOpen('skills')).toBe(false);
  });

  it('deve abrir apenas uma sidebar por vez', () => {
    const { result } = renderHook(() => useMultipleSidebars(sidebarIds));

    // Abre 'attributes'
    act(() => {
      result.current.open('attributes');
    });
    expect(result.current.isOpen('attributes')).toBe(true);

    // Abre 'skills' - deve fechar 'attributes' automaticamente
    act(() => {
      result.current.open('skills');
    });
    expect(result.current.isOpen('attributes')).toBe(false);
    expect(result.current.isOpen('skills')).toBe(true);
  });

  it('deve emitir warning ao tentar abrir ID inválido', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { result } = renderHook(() => useMultipleSidebars(sidebarIds));

    act(() => {
      result.current.open('invalid-id');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Sidebar ID "invalid-id" não existe na lista de sidebars.'
    );
    expect(result.current.openSidebarId).toBeNull();

    consoleSpy.mockRestore();
  });

  it('deve manter callbacks estáveis entre re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useMultipleSidebars(sidebarIds)
    );

    const initialOpen = result.current.open;
    const initialClose = result.current.close;
    const initialIsOpen = result.current.isOpen;

    // Re-render
    rerender();

    // Callbacks devem ser os mesmos (referência)
    expect(result.current.open).toBe(initialOpen);
    expect(result.current.close).toBe(initialClose);
    expect(result.current.isOpen).toBe(initialIsOpen);
  });
});
