import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableNumber } from '../EditableNumber';

describe('EditableNumber', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    render(<EditableNumber value={42} onChange={mockOnChange} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with sign when showSign is true', () => {
    render(<EditableNumber value={5} onChange={mockOnChange} showSign />);

    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('does not show sign for negative numbers', () => {
    render(<EditableNumber value={-3} onChange={mockOnChange} showSign />);

    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('enters edit mode on click', async () => {
    render(<EditableNumber value={10} onChange={mockOnChange} />);

    const displayElement = screen.getByText('10');
    await userEvent.click(displayElement);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(10);
  });

  it('calls onChange with debounce in autoSave mode', async () => {
    jest.useFakeTimers();

    render(
      <EditableNumber
        value={5}
        onChange={mockOnChange}
        autoSave
        debounceMs={500}
      />
    );

    await userEvent.click(screen.getByText('5'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '15');

    // Não deve chamar onChange imediatamente
    expect(mockOnChange).not.toHaveBeenCalled();

    // Avançar tempo para debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(15);
    });

    jest.useRealTimers();
  });

  it('validates minimum value', async () => {
    render(
      <EditableNumber
        value={10}
        onChange={mockOnChange}
        min={5}
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '3');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(await screen.findByText('Valor mínimo: 5')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('validates maximum value', async () => {
    render(
      <EditableNumber
        value={10}
        onChange={mockOnChange}
        max={20}
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '25');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(await screen.findByText('Valor máximo: 20')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('validates with custom validator', async () => {
    const customValidator = (value: number) => {
      if (value % 2 !== 0) return 'Deve ser par';
      return null;
    };

    render(
      <EditableNumber
        value={10}
        onChange={mockOnChange}
        validate={customValidator}
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '15');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(await screen.findByText('Deve ser par')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows error for invalid number', async () => {
    render(
      <EditableNumber value={10} onChange={mockOnChange} autoSave={false} />
    );

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(await screen.findByText('Valor inválido')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('cancels edit on Escape key', async () => {
    render(<EditableNumber value={42} onChange={mockOnChange} />);

    await userEvent.click(screen.getByText('42'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '100');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('confirms edit on Enter key (non-autoSave)', async () => {
    render(
      <EditableNumber value={10} onChange={mockOnChange} autoSave={false} />
    );

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    await userEvent.clear(input);
    await userEvent.type(input, '25{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith(25);
  });

  it('displays label when provided', () => {
    render(<EditableNumber value={5} onChange={mockOnChange} label="Level" />);

    expect(screen.getByText('Level')).toBeInTheDocument();
  });

  it('respects step attribute', async () => {
    render(<EditableNumber value={10} onChange={mockOnChange} step={5} />);

    await userEvent.click(screen.getByText('10'));
    const input = screen.getByRole('spinbutton');

    expect(input).toHaveAttribute('step', '5');
  });
});
