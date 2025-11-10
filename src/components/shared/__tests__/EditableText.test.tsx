import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableText } from '../EditableText';

describe('EditableText', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    render(<EditableText value="Test Name" onChange={mockOnChange} />);

    expect(screen.getByText('Test Name')).toBeInTheDocument();
  });

  it('shows placeholder when value is empty', () => {
    render(
      <EditableText
        value=""
        onChange={mockOnChange}
        placeholder="Click to edit"
      />
    );

    expect(screen.getByText('Click to edit')).toBeInTheDocument();
  });

  it('enters edit mode on click', async () => {
    render(<EditableText value="Test Name" onChange={mockOnChange} />);

    const displayElement = screen.getByText('Test Name');
    await userEvent.click(displayElement);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Test Name');
  });

  it('calls onChange with debounce in autoSave mode', async () => {
    jest.useFakeTimers();

    render(
      <EditableText
        value="Original"
        onChange={mockOnChange}
        autoSave
        debounceMs={500}
      />
    );

    await userEvent.click(screen.getByText('Original'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'New Value');

    // Não deve chamar onChange imediatamente
    expect(mockOnChange).not.toHaveBeenCalled();

    // Avançar tempo para debounce
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('New Value');
    });

    jest.useRealTimers();
  });

  it('validates required field', async () => {
    render(
      <EditableText
        value=""
        onChange={mockOnChange}
        required
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('Clique para editar'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(
      await screen.findByText('Este campo é obrigatório')
    ).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('validates with custom validator', async () => {
    const customValidator = (value: string) => {
      if (value.length > 5) return 'Muito longo';
      return null;
    };

    render(
      <EditableText
        value=""
        onChange={mockOnChange}
        validate={customValidator}
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('Clique para editar'));
    const input = screen.getByRole('textbox');

    await userEvent.type(input, '123456');
    await userEvent.click(screen.getByRole('button', { name: /check/i }));

    expect(await screen.findByText('Muito longo')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('cancels edit on Escape key', async () => {
    render(<EditableText value="Original" onChange={mockOnChange} />);

    await userEvent.click(screen.getByText('Original'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Changed');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('confirms edit on Enter key (non-autoSave)', async () => {
    render(
      <EditableText value="Original" onChange={mockOnChange} autoSave={false} />
    );

    await userEvent.click(screen.getByText('Original'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'New{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith('New');
  });

  it('renders multiline variant', async () => {
    render(
      <EditableText
        value="Line 1\nLine 2"
        onChange={mockOnChange}
        multiline
        rows={3}
      />
    );

    await userEvent.click(screen.getByText('Line 1\nLine 2'));

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('rows', '3');
  });

  it('displays label when provided', () => {
    render(
      <EditableText
        value="Test"
        onChange={mockOnChange}
        label="Character Name"
      />
    );

    expect(screen.getByText('Character Name')).toBeInTheDocument();
  });
});
