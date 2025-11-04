import { TempleProvider, useTempleContext } from './contexts/TempleContext'
import { MapView } from './components/Map/MapView'
import { TempleDetail } from './components/Temple/TempleDetail'
import './App.css'

function AppContent() {
  const { temples, loading, error, selectedTemple, setSelectedTemple } =
    useTempleContext()

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
        <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
          {temples.length}件の寺社を表示中
          {selectedTemple && ` - ${selectedTemple.name}を選択中`}
        </p>
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          temples={temples}
          onTempleClick={setSelectedTemple}
          selectedTemple={selectedTemple}
        />
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
