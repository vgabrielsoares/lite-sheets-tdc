/**
 * Tests for MovementDisplay component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MovementDisplay } from '../MovementDisplay';
import type { MovementType } from '@/types';

describe('MovementDisplay', () => {
  const defaultMovement: Record<MovementType, number> = {
    andando: 9,
    voando: 0,
    escalando: 0,
    escavando: 0,
    nadando: 0,
  };

  const defaultProps = {
    movement: defaultMovement,
    onMovementChange: jest.fn(),
    editable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<MovementDisplay {...defaultProps} />);

    expect(screen.getByText('Deslocamento')).toBeInTheDocument();
    // Use getAllByText since "9" appears in multiple places
    const nines = screen.getAllByText('9');
    expect(nines.length).toBeGreaterThan(0);
  });

  it('displays primary movement (walking) prominently', () => {
    render(<MovementDisplay {...defaultProps} />);

    // Primary movement should be displayed in large text - use getAllByText
    const nines = screen.getAllByText('9');
    expect(nines.length).toBeGreaterThan(0);
  });

  it('displays secondary movements when they exist', () => {
    const movementWithSecondary: Record<MovementType, number> = {
      andando: 9,
      voando: 12,
      escalando: 6,
      escavando: 0,
      nadando: 6,
    };

    const props = {
      ...defaultProps,
      movement: movementWithSecondary,
    };

    render(<MovementDisplay {...props} />);

    // Use getAllByText since labels appear in both sections
    expect(screen.getAllByText(/Voando:/)).toBeTruthy();
    expect(screen.getAllByText(/Escalando:/)).toBeTruthy();
    expect(screen.getAllByText(/Nadando:/)).toBeTruthy();
  });

  it('does not display zero secondary movements in summary', () => {
    render(<MovementDisplay {...defaultProps} />);

    // Should not show "Outros Deslocamentos" section if all secondary are 0
    expect(screen.queryByText('Outros Deslocamentos:')).not.toBeInTheDocument();
  });

  it('shows all movement types in edit mode', () => {
    render(<MovementDisplay {...defaultProps} />);

    expect(
      screen.getByText('Configurar Todos os Deslocamentos:')
    ).toBeInTheDocument();
    expect(screen.getByText('Andando:')).toBeInTheDocument();
    expect(screen.getByText('Voando:')).toBeInTheDocument();
    expect(screen.getByText('Escalando:')).toBeInTheDocument();
    expect(screen.getByText('Escavando:')).toBeInTheDocument();
    expect(screen.getByText('Nadando:')).toBeInTheDocument();
  });

  it('does not show edit fields in non-editable mode', () => {
    const props = {
      ...defaultProps,
      editable: false,
    };

    render(<MovementDisplay {...props} />);

    expect(
      screen.queryByText('Configurar Todos os Deslocamentos:')
    ).not.toBeInTheDocument();
  });

  it('handles zero movement correctly', () => {
    const zeroMovement: Record<MovementType, number> = {
      andando: 0,
      voando: 0,
      escalando: 0,
      escavando: 0,
      nadando: 0,
    };

    const props = {
      ...defaultProps,
      movement: zeroMovement,
    };

    render(<MovementDisplay {...props} />);

    // Use getAllByText since "0" appears multiple times
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('displays multiple secondary movements correctly', () => {
    const multipleMovement: Record<MovementType, number> = {
      andando: 9,
      voando: 18,
      escalando: 6,
      escavando: 3,
      nadando: 12,
    };

    const props = {
      ...defaultProps,
      movement: multipleMovement,
    };

    render(<MovementDisplay {...props} />);

    // Should show "Outros Deslocamentos" section
    expect(screen.getByText('Outros Deslocamentos:')).toBeInTheDocument();

    // Should show all non-zero secondary movements (use getAllByText for duplicates)
    expect(screen.getAllByText(/Voando:/)).toBeTruthy();
    expect(screen.getAllByText(/Escalando:/)).toBeTruthy();
    expect(screen.getAllByText(/Escavando:/)).toBeTruthy();
    expect(screen.getAllByText(/Nadando:/)).toBeTruthy();
  });

  it('shows correct units (meters)', () => {
    render(<MovementDisplay {...defaultProps} />);

    // Should show 'm' unit multiple times
    const meterUnits = screen.getAllByText('m');
    expect(meterUnits.length).toBeGreaterThan(0);
  });

  it('handles high movement values', () => {
    const highMovement: Record<MovementType, number> = {
      andando: 50,
      voando: 100,
      escalando: 0,
      escavando: 0,
      nadando: 0,
    };

    const props = {
      ...defaultProps,
      movement: highMovement,
    };

    render(<MovementDisplay {...props} />);

    // Use getAllByText since "50" appears in multiple places
    const fifties = screen.getAllByText('50');
    expect(fifties.length).toBeGreaterThan(0);
  });

  it('displays tooltip with movement information', () => {
    const { container } = render(<MovementDisplay {...defaultProps} />);

    // Should have info icon with tooltip
    const infoIcon = container.querySelector('[data-testid="InfoIcon"]');
    expect(infoIcon).toBeTruthy();
  });

  it('renders with only flying movement', () => {
    const flyingOnly: Record<MovementType, number> = {
      andando: 0,
      voando: 12,
      escalando: 0,
      escavando: 0,
      nadando: 0,
    };

    const props = {
      ...defaultProps,
      movement: flyingOnly,
    };

    render(<MovementDisplay {...props} />);

    // Primary (walking) should be 0 - use getAllByText since appears multiple times
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);

    // Flying should be in secondary - use getAllByText
    expect(screen.getAllByText(/Voando:/)).toBeTruthy();
  });

  it('uses correct movement type labels in Portuguese', () => {
    const allMovement: Record<MovementType, number> = {
      andando: 9,
      voando: 12,
      escalando: 6,
      escavando: 3,
      nadando: 9,
    };

    const props = {
      ...defaultProps,
      movement: allMovement,
    };

    render(<MovementDisplay {...props} />);

    // Check all Portuguese labels exist - use getAllByText since they appear in multiple sections
    expect(screen.getAllByText(/Andando:/)).toBeTruthy();
    expect(screen.getAllByText(/Voando:/)).toBeTruthy();
    expect(screen.getAllByText(/Escalando:/)).toBeTruthy();
    expect(screen.getAllByText(/Escavando:/)).toBeTruthy();
    expect(screen.getAllByText(/Nadando:/)).toBeTruthy();
  });
});
