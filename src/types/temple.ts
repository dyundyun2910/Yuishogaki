// Temple type definitions
// This file defines the data structure for temples and shrines

export type TempleCategory = 'temple' | 'shrine'

export interface Location {
  lat: number
  lng: number
  address: string
}

export interface Temple {
  id: string
  name: string
  nameKana: string
  category: TempleCategory
  location: Location
  description: string
  images: string[]
  visitDate?: string
  tags?: string[]
  website?: string
}

export interface TemplesData {
  temples: Temple[]
}
