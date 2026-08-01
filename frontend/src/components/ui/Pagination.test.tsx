import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('não renderiza nada quando o total é zero', () => {
    const { container } = render(
      <Pagination
        meta={{ total: 0, page: 1, pageSize: 10, totalPages: 1 }}
        onPageChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('exibe o resumo de página e desabilita "Anterior" na primeira página', () => {
    render(
      <Pagination
        meta={{ total: 25, page: 1, pageSize: 10, totalPages: 3 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Próxima/ })).toBeEnabled();
  });

  it('chama onPageChange com a próxima página ao clicar em "Próxima"', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        meta={{ total: 25, page: 2, pageSize: 10, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Próxima/ }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: /Anterior/ }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
