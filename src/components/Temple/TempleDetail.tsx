import { useState } from 'react'
import type { Temple } from '../../types/temple'
import './TempleDetail.css'

interface TempleDetailProps {
  temple: Temple
  onClose: () => void
}

export function TempleDetail({ temple, onClose }: TempleDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 画像パスを正規化（Viteのbaseパスを考慮）
  const normalizeImagePath = (path: string) => {
    // 既に絶対パスの場合はそのまま
    if (path.startsWith('http') || path.startsWith('/')) {
      return path
    }
    // 相対パスの場合は "/" を先頭に追加
    return `/${path}`
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % temple.images.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + temple.images.length) % temple.images.length
    )
  }

  const categoryLabel = temple.category === 'temple' ? '寺院' : '神社'
  const hasMultipleImages = temple.images.length > 1

  return (
    <div
      className="modal-backdrop"
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-content" data-testid="modal-content">
        <button className="modal-close-button" onClick={onClose} aria-label="閉じる">
          ×
        </button>

        <div className="temple-detail">
          {/* 画像セクション */}
          <div className="temple-detail-images">
            <img
              src={normalizeImagePath(temple.images[currentImageIndex])}
              alt={`${temple.name} - 画像 ${currentImageIndex + 1}`}
              className="temple-detail-image"
            />
            {hasMultipleImages && (
              <>
                <button
                  className="image-nav-button image-nav-prev"
                  onClick={handlePrevImage}
                  aria-label="前の画像"
                >
                  ‹
                </button>
                <button
                  className="image-nav-button image-nav-next"
                  onClick={handleNextImage}
                  aria-label="次の画像"
                >
                  ›
                </button>
                <div className="image-indicator">
                  {currentImageIndex + 1} / {temple.images.length}
                </div>
              </>
            )}
          </div>

          {/* 情報セクション */}
          <div className="temple-detail-info">
            <div className="temple-detail-header">
              <h2 className="temple-detail-name">{temple.name}</h2>
              <p className="temple-detail-kana">{temple.nameKana}</p>
              <span className="temple-detail-category">{categoryLabel}</span>
            </div>

            <div className="temple-detail-section">
              <h3>由緒</h3>
              <p className="temple-detail-description">{temple.description}</p>
            </div>

            <div className="temple-detail-section">
              <h3>所在地</h3>
              <p>{temple.location.address}</p>
            </div>

            {temple.visitDate && (
              <div className="temple-detail-section">
                <h3>訪問日</h3>
                <p>{temple.visitDate}</p>
              </div>
            )}

            {temple.tags && temple.tags.length > 0 && (
              <div className="temple-detail-section">
                <h3>タグ</h3>
                <div className="temple-detail-tags">
                  {temple.tags.map((tag) => (
                    <span key={tag} className="temple-detail-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {temple.website && (
              <div className="temple-detail-section">
                <a
                  href={temple.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="temple-detail-link"
                >
                  公式サイトを開く
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
