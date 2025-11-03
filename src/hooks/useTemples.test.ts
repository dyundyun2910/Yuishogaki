import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTemples } from './useTemples'

describe('useTemples', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('初期状態でloadingがtrueであること', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTemples())

      // Assert
      expect(result.current.loading).toBe(true)
      expect(result.current.temples).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('データ読み込み成功', () => {
    it('寺社データを正常に読み込めること', async () => {
      // Arrange
      const mockData = {
        temples: [
          {
            id: 'test1',
            name: 'テスト寺',
            nameKana: 'てすとじ',
            category: 'temple' as const,
            location: { lat: 35.0, lng: 135.0, address: '京都' },
            description: 'テスト用の寺院',
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
      const { result } = renderHook(() => useTemples())

      // Assert - 最初はloading状態
      expect(result.current.loading).toBe(true)

      // Assert - データ読み込み後
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.temples).toHaveLength(1)
      expect(result.current.temples[0].name).toBe('テスト寺')
      expect(result.current.error).toBeNull()
    })

    it('複数の寺社データを読み込めること', async () => {
      // Arrange
      const mockData = {
        temples: [
          {
            id: 'test1',
            name: 'テスト寺',
            nameKana: 'てすとじ',
            category: 'temple' as const,
            location: { lat: 35.0, lng: 135.0, address: '京都' },
            description: 'テスト用の寺院',
            images: [],
          },
          {
            id: 'test2',
            name: 'テスト神社',
            nameKana: 'てすとじんじゃ',
            category: 'shrine' as const,
            location: { lat: 35.1, lng: 135.1, address: '京都' },
            description: 'テスト用の神社',
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
      const { result } = renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(result.current.temples).toHaveLength(2)
      })

      expect(result.current.temples[0].name).toBe('テスト寺')
      expect(result.current.temples[1].name).toBe('テスト神社')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('正しいURLでfetchを呼び出すこと', async () => {
      // Arrange
      const mockData = { temples: [] }
      const fetchMock = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      )
      global.fetch = fetchMock

      // Act
      renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/Yuishogaki/data/temples.json')
      })
    })
  })

  describe('データ読み込み失敗', () => {
    it('ネットワークエラー時にerrorが設定されること', async () => {
      // Arrange
      const errorMessage = 'ネットワークエラー'
      global.fetch = vi.fn(() => Promise.reject(new Error(errorMessage)))

      // Act
      const { result } = renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.error).toContain(errorMessage)
      expect(result.current.temples).toEqual([])
    })

    it('HTTPエラー時にerrorが設定されること', async () => {
      // Arrange
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        } as Response)
      )

      // Act
      const { result } = renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.temples).toEqual([])
    })

    it('JSONパースエラー時にerrorが設定されること', async () => {
      // Arrange
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response)
      )

      // Act
      const { result } = renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.temples).toEqual([])
    })
  })

  describe('空データ', () => {
    it('空の寺社リストを扱えること', async () => {
      // Arrange
      const mockData = { temples: [] }
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
      )

      // Act
      const { result } = renderHook(() => useTemples())

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.temples).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })
})
