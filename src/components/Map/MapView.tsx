import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Temple } from '../../types/temple'
import 'leaflet/dist/leaflet.css'

// デフォルトマーカーアイコンの設定
// Leafletのデフォルトアイコンパスの問題を修正
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// デフォルトアイコンの設定
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// 選択されたマーカーのアイコン（色を変える場合は別の画像を使用）
const selectedIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [30, 49], // 少し大きく
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
})

interface MapViewProps {
  temples: Temple[]
  onTempleClick: (temple: Temple) => void
  selectedTemple?: Temple | null
}

export function MapView({ temples, onTempleClick, selectedTemple }: MapViewProps) {
  // 京都市の中心座標
  const kyotoCenter: [number, number] = [35.0116, 135.7681]
  const defaultZoom = 12

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={kyotoCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {temples.map((temple) => {
          const isSelected = selectedTemple?.id === temple.id
          const icon = isSelected ? selectedIcon : defaultIcon

          return (
            <Marker
              key={temple.id}
              position={[temple.location.lat, temple.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onTempleClick(temple),
              }}
              // テスト用の属性
              {...(isSelected ? { 'data-selected': 'true' } : {})}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                    {temple.name}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                    {temple.nameKana}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                    {temple.location.address}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {temple.description.substring(0, 100)}
                    {temple.description.length > 100 ? '...' : ''}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
