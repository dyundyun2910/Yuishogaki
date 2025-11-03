import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Temple } from '../types/temple'
import { useTemples } from '../hooks/useTemples'

interface TempleContextValue {
  temples: Temple[]
  loading: boolean
  error: string | null
  selectedTemple: Temple | null
  setSelectedTemple: (temple: Temple | null) => void
}

const TempleContext = createContext<TempleContextValue | undefined>(undefined)

interface TempleProviderProps {
  children: ReactNode
}

export function TempleProvider({ children }: TempleProviderProps) {
  const { temples, loading, error } = useTemples()
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null)

  const value: TempleContextValue = {
    temples,
    loading,
    error,
    selectedTemple,
    setSelectedTemple,
  }

  return <TempleContext.Provider value={value}>{children}</TempleContext.Provider>
}

export function useTempleContext(): TempleContextValue {
  const context = useContext(TempleContext)

  if (context === undefined) {
    throw new Error('useTempleContext must be used within a TempleProvider')
  }

  return context
}
