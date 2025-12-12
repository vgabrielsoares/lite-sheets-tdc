/**
 * Testes para PersonalitySection
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalitySection } from '../PersonalitySection';
import type { CharacterDefiners } from '@/types';

const mockDefiners: CharacterDefiners = {
  flaws: ['Arrogante', 'Impulsivo'],
  fears: ['Altura'],
  ideals: ['Liberdade', 'Justiça'],
  traits: ['Corajoso'],
  goals: [],
  allies: [],
  organizations: [],
};

describe('PersonalitySection', () => {
  it('renderiza todas as categorias', () => {
    const onUpdate = jest.fn();
    render(<PersonalitySection definers={mockDefiners} onUpdate={onUpdate} />);

    expect(screen.getByText('Falhas')).toBeInTheDocument();
    expect(screen.getByText('Medos')).toBeInTheDocument();
    expect(screen.getByText('Ideais')).toBeInTheDocument();
    expect(screen.getByText('Traços')).toBeInTheDocument();
    expect(screen.getByText('Objetivos')).toBeInTheDocument();
    expect(screen.getByText('Aliados')).toBeInTheDocument();
    expect(screen.getByText('Organizações')).toBeInTheDocument();
  });

  it('exibe chips com valores existentes', () => {
    const onUpdate = jest.fn();
    render(<PersonalitySection definers={mockDefiners} onUpdate={onUpdate} />);

    expect(screen.getByText('Arrogante')).toBeInTheDocument();
    expect(screen.getByText('Impulsivo')).toBeInTheDocument();
    expect(screen.getByText('Altura')).toBeInTheDocument();
    expect(screen.getByText('Liberdade')).toBeInTheDocument();
  });

  it('adiciona novo valor ao pressionar Enter', () => {
    const onUpdate = jest.fn();
    render(<PersonalitySection definers={mockDefiners} onUpdate={onUpdate} />);

    const input = screen.getAllByPlaceholderText(/Ex:/)[0]; // Primeiro input (Falhas)
    fireEvent.change(input, { target: { value: 'Ganancioso' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockDefiners,
      flaws: [...mockDefiners.flaws, 'Ganancioso'],
    });
  });

  it('remove valor ao clicar no X', () => {
    const onUpdate = jest.fn();
    render(<PersonalitySection definers={mockDefiners} onUpdate={onUpdate} />);

    // Encontra o chip "Arrogante" e clica no botão de remover
    const arroganteChip = screen
      .getByText('Arrogante')
      .closest('.MuiChip-root');
    const deleteButton = arroganteChip?.querySelector(
      '[data-testid="CancelIcon"]'
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      expect(onUpdate).toHaveBeenCalledWith({
        ...mockDefiners,
        flaws: ['Impulsivo'], // Removeu 'Arrogante'
      });
    }
  });

  it('permite editar chip clicando nele', () => {
    const onUpdate = jest.fn();
    render(<PersonalitySection definers={mockDefiners} onUpdate={onUpdate} />);

    const arroganteChip = screen.getByText('Arrogante');
    fireEvent.click(arroganteChip);

    // Deve aparecer um TextField para edição
    const editInput = screen.getByDisplayValue('Arrogante');
    expect(editInput).toBeInTheDocument();
  });
});
