import { parseDurationToMs } from '@/utils/duration';

describe('parseDurationToMs', () => {
  it('converte minutos corretamente', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
  });

  it('converte dias corretamente', () => {
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('converte horas e segundos corretamente', () => {
    expect(parseDurationToMs('2h')).toBe(2 * 60 * 60 * 1000);
    expect(parseDurationToMs('30s')).toBe(30 * 1000);
  });

  it('lança erro para formato inválido', () => {
    expect(() => parseDurationToMs('abc')).toThrow('Formato de duração inválido');
    expect(() => parseDurationToMs('10x')).toThrow('Formato de duração inválido');
  });
});
