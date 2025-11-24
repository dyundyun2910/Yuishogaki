import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  describe('rendering', () => {
    it('should render search input', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      const input = screen.getByPlaceholderText('寺社名、由緒書き、タグで検索...');
      expect(input).toBeInTheDocument();
    });

    it('should display current query value', () => {
      render(<SearchBar query="金閣寺" onQueryChange={() => {}} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('金閣寺');
    });

    it('should render search icon', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      // aria-labelまたはtest-idで検索アイコンを探す
      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('user interaction', () => {
    it('should call onQueryChange when user types', () => {
      const handleQueryChange = vi.fn();
      render(<SearchBar query="" onQueryChange={handleQueryChange} />);

      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: '金閣' } });

      expect(handleQueryChange).toHaveBeenCalledWith('金閣');
    });

    it('should call onQueryChange multiple times as user types', () => {
      const handleQueryChange = vi.fn();
      render(<SearchBar query="" onQueryChange={handleQueryChange} />);

      const input = screen.getByRole('searchbox');

      fireEvent.change(input, { target: { value: '金' } });
      fireEvent.change(input, { target: { value: '金閣' } });
      fireEvent.change(input, { target: { value: '金閣寺' } });

      expect(handleQueryChange).toHaveBeenCalledTimes(3);
      expect(handleQueryChange).toHaveBeenNthCalledWith(1, '金');
      expect(handleQueryChange).toHaveBeenNthCalledWith(2, '金閣');
      expect(handleQueryChange).toHaveBeenNthCalledWith(3, '金閣寺');
    });

    it('should handle empty input', () => {
      const handleQueryChange = vi.fn();
      render(<SearchBar query="金閣寺" onQueryChange={handleQueryChange} />);

      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: '' } });

      expect(handleQueryChange).toHaveBeenCalledWith('');
    });
  });

  describe('clear button', () => {
    it('should show clear button when query is not empty', () => {
      render(<SearchBar query="金閣寺" onQueryChange={() => {}} />);

      const clearButton = screen.getByRole('button', { name: /クリア|clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when query is empty', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      const clearButton = screen.queryByRole('button', { name: /クリア|clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should call onQueryChange with empty string when clear button is clicked', () => {
      const handleQueryChange = vi.fn();
      render(<SearchBar query="金閣寺" onQueryChange={handleQueryChange} />);

      const clearButton = screen.getByRole('button', { name: /クリア|clear/i });
      fireEvent.click(clearButton);

      expect(handleQueryChange).toHaveBeenCalledWith('');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should be keyboard accessible', () => {
      const handleQueryChange = vi.fn();
      render(<SearchBar query="" onQueryChange={handleQueryChange} />);

      const input = screen.getByRole('searchbox');
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });

  describe('custom placeholder', () => {
    it('should use custom placeholder when provided', () => {
      render(
        <SearchBar
          query=""
          onQueryChange={() => {}}
          placeholder="カスタムプレースホルダー"
        />
      );

      const input = screen.getByPlaceholderText('カスタムプレースホルダー');
      expect(input).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(<SearchBar query="" onQueryChange={() => {}} />);

      const input = screen.getByPlaceholderText('寺社名、由緒書き、タグで検索...');
      expect(input).toBeInTheDocument();
    });
  });
});
