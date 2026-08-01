import { buildPaginatedResult, getSkipTake } from '@/utils/pagination';

describe('pagination utils', () => {
  describe('getSkipTake', () => {
    it('calcula skip/take corretamente para a primeira página', () => {
      expect(getSkipTake(1, 10)).toEqual({ skip: 0, take: 10 });
    });

    it('calcula skip/take corretamente para páginas seguintes', () => {
      expect(getSkipTake(3, 20)).toEqual({ skip: 40, take: 20 });
    });
  });

  describe('buildPaginatedResult', () => {
    it('monta meta com totalPages arredondado para cima', () => {
      const result = buildPaginatedResult(['a', 'b'], 25, 1, 10);
      expect(result.items).toEqual(['a', 'b']);
      expect(result.meta).toEqual({ total: 25, page: 1, pageSize: 10, totalPages: 3 });
    });

    it('garante totalPages mínimo de 1 quando não há itens', () => {
      const result = buildPaginatedResult([], 0, 1, 10);
      expect(result.meta.totalPages).toBe(1);
    });
  });
});
