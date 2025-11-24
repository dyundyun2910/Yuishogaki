import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchResults } from './SearchResults';
import type { Temple } from '../../types/temple';

describe('SearchResults', () => {
  const mockTemples: Temple[] = [
    {
      id: '1',
      name: '金閣寺',
      nameKana: 'きんかくじ',
      description: '足利義満が建立した寺院。',
      category: 'temple',
      location: { lat: 35.0394, lng: 135.7292, address: '京都市北区金閣寺町1' },
      images: [],
      tags: ['世界遺産'],
    },
    {
      id: '2',
      name: '銀閣寺',
      nameKana: 'ぎんかくじ',
      description: '足利義政が建立した寺院。',
      category: 'temple',
      location: { lat: 35.0269, lng: 135.7983, address: '京都市左京区銀閣寺町2' },
      images: [],
      tags: ['世界遺産'],
    },
  ];

  describe('rendering', () => {
    it('should display search results count', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      expect(screen.getByText('2件の検索結果')).toBeInTheDocument();
    });

    it('should display all temple names', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      expect(screen.getByText('金閣寺')).toBeInTheDocument();
      expect(screen.getByText('銀閣寺')).toBeInTheDocument();
    });

    it('should display temple addresses', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      expect(screen.getByText(/京都市北区金閣寺町1/)).toBeInTheDocument();
      expect(screen.getByText(/京都市左京区銀閣寺町2/)).toBeInTheDocument();
    });

    it('should display temple categories', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      const categoryBadges = screen.getAllByText('寺');
      expect(categoryBadges).toHaveLength(2);
    });
  });

  describe('empty state', () => {
    it('should show "no results" message when results are empty', () => {
      render(<SearchResults results={[]} onTempleClick={() => {}} />);

      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
    });

    it('should not show count when results are empty', () => {
      render(<SearchResults results={[]} onTempleClick={() => {}} />);

      expect(screen.queryByText(/件の検索結果/)).not.toBeInTheDocument();
    });
  });

  describe('user interaction', () => {
    it('should call onTempleClick when temple item is clicked', () => {
      const handleTempleClick = vi.fn();
      render(<SearchResults results={mockTemples} onTempleClick={handleTempleClick} />);

      const templeItem = screen.getByText('金閣寺').closest('button');
      fireEvent.click(templeItem!);

      expect(handleTempleClick).toHaveBeenCalledWith(mockTemples[0]);
    });

    it('should call onTempleClick for different temples', () => {
      const handleTempleClick = vi.fn();
      render(<SearchResults results={mockTemples} onTempleClick={handleTempleClick} />);

      const temple1 = screen.getByText('金閣寺').closest('button');
      const temple2 = screen.getByText('銀閣寺').closest('button');

      fireEvent.click(temple1!);
      fireEvent.click(temple2!);

      expect(handleTempleClick).toHaveBeenCalledTimes(2);
      expect(handleTempleClick).toHaveBeenNthCalledWith(1, mockTemples[0]);
      expect(handleTempleClick).toHaveBeenNthCalledWith(2, mockTemples[1]);
    });
  });

  describe('temple category display', () => {
    it('should display "寺" for temple category', () => {
      const temple: Temple[] = [
        {
          id: '1',
          name: 'テスト寺',
          nameKana: 'てすとじ',
          description: 'テスト',
          category: 'temple',
          location: { lat: 35, lng: 135, address: '京都' },
          images: [],
        },
      ];

      render(<SearchResults results={temple} onTempleClick={() => {}} />);

      expect(screen.getByText('寺')).toBeInTheDocument();
    });

    it('should display "神社" for shrine category', () => {
      const shrine: Temple[] = [
        {
          id: '1',
          name: 'テスト神社',
          nameKana: 'てすとじんじゃ',
          description: 'テスト',
          category: 'shrine',
          location: { lat: 35, lng: 135, address: '京都' },
          images: [],
        },
      ];

      render(<SearchResults results={shrine} onTempleClick={() => {}} />);

      expect(screen.getByText('神社')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for list', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for list items', () => {
      render(<SearchResults results={mockTemples} onTempleClick={() => {}} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('truncated description', () => {
    it('should truncate long descriptions', () => {
      const templeWithLongDesc: Temple[] = [
        {
          id: '1',
          name: 'テスト寺',
          nameKana: 'てすとじ',
          description: 'これは非常に長い説明文です。'.repeat(20),
          category: 'temple',
          location: { lat: 35, lng: 135, address: '京都' },
          images: [],
        },
      ];

      render(<SearchResults results={templeWithLongDesc} onTempleClick={() => {}} />);

      const description = screen.getByText(/これは非常に長い説明文です/);
      expect(description.textContent).toContain('...');
    });
  });
});
