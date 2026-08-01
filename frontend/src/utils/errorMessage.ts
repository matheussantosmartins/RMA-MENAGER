import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
