import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RmasPage } from './RmasPage';

describe('RmasPage', () => {
  it('lista os RMAs retornados pela API', async () => {
    renderWithProviders(<RmasPage />, { initialEntries: ['/rmas'] });

    expect(await screen.findByText('RMA-2026-00001')).toBeInTheDocument();

    const row = screen.getByText('RMA-2026-00001').closest('tr')!;
    expect(within(row).getByText('Ana Silva')).toBeInTheDocument();
    expect(within(row).getByText('Notebook Pro 14"')).toBeInTheDocument();
    expect(within(row).getByText('Pendente')).toBeInTheDocument();
    expect(within(row).getByText('Alta')).toBeInTheDocument();
  });

  it('exibe o botão de criação de novo RMA', async () => {
    renderWithProviders(<RmasPage />, { initialEntries: ['/rmas'] });
    await screen.findByText('RMA-2026-00001');
    expect(screen.getByRole('button', { name: /Novo RMA/ })).toBeInTheDocument();
  });
});
