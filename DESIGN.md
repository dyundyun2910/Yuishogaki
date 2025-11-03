# 京都寺社仏閣 由緒書きマップ - デザインドキュメント

## 1. プロジェクト概要

### 1.1 目的
京都の寺社仏閣で撮影した由緒書きの写真をデジタルアーカイブ化し、地図上にマッピングして参照できるWebアプリケーションを構築する。

### 1.2 ユーザー
- 個人利用（本人 + 大学の友人 5名程度）
- 京都の寺社仏閣に興味がある人

### 1.3 主要機能
1. 地図上に寺社仏閣をマーカーで表示
2. マーカークリックで由緒書きの写真と内容を表示
3. 由緒書き内容の全文検索機能
4. レスポンシブデザイン（モバイル対応）

---

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: React 18.x
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 5.x
- **地図ライブラリ**: React-Leaflet + Leaflet
- **検索ライブラリ**: Fuse.js（軽量な全文検索）※未実装
- **状態管理**: React Context API (小規模のため)
- **テスト**: Vitest + React Testing Library

### 2.2 ホスティング
- **プラットフォーム**: GitHub Pages
- **デプロイ**: GitHub Actions による自動デプロイ
- **ドメイン**: `<username>.github.io/Yuishogaki`

### 2.3 データ管理
- **形式**: JSON
- **構造**: 
  - `data/temples.json` - 寺社仏閣の基本情報
  - `data/images/` - 由緒書きの画像ファイル
- **バージョン管理**: Git/GitHub

---

## 3. システム設計

### 3.1 アーキテクチャ
```
┌─────────────────────────────────────┐
│         GitHub Pages (CDN)          │
│  - index.html                       │
│  - JavaScript Bundle (React App)   │
│  - CSS                              │
│  - data/temples.json                │
│  - data/images/*.jpg                │
└─────────────────────────────────────┘
           ↓ HTTP(S)
┌─────────────────────────────────────┐
│      User's Web Browser             │
│  - React Application                │
│  - Leaflet Map                      │
│  - Fuse.js Search Engine            │
└─────────────────────────────────────┘
```

**完全クライアントサイドアプリケーション** - サーバーサイド処理なし

### 3.2 データモデル

#### Temple Interface (TypeScript)
```typescript
interface Temple {
  id: string;                    // 一意識別子
  name: string;                  // 寺社名
  nameKana: string;              // ふりがな
  category: 'temple' | 'shrine'; // 寺/神社
  location: {
    lat: number;                 // 緯度
    lng: number;                 // 経度
    address: string;             // 住所
  };
  description: string;           // 由緒書きのテキスト（全文検索対象）
  images: string[];              // 画像ファイルパス配列
  visitDate?: string;            // 訪問日 (ISO 8601形式)
  tags?: string[];               // タグ（例: 世界遺産, 紅葉の名所）
  website?: string;              // 公式サイトURL
}
```

#### 初期データ例 (data/temples.json)
```json
{
  "temples": [
    {
      "id": "kinkakuji",
      "name": "金閣寺（鹿苑寺）",
      "nameKana": "きんかくじ（ろくおんじ）",
      "category": "temple",
      "location": {
        "lat": 35.0394,
        "lng": 135.7292,
        "address": "京都府京都市北区金閣寺町1"
      },
      "description": "正式名称は鹿苑寺。足利義満が1397年に建立した別荘を、その死後禅寺としたもの。金箔を貼った舎利殿「金閣」が有名で、世界文化遺産に登録されている。",
      "images": ["data/images/kinkakuji_01.jpg"],
      "visitDate": "2024-03-15",
      "tags": ["世界遺産", "金閣", "足利義満"],
      "website": "https://www.shokoku-ji.jp/kinkakuji/"
    }
  ]
}
```

### 3.3 ディレクトリ構成
```
Yuishogaki/
├── public/
│   └── data/
│       ├── temples.json          # 寺社データ
│       └── images/               # 由緒書き画像
│           ├── kinkakuji_01.jpg
│           └── ...
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.tsx       # 地図コンポーネント
│   │   │   └── MapMarker.tsx     # マーカーコンポーネント
│   │   ├── Search/
│   │   │   └── SearchBar.tsx     # 検索バー
│   │   ├── Temple/
│   │   │   ├── TempleDetail.tsx  # 詳細表示パネル
│   │   │   └── TempleList.tsx    # リスト表示
│   │   └── Layout/
│   │       ├── Header.tsx        # ヘッダー
│   │       └── Sidebar.tsx       # サイドバー
│   ├── contexts/
│   │   └── TempleContext.tsx     # データ管理コンテキスト
│   ├── hooks/
│   │   ├── useTemples.ts         # データ取得フック
│   │   └── useSearch.ts          # 検索フック
│   ├── types/
│   │   └── temple.ts             # 型定義
│   ├── utils/
│   │   └── searchEngine.ts       # Fuse.js設定
│   ├── App.tsx                   # メインアプリ
│   ├── main.tsx                  # エントリーポイント
│   └── index.css                 # グローバルスタイル
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages デプロイ設定
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── DESIGN.md                     # このドキュメント
└── README.md
```

---

## 4. 主要機能の詳細設計

### 4.1 地図表示機能
- **使用ライブラリ**: React-Leaflet
- **ベースマップ**: OpenStreetMap
- **デフォルト中心**: 京都市中心（北緯35.0116, 東経135.7681）
- **ズームレベル**: 初期値 12

**実装ポイント:**
- カスタムマーカーアイコン（寺と神社で色分け）
- マーカークリックでポップアップ表示
- クラスター表示（マーカーが密集している場合）

### 4.2 検索機能
- **検索対象フィールド**:
  - 寺社名 (name)
  - ふりがな (nameKana)
  - 由緒書き本文 (description)
  - タグ (tags)
  - 住所 (location.address)

- **検索オプション**:
  - あいまい検索（Fuse.js threshold: 0.3）
  - 日本語対応
  - リアルタイム検索（入力中に結果更新）

**Fuse.js 設定例:**
```typescript
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'nameKana', weight: 0.2 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.1 },
    { name: 'location.address', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true
};
```

### 4.3 詳細表示機能
- **表示内容**:
  - 寺社名・ふりがな
  - カテゴリ（寺/神社）
  - 由緒書き画像（スライダー形式で複数対応）
  - テキスト化された由緒書き
  - 住所
  - 訪問日
  - タグ
  - 公式サイトへのリンク

- **表示方法**:
  - モーダルダイアログ（PC）
  - ボトムシート（モバイル）

### 4.4 リスト表示機能
- サイドバーまたはドロワーに一覧表示
- カード形式
- ソート機能（名前順、訪問日順）
- フィルター機能（寺/神社、タグ）

---

## 5. UI/UX設計

### 5.1 レイアウト

#### デスクトップ版
```
┌────────────────────────────────────────┐
│  Header (タイトル + 検索バー)           │
├──────────┬─────────────────────────────┤
│          │                             │
│ Sidebar  │      Map View               │
│ (リスト)  │                             │
│          │                             │
│          │                             │
└──────────┴─────────────────────────────┘
```

#### モバイル版
```
┌────────────────────┐
│  Header            │
│  検索バー           │
├────────────────────┤
│                    │
│    Map View        │
│    (全画面)         │
│                    │
│                    │
└────────────────────┘
 (ドロワーメニューで)
 (リスト表示)
```

### 5.2 カラースキーム
- **プライマリカラー**: #D32F2F (赤 - 神社の鳥居をイメージ)
- **セカンダリカラー**: #FFA000 (琥珀色 - 寺院の金箔をイメージ)
- **背景色**: #FAFAFA (明るいグレー)
- **テキスト**: #212121 (ダークグレー)

### 5.3 アクセシビリティ
- WAI-ARIA準拠
- キーボードナビゲーション対応
- 画像にalt属性を設定
- 十分なコントラスト比

---

## 6. データ管理フロー

### 6.1 新規データ追加フロー（自動生成 - 推奨）
1. 写真を `public/data/images/` に配置
2. EXIF情報から位置情報を抽出
   ```bash
   npm run generate:temples
   ```
   - GPS座標（緯度・経度）の取得
   - 撮影日時の取得
   - 近い位置の画像を自動グループ化
3. Gemini AIで画像から寺社情報を取得
   - 寺社名、ふりがな
   - カテゴリ（寺/神社）
   - 由緒書きの内容（OCR + 要約）
   - タグ、公式サイト
4. 2つのJSONをマージ
   ```bash
   npm run merge:temples
   ```
   - EXIF位置情報 + Gemini寺社情報
   - 画像ファイル名で自動マッチング
5. Gitコミット・プッシュ
6. GitHub Actionsで自動デプロイ

### 6.2 新規データ追加フロー（手動）
1. 写真をリサイズ・最適化（推奨: 1200px幅）
2. `public/data/images/` に画像を配置
3. OCRツール等で由緒書きをテキスト化
4. `public/data/temples.json` に新規エントリ追加
5. Gitコミット・プッシュ
6. GitHub Actionsで自動デプロイ

### 6.3 データ編集
- JSONファイルを直接編集
- VSCodeの JSON Schema検証を活用
- または生成スクリプトを再実行

---

## 7. 開発方針

### 7.1 テスト駆動開発（TDD）
本プロジェクトは**テスト駆動開発（Test-Driven Development）**で進めます。

#### TDDサイクル
1. **Red**: テストを書く（失敗することを確認）
2. **Green**: 最小限のコードで実装（テストを通す）
3. **Refactor**: コードをリファクタリング（テストは通ったまま）

#### テスト戦略
- **単体テスト（Unit Tests）**: 各関数・コンポーネントの個別機能
- **統合テスト（Integration Tests）**: コンポーネント間の連携
- **E2Eテスト（End-to-End Tests）**: ユーザーシナリオ全体（オプション）

#### テストツール
- **テストランナー**: Vitest（Viteと統合）
- **Reactテスト**: React Testing Library
- **アサーション**: Vitest標準のexpect
- **モック**: Vitest標準のvi
- **カバレッジ**: @vitest/coverage-v8

#### テスト構成
```
src/
├── components/
│   ├── Map/
│   │   ├── MapView.tsx
│   │   ├── MapView.test.tsx      # テストファイル
│   │   ├── MapMarker.tsx
│   │   └── MapMarker.test.tsx
│   ├── Search/
│   │   ├── SearchBar.tsx
│   │   └── SearchBar.test.tsx
│   └── Temple/
│       ├── TempleDetail.tsx
│       ├── TempleDetail.test.tsx
│       ├── TempleList.tsx
│       └── TempleList.test.tsx
├── hooks/
│   ├── useTemples.ts
│   ├── useTemples.test.ts
│   ├── useSearch.ts
│   └── useSearch.test.ts
└── utils/
    ├── searchEngine.ts
    └── searchEngine.test.ts
```

#### テストカバレッジ目標
- **全体**: 80%以上
- **ビジネスロジック（utils, hooks）**: 90%以上
- **コンポーネント**: 70%以上

### 7.2 開発フェーズ

### Phase 1: 環境構築とテスト基盤（Week 1） ✅ 完了
- [x] Vite + React + TypeScript プロジェクト作成
- [x] Vitest + React Testing Library セットアップ
- [x] ESLint + Prettier 設定
- [x] 基本的なディレクトリ構造構築
- [x] サンプルテスト作成（動作確認）
- [x] サンプルデータ（3-5件）の作成

**TDD実践:**
```
1. テスト: データ型定義のテスト
2. 実装: Temple型の定義
3. リファクタ: 型の整理
```
**成果:** 全4テスト成功

#### Phase 2: データ管理機能（Week 2） ✅ 完了
- [x] Temple型定義のテスト作成
- [x] Temple型の実装
- [x] データ読み込みフック（useTemples）のテスト作成
- [x] useTemplesの実装
- [x] TempleContextのテスト作成
- [x] TempleContextの実装

**TDD実践:**
```
1. テスト: JSONデータを読み込めることをテスト
2. 実装: データ読み込み処理
3. リファクタ: エラーハンドリング追加
```
**成果:** useTemples 8テスト成功、TempleContext 4テスト成功

#### Phase 3: 地図表示機能（Week 3） ✅ 完了
- [x] MapViewコンポーネントのテスト作成
- [x] MapView基本実装
- [x] MapMarkerコンポーネントのテスト作成
- [x] MapMarker実装
- [x] マーカークリックイベントのテスト
- [x] イベントハンドラ実装
- [x] App.tsxとの統合

**TDD実践:**
```
1. テスト: マーカーが正しい位置に表示されることをテスト
2. 実装: Leafletマーカー描画
3. リファクタ: カスタムアイコン対応
```
**成果:** MapView 9テスト成功、実際のアプリケーションとして動作

#### Phase 4: データ生成ツール（Week 4） ✅ 完了
- [x] EXIF情報抽出スクリプト作成
- [x] 画像から位置情報を取得
- [x] 位置情報でグループ化
- [x] Gemini AI連携用マージスクリプト作成
- [x] npm scriptsへの統合

**成果:** 
- `npm run generate:temples` - EXIF情報からJSONを自動生成
- `npm run merge:temples` - Gemini AIのデータとマージ
- 112枚の画像ファイルを管理可能に

#### Phase 5: 詳細表示機能（Week 5） 🚧 次のステップ
- [ ] TempleDetailコンポーネントのテスト作成
- [ ] TempleDetail実装
- [ ] モーダル開閉のテスト
- [ ] モーダル機能実装
- [ ] レスポンシブデザイン対応

**TDD実践:**
```
1. テスト: 選択した寺社の詳細が表示されることをテスト
2. 実装: 詳細表示UI
3. リファクタ: 画像スライダー追加
```

#### Phase 6: 検索機能（Week 6） 📋 予定
- [ ] searchEngine（Fuse.js統合）のテスト作成
- [ ] searchEngine実装
- [ ] useSearchフックのテスト作成
- [ ] useSearch実装
- [ ] SearchBarコンポーネントのテスト作成
- [ ] SearchBar実装
- [ ] 検索結果表示のテスト
- [ ] 検索結果UI実装

**TDD実践:**
```
1. テスト: キーワードで正しく検索できることをテスト
2. 実装: Fuse.js統合
3. リファクタ: あいまい検索の精度調整
```

#### Phase 7: リスト表示とフィルター（Week 7） 📋 予定
- [ ] TempleListコンポーネントのテスト作成
- [ ] TempleList実装
- [ ] ソート機能のテスト
- [ ] ソート機能実装
- [ ] フィルター機能のテスト
- [ ] フィルター機能実装

**TDD実践:**
```
1. テスト: リストがソートできることをテスト
2. 実装: ソート処理
3. リファクタ: 複数条件ソート対応
```

#### Phase 8: デプロイとCI/CD（Week 8） 📋 予定
- [ ] GitHub Pages設定
- [ ] GitHub Actions CI/CD構築
- [ ] テスト自動実行設定
- [ ] カバレッジレポート生成
- [ ] 実データ投入
- [ ] E2Eテスト（オプション）

#### Phase 9: 改善と拡張（継続） 📋 予定
- [ ] パフォーマンス最適化
- [ ] PWA化（オフライン対応）
- [ ] データ編集UI（将来的に）
- [ ] 追加機能のテスト作成と実装

### 7.3 TDD実践例

#### 例1: useTemplesフックのテスト

```typescript
// src/hooks/useTemples.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTemples } from './useTemples';

describe('useTemples', () => {
  it('should load temples data successfully', async () => {
    // Arrange
    const mockData = {
      temples: [
        {
          id: 'test1',
          name: 'テスト寺',
          location: { lat: 35.0, lng: 135.0, address: '京都' }
        }
      ]
    };
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData)
      })
    );

    // Act
    const { result } = renderHook(() => useTemples());

    // Assert
    await waitFor(() => {
      expect(result.current.temples).toHaveLength(1);
      expect(result.current.temples[0].name).toBe('テスト寺');
    });
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useTemples());
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    global.fetch = vi.fn(() => Promise.reject('API Error'));
    const { result } = renderHook(() => useTemples());
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

#### 例2: searchEngine関数のテスト

```typescript
// src/utils/searchEngine.test.ts
import { describe, it, expect } from 'vitest';
import { createSearchEngine, search } from './searchEngine';
import { Temple } from '../types/temple';

describe('searchEngine', () => {
  const mockTemples: Temple[] = [
    {
      id: '1',
      name: '金閣寺',
      nameKana: 'きんかくじ',
      description: '足利義満が建立した寺院',
      category: 'temple',
      location: { lat: 35.0, lng: 135.0, address: '京都市北区' },
      images: []
    },
    {
      id: '2',
      name: '銀閣寺',
      nameKana: 'ぎんかくじ',
      description: '足利義政が建立した寺院',
      category: 'temple',
      location: { lat: 35.0, lng: 135.0, address: '京都市左京区' },
      images: []
    }
  ];

  it('should search by temple name', () => {
    const engine = createSearchEngine(mockTemples);
    const results = search(engine, '金閣');
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('金閣寺');
  });

  it('should search by description', () => {
    const engine = createSearchEngine(mockTemples);
    const results = search(engine, '足利義満');
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('金閣寺');
  });

  it('should return empty array for no matches', () => {
    const engine = createSearchEngine(mockTemples);
    const results = search(engine, 'xyz123');
    
    expect(results).toHaveLength(0);
  });

  it('should support fuzzy search', () => {
    const engine = createSearchEngine(mockTemples);
    const results = search(engine, 'きんかく');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('金閣寺');
  });
});
```

#### 例3: MapMarkerコンポーネントのテスト

```typescript
// src/components/Map/MapMarker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapContainer } from 'react-leaflet';
import { MapMarker } from './MapMarker';
import { Temple } from '../../types/temple';

describe('MapMarker', () => {
  const mockTemple: Temple = {
    id: 'test1',
    name: 'テスト寺',
    nameKana: 'てすとじ',
    category: 'temple',
    location: { lat: 35.0, lng: 135.0, address: '京都' },
    description: 'テスト用の寺院',
    images: []
  };

  it('should render marker at correct position', () => {
    const { container } = render(
      <MapContainer center={[35.0, 135.0]} zoom={13}>
        <MapMarker temple={mockTemple} />
      </MapContainer>
    );
    
    const marker = container.querySelector('.leaflet-marker-icon');
    expect(marker).toBeInTheDocument();
  });

  it('should call onClick handler when marker is clicked', () => {
    const handleClick = vi.fn();
    
    render(
      <MapContainer center={[35.0, 135.0]} zoom={13}>
        <MapMarker temple={mockTemple} onClick={handleClick} />
      </MapContainer>
    );
    
    const marker = screen.getByRole('button');
    fireEvent.click(marker);
    
    expect(handleClick).toHaveBeenCalledWith(mockTemple);
  });

  it('should display temple name in popup', () => {
    render(
      <MapContainer center={[35.0, 135.0]} zoom={13}>
        <MapMarker temple={mockTemple} />
      </MapContainer>
    );
    
    const marker = screen.getByRole('button');
    fireEvent.click(marker);
    
    expect(screen.getByText('テスト寺')).toBeInTheDocument();
  });
});
```

### 7.4 継続的インテグレーション

#### GitHub Actions設定例

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 8. 非機能要件

### 8.1 パフォーマンス
- 初期ロード時間: 3秒以内
- 検索レスポンス: 100ms以内
- 画像最適化: WebP形式、遅延読み込み

### 8.2 ブラウザ対応
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- モバイルブラウザ (iOS Safari, Chrome for Android)

### 8.3 セキュリティ
- HTTPS必須（GitHub Pagesはデフォルト対応）
- XSS対策（Reactのデフォルトエスケープ）
- 個人情報は含めない

### 8.4 保守性
- TypeScriptによる型安全性
- ESLint + Prettierによるコード品質維持
- コンポーネントの単体テスト（Vitest + React Testing Library）
- テスト駆動開発（TDD）による品質保証
- 継続的インテグレーション（CI）による自動テスト

---

## 9. 将来の拡張案

### 9.1 短期的な拡張
- 訪問済み/未訪問のフラグ機能
- お気に入り機能（LocalStorage）
- 地図の印刷機能
- ルート案内（外部地図アプリ連携）

### 9.2 中長期的な拡張
- PWA化（オフライン閲覧）
- 写真のギャラリー表示
- ユーザー投稿機能（GitHub Issues/Discussions連携）
- 他地域への展開（奈良、鎌倉など）
- AI要約機能（由緒書きの自動要約）

---

## 10. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| 画像サイズが大きくページが重い | 高 | 画像最適化（WebP、遅延読み込み） |
| データ件数増加による検索遅延 | 中 | Fuse.jsの設定最適化、仮想スクロール |
| GitHub Pagesの容量制限（1GB） | 中 | 画像圧縮、外部ストレージ検討 |
| 位置情報の不正確さ | 低 | Google Mapsで確認後入力 |

---

## 11. 参考リソース

### 技術ドキュメント
- [React公式ドキュメント](https://react.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Fuse.js Documentation](https://fusejs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Pages ドキュメント](https://docs.github.com/pages)

### データソース候補
- OpenStreetMap（位置情報）
- 京都観光オフィシャルサイト
- 各寺社の公式サイト
- Gemini AI（画像認識・OCR）

### 使用ツール
- **画像処理**: exif-parser（EXIF情報抽出）
- **OCR**: Gemini AI（由緒書きテキスト化）
- **地図**: Leaflet + OpenStreetMap
- **検索**: Fuse.js（軽量全文検索）
- **テスト**: Vitest + React Testing Library

---

## 付録A: 環境変数

GitHub Pages向けの環境変数設定（不要な場合もあるが念のため）:

```bash
# .env.production
VITE_APP_TITLE=京都寺社仏閣 由緒書きマップ
VITE_BASE_URL=/Yuishogaki/
```

---

## 付録B: 必要なnpmパッケージ

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "fuse.js": "^7.0.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.8",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-testing-library": "^6.2.0"
  }
}
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2024-11-03 | 1.3 | Phase 4完了、データ生成ツール追加 | GitHub Copilot CLI |
| 2024-11-03 | 1.2 | Phase 3完了、地図表示機能実装 | GitHub Copilot CLI |
| 2024-11-03 | 1.1 | Phase 2完了、データ管理機能実装 | GitHub Copilot CLI |
| 2024-11-03 | 1.0 | 初版作成 | GitHub Copilot CLI |

