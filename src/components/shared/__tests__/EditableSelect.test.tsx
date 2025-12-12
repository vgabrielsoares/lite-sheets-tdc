import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableSelect } from '../EditableSelect';

describe('EditableSelect', () => {
  it('renders with initial value', () => {
    const options = [
      { value: 'small', label: 'Pequeno' },
      { value: 'medium', label: 'Médio' },
    ];
    render(
      <EditableSelect value="medium" onChange={() => {}} options={options} />
    );
    expect(screen.getByText('Médio')).toBeInTheDocument();
  });

  it('shows placeholder when empty', () => {
    const options = [{ value: 'small', label: 'Pequeno' }];
    render(
      <EditableSelect
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Selecione"
      />
    );
    expect(screen.getByText('Selecione')).toBeInTheDocument();
  });

  it('enters edit mode on click', async () => {
    const options = [{ value: 'small', label: 'Pequeno' }];
    render(
      <EditableSelect
        value="small"
        onChange={() => {}}
        options={options}
        testId="test"
      />
    );
    await userEvent.click(screen.getByText('Pequeno'));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
