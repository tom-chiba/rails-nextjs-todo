---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0006: devcontainerによる開発環境統一

## コンテキストと課題

学習用リポジトリのため、開発環境を閉じた環境（コンテナ）にしたかった。ベースは`rails-new`コマンドで生成されるdevcontainer設定であり、そこにNext.jsも使えるようNode.js featureを追加した構成。

## 検討した選択肢

### 選択肢1: rails-new生成のdevcontainer設定を流用

`rails-new`が生成するdevcontainer設定（Dockerfile + compose.yaml + devcontainer.json）をベースに、Node.js featureを追加してNext.jsも動く環境とする。

- 良い点: Railsが推奨する設定に近い構成、featureでNode.jsを追加するだけでFE対応可能、閉じた環境でローカルを汚さない
- 悪い点: Docker必須、初回のコンテナビルドに時間がかかる

### 選択肢2: 本番用Dockerfileをベースにマルチステージビルド

本番用のDockerfileを作成し、compose.yamlのマルチステージビルドで開発環境と本番環境を兼用する。

- 良い点: 開発と本番で同一のDockerfileを管理できる、本番に近い環境で開発可能
- 悪い点: Dockerfileの設計が複雑化する、devcontainerのfeature機能やVS Code統合を活用しにくい

## 決定

**選択肢1: rails-new生成のdevcontainer設定を流用** する。

`rails-new`が生成する設定はRailsが推奨する構成に近く、学習用途としてそのまま採用するのが自然だった。Node.js featureを追加するだけでNext.jsも動く環境になり、最小限の変更で済んだ。

## 結果

### 良い影響

- `devcontainer.json` を開くだけで全開発環境が自動構築される
- Ruby 4.0.1 + Node.js がfeatureとして宣言的に管理される
- VS Code拡張（Biome、GitLens、Git Graph等）が自動インストールされる
- ポート3000（Rails）と3001（Next.js）が自動フォワードされる
- `postCreateCommand` で`bin/setup`が自動実行され、DB初期化まで完了する

### 悪い影響

- Docker Desktop（またはDocker互換環境）のインストールが前提
- 初回のコンテナビルドに時間がかかる

## 補足

- 構成ファイル: `.devcontainer/devcontainer.json`、`.devcontainer/compose.yaml`、`.devcontainer/Dockerfile`
- devcontainer features:
  - `ghcr.io/devcontainers/features/node:1.7.1` — Node.jsランタイム
  - `ghcr.io/rails/devcontainer/features/sqlite3` — SQLite3
  - `ghcr.io/rails/devcontainer/features/activestorage` — ActiveStorage依存
  - `ghcr.io/devcontainers/features/github-cli:1` — GitHub CLI
  - `ghcr.io/devcontainers/features/docker-outside-of-docker:1` — Docker CLI（Kamalデプロイ用）
- VS Code拡張: `biomejs.biome`、`eamodio.gitlens`、`mhutchie.git-graph`、`donjayamanne.githistory`
- 関連ADR: [ADR-0001](0001-monorepo-structure.md)
