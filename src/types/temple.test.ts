import { describe, it, expect } from 'vitest'
import type { Temple, TempleCategory, Location } from './temple'

describe('Temple Types', () => {
  describe('Temple interface', () => {
    it('should accept valid temple object', () => {
      const validTemple: Temple = {
        id: 'kinkakuji',
        name: '金閣寺',
        nameKana: 'きんかくじ',
        category: 'temple',
        location: {
          lat: 35.0394,
          lng: 135.7292,
          address: '京都府京都市北区金閣寺町1',
        },
        description: '正式名称は鹿苑寺',
        images: ['data/images/kinkakuji_01.jpg'],
      }

      expect(validTemple.id).toBe('kinkakuji')
      expect(validTemple.name).toBe('金閣寺')
      expect(validTemple.category).toBe('temple')
      expect(validTemple.location.lat).toBe(35.0394)
    })

    it('should accept temple with optional fields', () => {
      const templeWithOptionalFields: Temple = {
        id: 'test1',
        name: 'テスト寺',
        nameKana: 'てすとじ',
        category: 'shrine',
        location: {
          lat: 35.0,
          lng: 135.0,
          address: '京都',
        },
        description: 'テスト用',
        images: [],
        visitDate: '2024-03-15',
        tags: ['世界遺産'],
        website: 'https://example.com',
      }

      expect(templeWithOptionalFields.visitDate).toBe('2024-03-15')
      expect(templeWithOptionalFields.tags).toContain('世界遺産')
      expect(templeWithOptionalFields.website).toBe('https://example.com')
    })
  })

  describe('TempleCategory type', () => {
    it('should only accept "temple" or "shrine"', () => {
      const templeCategory: TempleCategory = 'temple'
      const shrineCategory: TempleCategory = 'shrine'

      expect(templeCategory).toBe('temple')
      expect(shrineCategory).toBe('shrine')
    })
  })

  describe('Location interface', () => {
    it('should accept valid location object', () => {
      const location: Location = {
        lat: 35.0394,
        lng: 135.7292,
        address: '京都府京都市北区金閣寺町1',
      }

      expect(location.lat).toBe(35.0394)
      expect(location.lng).toBe(135.7292)
      expect(location.address).toBe('京都府京都市北区金閣寺町1')
    })
  })
})
