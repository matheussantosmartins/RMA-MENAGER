import { RmaStatus } from '@prisma/client';
import { canTransition, TERMINAL_STATUSES } from '@/modules/rmas/rma.statusMachine';

describe('rma.statusMachine', () => {
  it('permite transições válidas do fluxo principal', () => {
    expect(canTransition(RmaStatus.PENDING, RmaStatus.APPROVED)).toBe(true);
    expect(canTransition(RmaStatus.APPROVED, RmaStatus.IN_REPAIR)).toBe(true);
    expect(canTransition(RmaStatus.IN_REPAIR, RmaStatus.REPAIRED)).toBe(true);
    expect(canTransition(RmaStatus.REPAIRED, RmaStatus.CLOSED)).toBe(true);
  });

  it('permite cancelamento a partir de estados não terminais', () => {
    expect(canTransition(RmaStatus.PENDING, RmaStatus.CANCELLED)).toBe(true);
    expect(canTransition(RmaStatus.APPROVED, RmaStatus.CANCELLED)).toBe(true);
    expect(canTransition(RmaStatus.IN_REPAIR, RmaStatus.CANCELLED)).toBe(true);
  });

  it('rejeita transições que pulam etapas do fluxo', () => {
    expect(canTransition(RmaStatus.PENDING, RmaStatus.IN_REPAIR)).toBe(false);
    expect(canTransition(RmaStatus.PENDING, RmaStatus.CLOSED)).toBe(false);
    expect(canTransition(RmaStatus.APPROVED, RmaStatus.CLOSED)).toBe(false);
  });

  it('não permite transições a partir de estados terminais', () => {
    for (const terminal of TERMINAL_STATUSES) {
      expect(canTransition(terminal, RmaStatus.PENDING)).toBe(false);
      expect(canTransition(terminal, RmaStatus.APPROVED)).toBe(false);
    }
  });

  it('não permite voltar de um status mais avançado para um anterior', () => {
    expect(canTransition(RmaStatus.IN_REPAIR, RmaStatus.APPROVED)).toBe(false);
    expect(canTransition(RmaStatus.APPROVED, RmaStatus.PENDING)).toBe(false);
  });
});
