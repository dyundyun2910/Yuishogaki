# 京都寺社仏閣 由緒書きマップ

京都の寺社仏閣で撮影した由緒書きをデジタルアーカイブ化し、地図上で参照できるWebアプリケーションです。

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📖 概要

このプロジェクトは、京都の寺社仏閣の由緒書きを写真とテキストで記録し、インタラクティブな地図上で閲覧・検索できるWebアプリケーションです。サーバーレスで動作し、GitHub Pagesでホスティングされます。

## ✨ 主要機能

- 🗺️ **地図表示**: 京都の地図上に寺社仏閣をマーカーで表示
- 🔍 **全文検索**: 寺社名や由緒書きの内容で検索可能
- 📷 **画像表示**: 由緒書きの写真を高解像度で表示
- 📱 **レスポンシブ**: PC・スマートフォンの両方に対応
- 🚀 **高速**: 完全クライアントサイドで動作

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite 5
- **地図**: Leaflet + React-Leaflet
- **検索**: Fuse.js
- **UI**: Material-UI (MUI)
- **ホスティング**: GitHub Pages

## 📦 セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/<username>/Yuishogaki.git
cd Yuishogaki

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 🚀 デプロイ

GitHub Pagesへのデプロイは自動化されています。

```bash
# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ (GitHub Actionsで自動実行)
git push origin main
```

## 📂 プロジェクト構成

```
Yuishogaki/
├── public/
│   └── data/
│       ├── temples.json      # 寺社データ
│       └── images/           # 由緒書き画像
├── src/
│   ├── components/           # Reactコンポーネント
│   ├── contexts/             # Context API
│   ├── hooks/                # カスタムフック
│   ├── types/                # TypeScript型定義
│   └── utils/                # ユーティリティ関数
├── DESIGN.md                 # 設計ドキュメント
└── README.md                 # このファイル
```

## 📝 データの追加方法

1. 由緒書きの写真を `public/data/images/` に配置
2. `public/data/temples.json` に新規エントリを追加:

```json
{
  "id": "unique-id",
  "name": "寺社名",
  "nameKana": "ふりがな",
  "category": "temple",
  "location": {
    "lat": 35.0394,
    "lng": 135.7292,
    "address": "京都府..."
  },
  "description": "由緒書きの内容",
  "images": ["data/images/photo.jpg"],
  "visitDate": "2024-03-15",
  "tags": ["タグ1", "タグ2"]
}
```

3. Gitにコミット＆プッシュ

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# Linting
npm run lint

# 型チェック
npm run type-check
```

## 📄 ドキュメント

詳細な設計ドキュメントは [DESIGN.md](./DESIGN.md) を参照してください。

## 🤝 コントリビューション

個人プロジェクトですが、友人からの寺社情報の提供を歓迎します。

## 📜 ライセンス

MIT License

## 👤 作成者

個人プロジェクト（大学の友人5名程度で使用）

## 🙏 謝辞

- 京都の寺社仏閣の皆様
- OpenStreetMap コミュニティ
- オープンソースライブラリの開発者の皆様

---

**注意**: このアプリケーションは個人的な記録用途です。由緒書きの内容は各寺社に著作権がある可能性がありますので、公開時は十分ご注意ください。
