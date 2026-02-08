---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0004: Biome をLinter/Formatterとして採用

## コンテキストと課題

Next.jsフロントエンドのコード品質を維持するために、Linter/Formatterツールを選定する必要があった。Claude CodeのプラグインにBiomeを前提としたものがあり、それを試してみたいという動機があった。

## 検討した選択肢

### 選択肢1: Biome

Rust製の統合Linter/Formatterツール。単一バイナリでlintとformatの両方を実行する。

- 良い点: 単一ツールで完結、Rust製で高速、設定がシンプル（`biome.json` 1ファイル）、Next.js・Reactドメインルールをネイティブサポート
- 悪い点: ESLintプラグインエコシステムへのアクセスが限定的

### 選択肢2: ESLint + Prettier

ESLintでlint、Prettierでフォーマットの組み合わせ。業界標準の構成。

- 良い点: 豊富なプラグインエコシステム、情報が多い
- 悪い点: 2つのツールの設定・競合解決が必要、ESLintの設定が複雑化しやすい、実行速度がBiomeに劣る

### 選択肢3: ESLint flat config のみ

ESLint v9+のflat configを使い、フォーマット機能もESLintに統合する。

- 良い点: 単一ツール、ESLintプラグインが使える
- 悪い点: フォーマット機能はESLintの本来の設計意図から外れる、パフォーマンスがBiomeに劣る

## 決定

**選択肢1: Biome** を採用する。

Claude CodeのプラグインにBiomeを前提としたものがあり、その活用を試みるためBiomeを選んだ。加えて、単一ツールでlint・format・import整理が完結するシンプルさと、Rust製の実行速度も魅力だった。

## 結果

### 良い影響

- `biome.json` 1ファイルのシンプルな設定で運用
- `npm run lint`（チェック）と`npm run format`（自動修正）の明確な分離
- VS Code拡張（`biomejs.biome`）による開発中のリアルタイムフィードバック
- importの自動整理（`organizeImports`）が組み込み

### 悪い影響

- 一部のESLint専用プラグイン（例: eslint-plugin-import の高度なルール）が利用不可

## 補足

- バージョン: Biome 2.2.0
- 設定ファイル: `fe/biome.json`
- 有効ドメイン: `next: "recommended"`、`react: "recommended"`
- VS Code拡張: `biomejs.biome`（devcontainerに組み込み済み）
- 関連: バックエンドのRubyは`rubocop-rails-omakase`を使用（別ツール）
