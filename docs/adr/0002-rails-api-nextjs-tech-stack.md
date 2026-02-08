---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0002: Rails 8.1 API-only + Next.js 16 技術スタック

## コンテキストと課題

Railsを学ぶことを主目的としてプロジェクトを開始した。バックエンドにRailsを使うことは前提であり、Railsの利用形態（API-only vs フルスタック）が検討対象だった。開発者の専門性はフロントエンド（TypeScript/React）にあり、実務でもフロントエンドはTypeScriptで開発される可能性が非常に高いため、フロントエンドをRailsから切り離してTypeScriptで構築する構成が現実的だった。

## 検討した選択肢

### 選択肢1: Rails API-only + Next.js

バックエンドにRails 8.1（API-onlyモード）、フロントエンドに慣れたNext.js 16（App Router + React 19）を採用する。

- 良い点: 実務に近い構成（Rails API + TypeScript FE）でRailsを学べる、フロントエンドは専門領域のため素早く構築できる、2つの独立したアプリとして関心が分離される
- 悪い点: 2つの異なる言語・ランタイムの管理が必要

### 選択肢2: Rails フルスタック（Hotwire/Turbo）

Railsのフルスタック構成でHotwire/Turboを使ったフロントエンドを構築する。

- 良い点: 単一言語・単一フレームワーク、Rails標準のワークフローを深く学べる
- 悪い点: Hotwire/Turboも新たに学ぶ必要がありフロントエンド側の学習コストが増える、慣れたReactエコシステムの恩恵を受けられない

## 決定

**選択肢1: Rails API + Next.js** を採用する。

Railsを学ぶのが目的である一方、実務ではフロントエンドをTypeScriptで開発する構成が現実的であるため、RailsをAPI-onlyとしフロントエンドをNext.jsで分離する構成を選んだ。フロントエンドは自身の専門領域であるため学習コストをかけずに済み、Railsの学習に集中できる。

## 結果

### 良い影響

- Railsの規約・設計思想を実プロジェクトを通じて学習できる
- 実務で想定される構成（Rails API + TypeScript FE）を再現しており、学習内容がそのまま実践に活きる
- フロントエンドは専門領域のため素早く構築でき、バックエンドの学習に集中できる
- Rails 8のSolid trifecta（Solid Cache、Solid Queue、Solid Cable）など最新機能を実践的に学べる

### 悪い影響

- Ruby + TypeScriptの2言語管理が必要
- devcontainerでRubyとNode.jsの両ランタイムをセットアップする必要がある

## 補足

- バックエンド: Rails 8.1.2、Ruby 4.0.1、Puma、Kamal + Thruster
- フロントエンド: Next.js 16.1.6、React 19.2.3、TypeScript 5.x
- API通信: JSON over HTTP（REST）
- 関連ADR: [ADR-0001](0001-monorepo-structure.md)、[ADR-0003](0003-sqlite3-for-all-environments.md)
