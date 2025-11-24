import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Temple } from '../types/temple';

/**
 * Fuse.jsの設定オプション
 */
const fuseOptions: IFuseOptions<Temple> = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'nameKana', weight: 0.2 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.1 },
    { name: 'location.address', weight: 0.1 },
  ],
  threshold: 0.3, // 0.0 = 完全一致、1.0 = すべてマッチ
  includeScore: true,
  minMatchCharLength: 1,
  ignoreLocation: true,
};

/**
 * 検索エンジンインスタンスを作成
 * @param temples - 検索対象の寺社配列
 * @returns Fuse検索エンジンインスタンス
 */
export function createSearchEngine(temples: Temple[]): Fuse<Temple> {
  return new Fuse(temples, fuseOptions);
}

/**
 * 寺社を検索
 * @param engine - Fuse検索エンジンインスタンス
 * @param query - 検索クエリ
 * @returns 検索結果の寺社配列（スコア順）
 */
export function search(engine: Fuse<Temple>, query: string): Temple[] {
  // 空のクエリの場合は空配列を返す
  if (!query || query.trim() === '') {
    return [];
  }

  const results = engine.search(query);
  return results.map((result) => result.item);
}
