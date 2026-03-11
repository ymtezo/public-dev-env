# 制限付きブラウザ (Restricted Browser)

Braveのオープンソース版をベースにした、ページ内遷移を制限するブラウザ実装

## 機能

- 外部アプリからの遷移とURL直接入力のみ許可
- ページ内リンククリックを無効化
- 検索機能の完全無効化
- URL以外の入力を拒否

## 実装内容

### 拡張機能（簡易版）

- `manifest.json`: 拡張機能の設定
- `background.js`: ナビゲーション制御
- `content.js`: ページ内リンクの無効化
- `injected.js`: JavaScript APIのオーバーライド

### Chromiumパッチ（完全版）

- `chromium-patches/disable-search.patch`: 検索機能の無効化
- `chromium-patches/hide-search-settings.patch`: 設定UIの非表示化

## 使用方法

詳細は `INSTALL.md` を参照してください。

### クイックスタート（拡張機能版）

1. Chrome/Braveで `chrome://extensions` を開く
2. デベロッパーモードを有効化
3. このフォルダを読み込む

## 技術詳細

### ブロックされる遷移

- ページ内リンク（`<a href="...">`）のクリック
- `history.pushState()` / `history.replaceState()`
- `window.location` の変更
- `window.open()`

### 許可される遷移

- ✅ アドレスバーからのURL直接入力
- ✅ 外部アプリケーションからのリンク
- ✅ ブックマークからの遷移
- ✅ ブラウザの履歴（戻る/進む）
- ✅ ページリロード（F5、Ctrl+R）
- ✅ フォーム送信（検索フォームなど）

### アクセス方法の例

1. **URL直接入力**: アドレスバーに `https://example.com` と入力
2. **ブックマーク**: ブックマークバーやメニューからクリック
3. **履歴**: ブラウザの戻る/進むボタン、または履歴メニューから選択
4. **外部アプリ**: メールやSlackなどのリンクをクリック
5. **フォーム送信**: 検索ボックスに入力してEnter
6. **リロード**: F5キーやリロードボタン
