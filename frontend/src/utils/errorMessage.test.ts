import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { getErrorMessage } from './errorMessage';

describe('getErrorMessage', () => {
  it('extrai a mensagem de um AxiosError com resposta da API', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      status: 401,
      data: { message: 'Credenciais inválidas' },
    } as never);

    expect(getErrorMessage(error)).toBe('Credenciais inválidas');
  });

  it('usa a mensagem padrão de fallback quando não há response.data.message', () => {
    const error = new axios.AxiosError('Network Error');
    expect(getErrorMessage(error, 'Falha de rede')).toBe('Falha de rede');
  });

  it('extrai a mensagem de um Error genérico', () => {
    expect(getErrorMessage(new Error('algo quebrou'))).toBe('algo quebrou');
  });

  it('retorna o fallback para valores desconhecidos', () => {
    expect(getErrorMessage('string qualquer', 'fallback')).toBe('fallback');
  });
});
