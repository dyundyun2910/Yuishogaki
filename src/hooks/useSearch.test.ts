import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSearch } from './useSearch';
import type { Temple } from '../types/temple';

describe('useSearch', () => {
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
  ];

  describe('initialization', () => {
    it('should initialize with empty query and no results', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
    });

    it('should initialize with all temples when query is empty', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      expect(result.current.results).toEqual([]);
    });
  });

  describe('setQuery', () => {
    it('should update query', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('金閣');
      });

      expect(result.current.query).toBe('金閣');
    });

    it('should return search results when query is set', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('金閣');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results[0].name).toBe('金閣寺');
    });

    it('should return empty array when query is cleared', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('金閣');
      });
      expect(result.current.results.length).toBeGreaterThan(0);

      act(() => {
        result.current.setQuery('');
      });
      expect(result.current.results).toEqual([]);
    });

    it('should return empty array when no matches found', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('xyz123notfound');
      });

      expect(result.current.results).toEqual([]);
    });
  });

  describe('search functionality', () => {
    it('should search by temple name', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('金閣寺');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results[0].name).toBe('金閣寺');
    });

    it('should search by nameKana', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('ぎんかく');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results[0].name).toBe('銀閣寺');
    });

    it('should search by description', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('清水の舞台');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results[0].name).toBe('清水寺');
    });

    it('should search by tags', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('世界遺産');
      });

      expect(result.current.results.length).toBe(3);
    });

    it('should support fuzzy search', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('きよみず');
      });

      expect(result.current.results.length).toBeGreaterThan(0);
      expect(result.current.results[0].name).toBe('清水寺');
    });
  });

  describe('edge cases', () => {
    it('should handle empty temples array', () => {
      const { result } = renderHook(() => useSearch([]));

      act(() => {
        result.current.setQuery('金閣');
      });

      expect(result.current.results).toEqual([]);
    });

    it('should handle whitespace-only query', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('   ');
      });

      expect(result.current.results).toEqual([]);
    });

    it('should update results when temples array changes', () => {
      const { result, rerender } = renderHook(
        ({ temples }) => useSearch(temples),
        { initialProps: { temples: mockTemples } }
      );

      act(() => {
        result.current.setQuery('金閣');
      });
      expect(result.current.results.length).toBeGreaterThan(0);

      // 寺社リストを変更
      rerender({ temples: [mockTemples[1], mockTemples[2]] });

      // 金閣寺が検索結果から除外されることを確認
      expect(result.current.results.length).toBe(0);
    });
  });

  describe('clearQuery', () => {
    it('should clear query and results', () => {
      const { result } = renderHook(() => useSearch(mockTemples));

      act(() => {
        result.current.setQuery('金閣');
      });
      expect(result.current.query).toBe('金閣');
      expect(result.current.results.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearQuery();
      });

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
    });
  });
});
