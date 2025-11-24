import { TempleProvider, useTempleContext } from './contexts/TempleContext'
import { MapView } from './components/Map/MapView'
import { TempleDetail } from './components/Temple/TempleDetail'
import { SearchBar } from './components/Search/SearchBar'
import { SearchResults } from './components/Search/SearchResults'
import { useSearch } from './hooks/useSearch'
import type { Temple } from './types/temple'
import './App.css'

function AppContent() {
  const { temples, loading, error, selectedTemple, setSelectedTemple } =
    useTempleContext()

  // 検索機能を使用
  const { query, results, setQuery } = useSearch(temples)

  // MAPのピンをクリックしたときのハンドラー（検索をクリア）
  const handleMapPinClick = (temple: Temple) => {
    setSelectedTemple(temple)
    setQuery('') // 検索をクリアして検索パネルを閉じる
  }

  // 検索結果から選択したときのハンドラー（検索はクリアしない）
  const handleSearchResultClick = (temple: Temple) => {
    setSelectedTemple(temple)
    // 検索結果は残したままにする
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <h2>エラーが発生しました</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          backgroundColor: '#D32F2F',
          color: 'white',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>京都寺社仏閣 由緒書きマップ</h1>
        <p style={{ margin: '4px 0 8px 0', fontSize: '14px' }}>
          {temples.length}件の寺社を表示中
          {selectedTemple && ` - ${selectedTemple.name}を選択中`}
        </p>
        <SearchBar query={query} onQueryChange={setQuery} />
      </header>
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {query && results.length > 0 && (
          <div
            style={{
              width: '350px',
              maxWidth: '40%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: 'white',
              boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            <SearchResults results={results} onTempleClick={handleSearchResultClick} />
          </div>
        )}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapView
            temples={temples}
            onTempleClick={handleMapPinClick}
            selectedTemple={selectedTemple}
          />
        </div>
      </div>
      {selectedTemple && (
        <TempleDetail
          temple={selectedTemple}
          onClose={() => setSelectedTemple(null)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <TempleProvider>
      <AppContent />
    </TempleProvider>
  )
}

export default App
