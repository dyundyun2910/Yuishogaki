import { useState, useMemo, useCallback } from 'react';
import type { Temple } from '../types/temple';
import { createSearchEngine, search as searchTemples } from '../utils/searchEngine';

/**
 * useSearchフックの戻り値
 */
export interface UseSearchResult {
  query: string;
  results: Temple[];
  setQuery: (query: string) => void;
  clearQuery: () => void;
}

/**
 * 検索機能を提供するカスタムフック
 * @param temples - 検索対象の寺社配列
 * @returns 検索クエリ、検索結果、クエリ更新関数
 */
export function useSearch(temples: Temple[]): UseSearchResult {
  const [query, setQueryState] = useState('');

  // 検索エンジンを寺社リストからメモ化
  const searchEngine = useMemo(() => {
    return createSearchEngine(temples);
  }, [temples]);

  // 検索結果を計算
  const results = useMemo(() => {
    if (!query || query.trim() === '') {
      return [];
    }
    return searchTemples(searchEngine, query);
  }, [searchEngine, query]);

  // クエリを更新
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // クエリをクリア
  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  return {
    query,
    results,
    setQuery,
    clearQuery,
  };
}
