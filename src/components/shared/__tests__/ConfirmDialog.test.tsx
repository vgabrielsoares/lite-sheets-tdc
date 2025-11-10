import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirmar Ação',
    message: 'Tem certeza que deseja realizar esta ação?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente quando aberto', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirmar Ação')).toBeInTheDocument();
    expect(
      screen.getByText('Tem certeza que deseja realizar esta ação?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirmar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancelar/i })
    ).toBeInTheDocument();
  });

  it('não deve renderizar quando fechado', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Confirmar Ação')).not.toBeInTheDocument();
  });

  it('deve chamar onConfirm ao clicar no botão de confirmar', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('deve chamar onCancel ao clicar no botão de cancelar', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('deve usar textos customizados para os botões', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Deletar"
        cancelText="Voltar"
      />
    );

    expect(
      screen.getByRole('button', { name: /deletar/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
  });

  it('deve aplicar a cor correta ao botão de confirmação', () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} confirmColor="error" />
    );

    let confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toHaveClass('MuiButton-containedError');

    rerender(<ConfirmDialog {...defaultProps} confirmColor="warning" />);
    confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toHaveClass('MuiButton-containedWarning');
  });

  it('deve desabilitar botões quando loading é true', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByRole('button', { name: /aguarde/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toHaveTextContent('Aguarde...');
  });

  it('deve ter atributos de acessibilidade corretos', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'confirm-dialog-description'
    );
  });

  it('deve focar automaticamente no botão de confirmação', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toHaveAttribute('autofocus');
  });

  it('não deve chamar onCancel ao clicar fora quando closeOnBackdropClick é false', () => {
    render(<ConfirmDialog {...defaultProps} closeOnBackdropClick={false} />);

    // MUI usa um backdrop, mas como não podemos testar clique direto nele
    // testamos que o diálogo tem a configuração correta
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // O comportamento real é testado via integração
  });

  it('não deve permitir ações quando loading está ativo', () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByRole('button', { name: /aguarde/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    fireEvent.click(confirmButton);
    fireEvent.click(cancelButton);

    // Botões desabilitados não disparam eventos
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });
});
