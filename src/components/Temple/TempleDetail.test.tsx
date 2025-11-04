import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TempleDetail } from './TempleDetail'
import type { Temple } from '../../types/temple'

const mockTemple: Temple = {
  id: 'test-temple',
  name: 'テスト寺',
  nameKana: 'てすとでら',
  category: 'temple',
  location: {
    lat: 35.0116,
    lng: 135.7681,
    address: '京都府京都市北区テスト町1-1',
  },
  description:
    'これはテスト用の由緒書きです。\n\n創建は平安時代と伝えられています。',
  images: ['test-image1.jpg', 'test-image2.jpg'],
  visitDate: '2024-01-15',
  tags: ['テストタグ1', 'テストタグ2'],
  website: 'https://example.com',
}

describe('TempleDetail', () => {
  describe('基本表示', () => {
    it('寺社名が表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText('テスト寺')).toBeInTheDocument()
    })

    it('ふりがなが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText('てすとでら')).toBeInTheDocument()
    })

    it('カテゴリが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText('寺院')).toBeInTheDocument()
    })

    it('神社の場合はカテゴリが正しく表示される', () => {
      const shrine = { ...mockTemple, category: 'shrine' as const }
      render(<TempleDetail temple={shrine} onClose={() => {}} />)
      expect(screen.getByText('神社')).toBeInTheDocument()
    })

    it('由緒書きのテキストが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(
        screen.getByText(/これはテスト用の由緒書きです/)
      ).toBeInTheDocument()
    })

    it('住所が表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(
        screen.getByText('京都府京都市北区テスト町1-1')
      ).toBeInTheDocument()
    })

    it('訪問日が表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText(/2024-01-15/)).toBeInTheDocument()
    })

    it('タグが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText('テストタグ1')).toBeInTheDocument()
      expect(screen.getByText('テストタグ2')).toBeInTheDocument()
    })

    it('公式サイトへのリンクが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      const link = screen.getByRole('link', { name: /公式サイト/ })
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('画像表示', () => {
    it('最初の画像が表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      const img = screen.getByAltText('テスト寺 - 画像 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', expect.stringContaining('test-image1.jpg'))
    })

    it('複数の画像がある場合、画像インジケーターが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('次の画像ボタンをクリックすると次の画像が表示される', async () => {
      const user = userEvent.setup()
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)

      const nextButton = screen.getByRole('button', { name: /次の画像/ })
      await user.click(nextButton)

      const img = screen.getByAltText('テスト寺 - 画像 2')
      expect(img).toHaveAttribute('src', expect.stringContaining('test-image2.jpg'))
      expect(screen.getByText('2 / 2')).toBeInTheDocument()
    })

    it('前の画像ボタンをクリックすると前の画像が表示される', async () => {
      const user = userEvent.setup()
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)

      // まず次の画像に移動
      const nextButton = screen.getByRole('button', { name: /次の画像/ })
      await user.click(nextButton)

      // 前の画像に戻る
      const prevButton = screen.getByRole('button', { name: /前の画像/ })
      await user.click(prevButton)

      const img = screen.getByAltText('テスト寺 - 画像 1')
      expect(img).toHaveAttribute('src', expect.stringContaining('test-image1.jpg'))
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('最後の画像で次ボタンを押すと最初の画像に戻る', async () => {
      const user = userEvent.setup()
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)

      const nextButton = screen.getByRole('button', { name: /次の画像/ })

      // 2回クリックして最初に戻る
      await user.click(nextButton)
      await user.click(nextButton)

      const img = screen.getByAltText('テスト寺 - 画像 1')
      expect(img).toHaveAttribute('src', expect.stringContaining('test-image1.jpg'))
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('最初の画像で前ボタンを押すと最後の画像に移動する', async () => {
      const user = userEvent.setup()
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)

      const prevButton = screen.getByRole('button', { name: /前の画像/ })
      await user.click(prevButton)

      const img = screen.getByAltText('テスト寺 - 画像 2')
      expect(img).toHaveAttribute('src', expect.stringContaining('test-image2.jpg'))
      expect(screen.getByText('2 / 2')).toBeInTheDocument()
    })

    it('画像が1枚の場合、画像ナビゲーションボタンが表示されない', () => {
      const singleImageTemple = { ...mockTemple, images: ['test-image1.jpg'] }
      render(<TempleDetail temple={singleImageTemple} onClose={() => {}} />)

      expect(screen.queryByRole('button', { name: /次の画像/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /前の画像/ })).not.toBeInTheDocument()
      expect(screen.queryByText(/1 \/ 1/)).not.toBeInTheDocument()
    })
  })

  describe('モーダル操作', () => {
    it('閉じるボタンが表示される', () => {
      render(<TempleDetail temple={mockTemple} onClose={() => {}} />)
      expect(screen.getByRole('button', { name: /閉じる/ })).toBeInTheDocument()
    })

    it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TempleDetail temple={mockTemple} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /閉じる/ })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('背景をクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TempleDetail temple={mockTemple} onClose={onClose} />)

      const backdrop = screen.getByTestId('modal-backdrop')
      await user.click(backdrop)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('モーダルコンテンツをクリックしてもonCloseが呼ばれない', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TempleDetail temple={mockTemple} onClose={onClose} />)

      const content = screen.getByTestId('modal-content')
      await user.click(content)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('オプショナルフィールド', () => {
    it('訪問日がない場合は表示されない', () => {
      const templeWithoutVisitDate = { ...mockTemple, visitDate: undefined }
      render(<TempleDetail temple={templeWithoutVisitDate} onClose={() => {}} />)
      expect(screen.queryByText(/訪問日/)).not.toBeInTheDocument()
    })

    it('タグがない場合は表示されない', () => {
      const templeWithoutTags = { ...mockTemple, tags: undefined }
      render(<TempleDetail temple={templeWithoutTags} onClose={() => {}} />)
      expect(screen.queryByText('テストタグ1')).not.toBeInTheDocument()
    })

    it('公式サイトがない場合はリンクが表示されない', () => {
      const templeWithoutWebsite = { ...mockTemple, website: undefined }
      render(<TempleDetail temple={templeWithoutWebsite} onClose={() => {}} />)
      expect(screen.queryByRole('link', { name: /公式サイト/ })).not.toBeInTheDocument()
    })
  })
})
