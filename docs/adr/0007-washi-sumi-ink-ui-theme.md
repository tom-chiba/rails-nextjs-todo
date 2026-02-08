---
status: accepted
date: 2026-02-07
decision-makers: []
---

# ADR-0007: 和紙×墨インクUIテーマ

## コンテキストと課題

Claude Codeのプラグイン`frontend-design`でどのようなデザインが生成できるかを試す目的で、UIテーマの生成を行った。事前にテーマを検討して選んだのではなく、プラグインの出力結果をそのまま採用した。

## 検討した選択肢

この決定は通常の選択肢比較ではなく、`frontend-design`プラグインの実験結果として生まれたもの。プラグインが和紙×墨インクをモチーフとしたテーマを生成し、その品質が十分だったためそのまま採用した。

## 決定

**Claude Codeの`frontend-design`プラグインが生成した和紙×墨インクテーマ** をそのまま採用する。

プラグインの出力として、和紙（washi）のクリーム色と墨（sumi ink）の黒を基調に、朱印（vermillion seal）をアクセントとしたテーマが生成された。CSS custom properties + Tailwind CSS v4の`@theme inline`で実装されており、ダークモード対応も含まれていた。

## 結果

### 良い影響

- 和紙の質感（ノイズテクスチャオーバーレイ）による独自の視覚体験
- 墨インクの濃淡（`ink-black`〜`ink-faint`）による自然な階調表現
- 朱印モチーフのチェックボックス（`todo-checkbox`）など、テーマに沿ったカスタムコンポーネント
- ブラシストローク風アニメーション（`brush-reveal`、`ink-drop`）による和の動き表現
- ダークモードが CSS変数の切り替えだけで完結

### 悪い影響

- デザイントークンとカスタムCSSの維持管理が必要
- コンポーネントライブラリの導入時にテーマ統合の作業が発生する

## 補足

- テーマ定義: `fe/app/globals.css`
- カラーパレット:
  - 和紙系: `--washi-cream: #f5f0e8`、`--washi-warm: #ece5d8`、`--washi-highlight: #faf7f0`
  - 墨系: `--ink-black: #1a1a1a` 〜 `--ink-faint: #b8b0a4`
  - 朱色: `--accent-vermillion: #c23b22`
- カスタムアニメーション: `brush-reveal`、`ink-drop`、`fade-in`
- カスタムコンポーネント: `.todo-checkbox`（朱印風）、`.ink-input`（墨下線）、`.todo-done-text`（筆ストローク取り消し線）
- フォント: Zen Kaku Gothic New（本文）、DM Serif Display（見出し）
- Tailwind CSS v4統合: `@theme inline` ブロックでカスタムプロパティをTailwindユーティリティとして利用可能
