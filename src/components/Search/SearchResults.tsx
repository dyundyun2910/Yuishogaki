import type { Temple } from '../../types/temple';
import './SearchResults.css';

export interface SearchResultsProps {
  results: Temple[];
  onTempleClick: (temple: Temple) => void;
}

/**
 * 検索結果表示コンポーネント
 */
export function SearchResults({ results, onTempleClick }: SearchResultsProps) {
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  };

  const getCategoryLabel = (category: 'temple' | 'shrine'): string => {
    return category === 'temple' ? '寺' : '神社';
  };

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <p>検索結果が見つかりませんでした</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results__header">
        <p className="search-results__count">{results.length}件の検索結果</p>
      </div>
      <ul className="search-results__list" role="list">
        {results.map((temple) => (
          <li key={temple.id} role="listitem">
            <button
              className="search-results__item"
              onClick={() => onTempleClick(temple)}
              type="button"
            >
              <div className="search-results__item-header">
                <h3 className="search-results__item-name">{temple.name}</h3>
                <span className={`search-results__item-category search-results__item-category--${temple.category}`}>
                  {getCategoryLabel(temple.category)}
                </span>
              </div>
              <p className="search-results__item-address">{temple.location.address}</p>
              {temple.description && (
                <p className="search-results__item-description">
                  {truncateText(temple.description)}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
