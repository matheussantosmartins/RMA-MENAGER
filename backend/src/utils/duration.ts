const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Converte durações simples no formato "15m", "7d", "1h" para milissegundos. */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Formato de duração inválido: "${duration}"`);
  }

  const [, amount, unit] = match as unknown as [string, string, string];
  return Number(amount) * UNIT_TO_MS[unit]!;
}
