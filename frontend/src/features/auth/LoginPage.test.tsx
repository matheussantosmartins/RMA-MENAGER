import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/renderWithProviders';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('exibe erros de validação ao submeter o formulário vazio', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha')).toBeInTheDocument();
  });

  it('exibe mensagem de erro para credenciais inválidas', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    await user.type(screen.getByLabelText('E-mail'), 'admin@rmamanager.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-errada');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument();
  });

  it('autentica com sucesso e sai da tela de login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    await user.type(screen.getByLabelText('E-mail'), 'admin@rmamanager.com');
    await user.type(screen.getByLabelText('Senha'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Entrar' })).not.toBeInTheDocument();
    });
  });
});
