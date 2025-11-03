import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TempleProvider, useTempleContext } from './TempleContext'
import type { ReactNode } from 'react'

describe('TempleContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TempleProvider', () => {
    it('子コンポーネントにコンテキスト値を提供すること', async () => {
      // Arrange
      const mockData = {
        temples: [
          {
            id: 'test1',
            name: 'テスト寺',
            nameKana: 'てすとじ',
            category: 'temple' as const,
            location: { lat: 35.0, lng: 135.0, address: '京都' },
            description: 'テスト用',
            images: [],
          },
        ],
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      )

      // Act
      const wrapper = ({ children }: { children: ReactNode }) => (
        <TempleProvider>{children}</TempleProvider>
      )

      const { result } = renderHook(() => useTempleContext(), { wrapper })

      // Assert
      await waitFor(() => {
        expect(result.current.temples).toHaveLength(1)
      })

      expect(result.current.temples[0].name).toBe('テスト寺')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('選択された寺社を管理できること', async () => {
      // Arrange
      const mockData = {
        temples: [
          {
            id: 'test1',
            name: 'テスト寺',
            nameKana: 'てすとじ',
            category: 'temple' as const,
            location: { lat: 35.0, lng: 135.0, address: '京都' },
            description: 'テスト用',
            images: [],
          },
        ],
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      )

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TempleProvider>{children}</TempleProvider>
      )

      const { result } = renderHook(() => useTempleContext(), { wrapper })

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.temples).toHaveLength(1)
      })

      // Act - 寺社を選択
      const temple = result.current.temples[0]
      await waitFor(() => {
        result.current.setSelectedTemple(temple)
      })

      // Assert
      await waitFor(() => {
        expect(result.current.selectedTemple).not.toBeNull()
      })
      
      expect(result.current.selectedTemple?.name).toBe('テスト寺')
    })

    it('選択をクリアできること', async () => {
      // Arrange
      const mockData = {
        temples: [
          {
            id: 'test1',
            name: 'テスト寺',
            nameKana: 'てすとじ',
            category: 'temple' as const,
            location: { lat: 35.0, lng: 135.0, address: '京都' },
            description: 'テスト用',
            images: [],
          },
        ],
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      )

      const wrapper = ({ children }: { children: ReactNode }) => (
        <TempleProvider>{children}</TempleProvider>
      )

      const { result } = renderHook(() => useTempleContext(), { wrapper })

      await waitFor(() => {
        expect(result.current.temples).toHaveLength(1)
      })

      // Act - 選択してからクリア
      await waitFor(() => {
        result.current.setSelectedTemple(result.current.temples[0])
      })
      
      await waitFor(() => {
        expect(result.current.selectedTemple).not.toBeNull()
      })

      await waitFor(() => {
        result.current.setSelectedTemple(null)
      })

      // Assert
      await waitFor(() => {
        expect(result.current.selectedTemple).toBeNull()
      })
    })
  })

  describe('useTempleContext', () => {
    it('Providerの外で使用するとエラーをスローすること', () => {
      // Assert
      expect(() => {
        renderHook(() => useTempleContext())
      }).toThrow('useTempleContext must be used within a TempleProvider')
    })
  })
})
