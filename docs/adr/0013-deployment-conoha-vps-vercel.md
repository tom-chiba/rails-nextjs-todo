---
status: "accepted"
date: 2026-02-14
decision-makers: []
---

# ADR-0013: 本番デプロイ構成 — ConoHa VPS + Vercel

## コンテキストと課題

開発環境（devcontainer）は整備されたが、本番環境へのデプロイ構成が未決定であった。Rails API バックエンドと Next.js フロントエンドそれぞれに適したホスティング先を選定し、SSL 対応・API 接続方式を含めたデプロイアーキテクチャを決定する必要がある。

## 検討した選択肢

### 選択肢1: 全 Vercel

BE・FE ともに Vercel にデプロイする。Rails API は Vercel の Serverless Functions または外部サービスとして動作させる。

- 良い点: インフラ管理が不要、単一プラットフォームで管理が容易
- 悪い点: Rails のサーバーレス実行は非標準、SQLite の永続化が困難、Solid Queue/Cable/Cache が動作しない

### 選択肢2: 全 VPS

BE・FE ともに ConoHa VPS にデプロイする。Kamal で Docker コンテナとして両方を管理する。

- 良い点: 単一サーバーで完結、ネットワーク遅延が最小、インフラ構成がシンプル
- 悪い点: Next.js の SSR/ISR を自前で運用する負担、CDN/エッジ配信の恩恵が得られない、VPS のリソース制約

### 選択肢3: VPS (BE) + Vercel (FE)

BE を Kamal で ConoHa VPS に、FE を Vercel にデプロイする。

- 良い点: 各技術スタックに最適なプラットフォームを選択できる、Next.js は Vercel のエッジ最適化・CDN を活用、Rails は従来型のサーバー運用で SQLite や Solid シリーズが問題なく動作
- 悪い点: 2 つのプラットフォームを管理する必要がある、BE-FE 間のネットワーク遅延

## 決定

**選択肢3: VPS (BE) + Vercel (FE)** を採用する。

Rails API は SQLite・Solid Queue・Solid Cable・Solid Cache に依存しており、永続的なファイルシステムとプロセスが必要なため VPS が適している。Next.js は Vercel がファーストパーティサポートを提供しており、SSR/ISR・エッジ配信・CDN の恩恵を受けられる。

### 具体的な構成

- **BE**: Kamal 2 → ConoHa VPS (160.251.177.3)
  - Docker Hub レジストリ (`chibatomoki/be`)
  - SSL: Let's Encrypt (Thruster 経由で自動取得)
  - ホスト: `rails-nextjs-todo.tom-chiba.com`
  - ストレージ: Docker ボリューム (`be_storage`) で SQLite DB を永続化
- **FE**: Vercel
  - `API_BASE_URL` 環境変数で BE の本番 URL を指定
  - `next.config.ts` の `rewrites` で `/api/*` を BE にプロキシ（CORS 不要、ADR-0012 参照）

## 結果

### 良い影響

- Rails は従来型のサーバー運用で安定稼働し、SQLite・Solid シリーズが問題なく動作する
- Next.js は Vercel の最適化（エッジ配信、ISR、CDN）を享受できる
- API 接続は Next.js rewrites によるプロキシで CORS 設定が不要（ADR に関連する既存の設計判断を踏襲）
- Let's Encrypt による SSL が Thruster 経由で自動管理される

### 悪い影響

- 2 つのプラットフォーム（ConoHa VPS + Vercel）の管理が必要
- BE-FE 間のネットワーク遅延が発生する（同一サーバー構成と比較して）

## 補足

- 前提: ADR-0003（全環境 SQLite3）、ADR-0002（Rails API + Next.js 技術スタック）
- シークレット管理: `.kamal/secrets` で `KAMAL_REGISTRY_PASSWORD` と `RAILS_MASTER_KEY` を管理
