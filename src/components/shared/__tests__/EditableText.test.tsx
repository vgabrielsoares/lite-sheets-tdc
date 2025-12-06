import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableText } from '../EditableText';

describe('EditableText', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <EditableText
        value="Original"
        onChange={mockOnChange}
        autoSave
        debounceMs={100}
      />
    );

    await user.click(screen.getByText('Original'));
    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'New Value');

    // Não deve chamar onChange imediatamente
    expect(mockOnChange).not.toHaveBeenCalled();

    // Avançar o tempo para o debounce disparar
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockOnChange).toHaveBeenCalledWith('New Value');
  });

  it('validates required field', async () => {
    const localMockOnChange = jest.fn();

    render(
      <EditableText
        value=""
        onChange={localMockOnChange}
        required
        autoSave={false}
      />
    );

    await userEvent.click(screen.getByText('Clique para editar'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(
      await screen.findByText('Este campo é obrigatório')
    ).toBeInTheDocument();
    expect(localMockOnChange).not.toHaveBeenCalled();
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
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(await screen.findByText('Muito longo')).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('cancels edit on Escape key', async () => {
    render(<EditableText value="Original" onChange={mockOnChange} />);

    await userEvent.click(screen.getByText('Original'));
    const input = screen.getByRole('textbox');

    await userEvent.clear(input);
    await userEvent.type(input, 'Changed');
    await userEvent.keyboard('{Escape}');

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

    // Clicar no elemento de visualização para entrar em modo de edição
    await userEvent.click(screen.getByTestId('editable-text-view'));

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
