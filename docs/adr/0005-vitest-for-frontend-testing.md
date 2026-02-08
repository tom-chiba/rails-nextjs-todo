---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0005: Vitest をフロントエンドテストに採用

## コンテキストと課題

Claude CodeにTDDを前提としたプラグインがあり、それを活用するためにフロントエンドのコンポーネントテスト環境を整備する必要があった。テストランナーとテストユーティリティの選定が必要だった。

## 検討した選択肢

### 選択肢1: Vitest

Vite ベースのテストフレームワーク。ESMネイティブ対応で、TypeScriptの変換が不要。

- 良い点: ネイティブESM対応、TypeScript変換不要で高速、Viteのモジュール解決を活用、HMRによるウォッチモードが高速
- 悪い点: Viteベースのため、webpackベースのNext.jsとモジュール解決が異なる可能性

### 選択肢2: Jest（ts-jest / SWC）

ts-jest または @swc/jest でTypeScriptを変換して実行する構成。テスト業界のデファクトスタンダード。

- 良い点: 圧倒的な利用実績、情報が豊富
- 悪い点: ESMサポートが実験的、TypeScript変換の設定が必要、ウォッチモードの起動が遅い

### 選択肢3: Next.js 組み込みテスト

Next.jsが提供するテスト設定（`next/jest`）を使用する。

- 良い点: Next.js公式サポート、SWCによるTypeScript変換が自動設定
- 悪い点: 内部的にはJestを使用しESMの制約を継承、Next.jsのバージョンに依存

## 決定

**選択肢1: Vitest** を採用する。

テストランナーにはVitestを選んだ。高速な実行速度がTDDのサイクルに適しているため。テストユーティリティにはReact Testing Library（RTL）を選んだ。Reactコンポーネントテストのデファクトスタンダードであり、情報量・安定性ともに申し分ない。

## 結果

### 良い影響

- TypeScriptの追加設定なしにテストが実行可能
- `vitest run`（CI用）と`vitest`（ウォッチモード）のシンプルなコマンド体系
- React Testing Library + jsdom でコンポーネントテストが可能
- テスト実行が高速

### 悪い影響

- Next.js固有の機能（Server Components、Route Handlers等）のテストには追加設定が必要な場合がある

## 補足

- バージョン: Vitest 4.0.18
- テストユーティリティ: `@testing-library/react` 16.3.2、`@testing-library/dom` 10.4.1、`@testing-library/user-event` 14.6.1
- DOM環境: jsdom 28.0.0 + global-jsdom 28.0.0
- コマンド: `npm test`（`vitest run`）、`npm run test:watch`（`vitest`）
- 関連: バックエンドのRubyテストはMinitest（Rails標準）を使用
