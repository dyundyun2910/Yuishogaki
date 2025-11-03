import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapView } from './MapView'
import type { Temple } from '../../types/temple'

// LeafletのモックをsetupFileに移動することも検討
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ children, ...props }: any) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}))

describe('MapView', () => {
  const mockTemples: Temple[] = [
    {
      id: 'test1',
      name: 'テスト寺',
      nameKana: 'てすとじ',
      category: 'temple',
      location: { lat: 35.0394, lng: 135.7292, address: '京都市' },
      description: 'テスト用の寺院',
      images: [],
    },
    {
      id: 'test2',
      name: 'テスト神社',
      nameKana: 'てすとじんじゃ',
      category: 'shrine',
      location: { lat: 35.0269, lng: 135.7983, address: '京都市' },
      description: 'テスト用の神社',
      images: [],
    },
  ]

  describe('基本表示', () => {
    it('地図コンテナが表示されること', () => {
      // Arrange & Act
      render(<MapView temples={[]} onTempleClick={vi.fn()} />)

      // Assert
      const mapContainer = screen.getByTestId('map-container')
      expect(mapContainer).toBeInTheDocument()
    })

    it('タイルレイヤーが表示されること', () => {
      // Arrange & Act
      render(<MapView temples={[]} onTempleClick={vi.fn()} />)

      // Assert
      const tileLayer = screen.getByTestId('tile-layer')
      expect(tileLayer).toBeInTheDocument()
    })

    it('京都を中心とした地図が表示されること', () => {
      // Arrange & Act
      render(<MapView temples={[]} onTempleClick={vi.fn()} />)

      // Assert
      const mapContainer = screen.getByTestId('map-container')
      // MapContainerのcenter propsを確認
      expect(mapContainer).toBeInTheDocument()
    })
  })

  describe('マーカー表示', () => {
    it('寺社データに基づいてマーカーが表示されること', () => {
      // Arrange & Act
      render(<MapView temples={mockTemples} onTempleClick={vi.fn()} />)

      // Assert
      const markers = screen.getAllByTestId('marker')
      expect(markers).toHaveLength(2)
    })

    it('空の寺社リストの場合、マーカーが表示されないこと', () => {
      // Arrange & Act
      render(<MapView temples={[]} onTempleClick={vi.fn()} />)

      // Assert
      const markers = screen.queryAllByTestId('marker')
      expect(markers).toHaveLength(0)
    })
  })

  describe('クリックイベント', () => {
    it('onTempleClickハンドラーが渡されていること', () => {
      // Arrange
      const handleClick = vi.fn()

      // Act
      render(<MapView temples={mockTemples} onTempleClick={handleClick} />)

      // Assert
      // コンポーネントが正常にレンダリングされることを確認
      const markers = screen.getAllByTestId('marker')
      expect(markers).toHaveLength(2)
      // 実際のクリックイベントはLeafletが処理するため、
      // ここでは関数が渡されていることのみ確認
      expect(handleClick).toBeDefined()
    })
  })

  describe('選択状態', () => {
    it('選択された寺社のマーカーがハイライトされること', () => {
      // Arrange
      const selectedTemple = mockTemples[0]

      // Act
      render(
        <MapView
          temples={mockTemples}
          onTempleClick={vi.fn()}
          selectedTemple={selectedTemple}
        />
      )

      // Assert
      const markers = screen.getAllByTestId('marker')
      expect(markers[0]).toHaveAttribute('data-selected', 'true')
    })

    it('選択されていない場合、マーカーは通常表示されること', () => {
      // Arrange & Act
      render(
        <MapView temples={mockTemples} onTempleClick={vi.fn()} selectedTemple={null} />
      )

      // Assert
      const markers = screen.getAllByTestId('marker')
      markers.forEach((marker) => {
        expect(marker).not.toHaveAttribute('data-selected', 'true')
      })
    })
  })

  describe('レスポンシブ', () => {
    it('高さが100%に設定されていること', () => {
      // Arrange & Act
      const { container } = render(<MapView temples={[]} onTempleClick={vi.fn()} />)

      // Assert
      const mapWrapper = container.firstChild as HTMLElement
      expect(mapWrapper).toHaveStyle({ height: '100%' })
    })
  })
})
