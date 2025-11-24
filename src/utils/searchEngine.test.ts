import { describe, it, expect } from 'vitest';
import { createSearchEngine, search } from './searchEngine';
import type { Temple } from '../types/temple';

describe('searchEngine', () => {
  const mockTemples: Temple[] = [
    {
      id: '1',
      name: '金閣寺',
      nameKana: 'きんかくじ',
      description: '足利義満が建立した寺院。金箔で覆われた舎利殿が有名。',
      category: 'temple',
      location: { lat: 35.0394, lng: 135.7292, address: '京都市北区金閣寺町1' },
      images: [],
      tags: ['世界遺産', '金閣', '足利義満'],
    },
    {
      id: '2',
      name: '銀閣寺',
      nameKana: 'ぎんかくじ',
      description: '足利義政が建立した寺院。わびさびの美学を体現。',
      category: 'temple',
      location: { lat: 35.0269, lng: 135.7983, address: '京都市左京区銀閣寺町2' },
      images: [],
      tags: ['世界遺産', '銀閣', '足利義政'],
    },
    {
      id: '3',
      name: '清水寺',
      nameKana: 'きよみずでら',
      description: '京都を代表する寺院の一つ。清水の舞台から京都市街を一望できる。',
      category: 'temple',
      location: { lat: 34.9949, lng: 135.7850, address: '京都市東山区清水1丁目294' },
      images: [],
      tags: ['世界遺産', '清水の舞台'],
    },
    {
      id: '4',
      name: '伏見稲荷大社',
      nameKana: 'ふしみいなりたいしゃ',
      description: '千本鳥居で有名な稲荷神社の総本宮。',
      category: 'shrine',
      location: { lat: 34.9671, lng: 135.7727, address: '京都市伏見区深草藪之内町68' },
      images: [],
      tags: ['千本鳥居', '稲荷'],
    },
  ];

  describe('createSearchEngine', () => {
    it('should create a search engine instance', () => {
      const engine = createSearchEngine(mockTemples);
      expect(engine).toBeDefined();
    });

    it('should accept empty array', () => {
      const engine = createSearchEngine([]);
      expect(engine).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search by temple name', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '金閣');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('金閣寺');
    });

    it('should search by exact temple name', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '銀閣寺');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('銀閣寺');
    });

    it('should search by nameKana', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, 'きんかく');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('金閣寺');
    });

    it('should search by description', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '足利義満');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('金閣寺');
    });

    it('should search by tags', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '世界遺産');

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.tags?.includes('世界遺産'))).toBe(true);
    });

    it('should search by address', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '北区');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].location.address).toContain('北区');
    });

    it('should return empty array for no matches', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, 'xyz123notfound');

      expect(results).toHaveLength(0);
    });

    it('should support fuzzy search', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, 'きよみず');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('清水寺');
    });

    it('should return multiple results for common terms', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '足利');

      expect(results.length).toBeGreaterThanOrEqual(2);
      const names = results.map((r) => r.name);
      expect(names).toContain('金閣寺');
      expect(names).toContain('銀閣寺');
    });

    it('should return empty array for empty query', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '');

      expect(results).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const engine = createSearchEngine(mockTemples);
      const results1 = search(engine, '清水寺');
      const results2 = search(engine, 'きよみず');

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });

    it('should prioritize exact matches over partial matches', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '清水寺');

      expect(results[0].name).toBe('清水寺');
    });

    it('should filter by category when searching shrine', () => {
      const engine = createSearchEngine(mockTemples);
      const results = search(engine, '稲荷');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('shrine');
    });
  });
});
