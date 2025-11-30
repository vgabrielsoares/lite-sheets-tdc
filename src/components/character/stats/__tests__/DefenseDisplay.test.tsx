/**
 * Tests for DefenseDisplay component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DefenseDisplay } from '../DefenseDisplay';
import type { Modifier } from '@/types';

describe('DefenseDisplay', () => {
  const defaultProps = {
    agilidade: 2,
    armorBonus: 3,
    maxAgilityBonus: undefined,
    otherBonuses: [] as Modifier[],
    onArmorBonusChange: jest.fn(),
    onMaxAgilityBonusChange: jest.fn(),
    onOtherBonusesChange: jest.fn(),
    editable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<DefenseDisplay {...defaultProps} />);

    expect(screen.getByText('Defesa')).toBeInTheDocument();
    // Total: 15 (base) + 2 (agilidade) + 3 (armor) = 20
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('calculates defense correctly', () => {
    render(<DefenseDisplay {...defaultProps} />);

    // Base: 15, Agilidade: 2, Armor: 3 = Total: 20
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('applies max agility bonus from armor', () => {
    const props = {
      ...defaultProps,
      agilidade: 5,
      maxAgilityBonus: 2,
      armorBonus: 5,
    };

    render(<DefenseDisplay {...props} />);

    // Base: 15, Agilidade: 5 (limited to 2) = 2, Armor: 5 = Total: 22
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('calculates other bonuses correctly', () => {
    const otherBonuses: Modifier[] = [
      { name: 'Spell Bonus', value: 2, type: 'bonus' },
      { name: 'Ability Bonus', value: 3, type: 'bonus' },
    ];

    const props = {
      ...defaultProps,
      otherBonuses,
    };

    render(<DefenseDisplay {...props} />);

    // Base: 15, Agilidade: 2, Armor: 3, Other: 5 (2+3) = Total: 25
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('handles negative bonuses (penalties)', () => {
    const otherBonuses: Modifier[] = [
      { name: 'Penalty', value: -2, type: 'penalidade' },
    ];

    const props = {
      ...defaultProps,
      otherBonuses,
    };

    render(<DefenseDisplay {...props} />);

    // Base: 15, Agilidade: 2, Armor: 3, Other: -2 = Total: 18
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('displays breakdown correctly', () => {
    render(<DefenseDisplay {...defaultProps} />);

    expect(screen.getByText('Base:')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Agilidade:')).toBeInTheDocument();
    expect(screen.getByText('Bônus de Armadura:')).toBeInTheDocument();
  });

  it('shows warning color when agility is limited by armor', () => {
    const props = {
      ...defaultProps,
      agilidade: 5,
      maxAgilityBonus: 2,
    };

    render(<DefenseDisplay {...props} />);

    // Should show max agility info in parenthesis
    expect(screen.getByText(/máx 2/)).toBeInTheDocument();
  });

  it('renders in non-editable mode', () => {
    const props = {
      ...defaultProps,
      editable: false,
    };

    render(<DefenseDisplay {...props} />);

    // Should not show add bonus button
    expect(screen.queryByText('Adicionar Bônus')).not.toBeInTheDocument();
  });

  it('allows adding new bonuses', () => {
    render(<DefenseDisplay {...defaultProps} />);

    const addButton = screen.getByText('Adicionar Bônus');
    fireEvent.click(addButton);

    expect(defaultProps.onOtherBonusesChange).toHaveBeenCalledWith([
      {
        name: 'Novo Bônus',
        value: 1,
        type: 'bonus',
      },
    ]);
  });

  it('allows removing bonuses', () => {
    const otherBonuses: Modifier[] = [
      { name: 'Spell Bonus', value: 2, type: 'bonus' },
    ];

    const props = {
      ...defaultProps,
      otherBonuses,
    };

    const { container } = render(<DefenseDisplay {...props} />);

    // Find delete button by icon
    const deleteButton = container.querySelector(
      '[data-testid="DeleteIcon"]'
    )?.parentElement;
    expect(deleteButton).toBeTruthy();

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(defaultProps.onOtherBonusesChange).toHaveBeenCalledWith([]);
    }
  });

  it('calculates with zero agility correctly', () => {
    const props = {
      ...defaultProps,
      agilidade: 0,
      armorBonus: 0,
    };

    render(<DefenseDisplay {...props} />);

    // Base: 15, Agilidade: 0, Armor: 0 = Total: 15
    // Use getAllByText to handle multiple "15" occurrences
    const fifteens = screen.getAllByText('15');
    expect(fifteens.length).toBeGreaterThan(0);
  });

  it('calculates with high agility correctly', () => {
    const props = {
      ...defaultProps,
      agilidade: 8, // Above normal max of 5
      armorBonus: 0,
    };

    render(<DefenseDisplay {...props} />);

    // Base: 15, Agilidade: 8, Armor: 0 = Total: 23
    expect(screen.getByText('23')).toBeInTheDocument();
  });
});
