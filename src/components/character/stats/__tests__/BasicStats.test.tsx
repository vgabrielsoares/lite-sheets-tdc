import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicStats } from '../BasicStats';
import type { Character } from '@/types';

// Mock do character para testes
const mockCharacter: Partial<Character> = {
  id: '1',
  name: 'Aragorn',
  playerName: 'John Doe',
  level: 5,
  experience: {
    current: 1000,
    toNextLevel: 2000,
  },
  lineage: {
    name: 'Humano',
    size: 'medio',
  } as any,
  origin: {
    name: 'Soldado',
  } as any,
};

describe('BasicStats', () => {
  const mockOnUpdate = jest.fn();
  const mockOnOpenLineage = jest.fn();
  const mockOnOpenOrigin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders character name', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Aragorn')).toBeInTheDocument();
  });

  it('renders player name', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders level', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders XP', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('/ 2000 XP')).toBeInTheDocument();
  });

  it('renders lineage name', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Humano')).toBeInTheDocument();
  });

  it('renders origin name', () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Soldado')).toBeInTheDocument();
  });

  it('shows placeholder for undefined lineage', () => {
    const charWithoutLineage = {
      ...mockCharacter,
      lineage: undefined,
    };

    render(
      <BasicStats
        character={charWithoutLineage as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Nenhuma linhagem definida')).toBeInTheDocument();
  });

  it('shows placeholder for undefined origin', () => {
    const charWithoutOrigin = {
      ...mockCharacter,
      origin: undefined,
    };

    render(
      <BasicStats
        character={charWithoutOrigin as Character}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Nenhuma origem definida')).toBeInTheDocument();
  });

  it('calls onOpenLineage when lineage is clicked', async () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
        onOpenLineage={mockOnOpenLineage}
      />
    );

    const lineageElement = screen.getByText('Humano').closest('div');
    if (lineageElement) {
      await userEvent.click(lineageElement);
      expect(mockOnOpenLineage).toHaveBeenCalled();
    }
  });

  it('calls onOpenOrigin when origin is clicked', async () => {
    render(
      <BasicStats
        character={mockCharacter as Character}
        onUpdate={mockOnUpdate}
        onOpenOrigin={mockOnOpenOrigin}
      />
    );

    const originElement = screen.getByText('Soldado').closest('div');
    if (originElement) {
      await userEvent.click(originElement);
      expect(mockOnOpenOrigin).toHaveBeenCalled();
    }
  });
});
