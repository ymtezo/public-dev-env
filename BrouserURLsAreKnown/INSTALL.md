# インストール手順

## 方法1: Chrome拡張機能として使用（簡易版）

最も簡単な実装方法です。

1. このフォルダをChrome/Braveで読み込む
   - `chrome://extensions` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - このフォルダを選択

2. 拡張機能が有効になると：
   - ページ内リンクのクリックがブロックされます
   - フォーム送信が無効化されます
   - JavaScript による遷移がブロックされます

## 方法2: Chromiumをビルド（完全版）

検索機能を完全に無効化するには、Chromiumのソースコードを修正してビルドする必要があります。

### 前提条件

- Git
- Python 3
- Visual Studio 2022 (Windows)
- 100GB以上の空きディスク容量

### ビルド手順

```bash
# 1. depot_toolsのインストール
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
set PATH=%CD%\depot_tools;%PATH%

# 2. Chromiumソースの取得
mkdir chromium
cd chromium
fetch chromium

# 3. パッチの適用
cd src
git apply ../../chromium-patches/disable-search.patch
git apply ../../chromium-patches/hide-search-settings.patch

# 4. ビルド設定
gn gen out/Default --args="is_component_build=false is_debug=false"

# 5. ビルド実行（数時間かかります）
autoninja -C out/Default chrome

# 6. 実行
out\Default\chrome.exe
```

## 機能確認

拡張機能が正しく動作している場合：

### 許可される操作 ✅
1. ✅ URL直接入力で遷移できる
2. ✅ 外部アプリからのリンクで開ける
3. ✅ ブックマークから開ける
4. ✅ ブラウザの履歴（戻る/進む）が使える
5. ✅ ページリロードができる
6. ✅ フォーム送信ができる

### ブロックされる操作 ❌
1. ❌ ページ内のリンクをクリックしても遷移しない
2. ❌ JavaScriptによる自動遷移が動作しない
3. ❌ 検索クエリが実行されない（完全版のみ）
4. ❌ 設定に検索エンジンオプションが表示されない（完全版のみ）

## 使用例

### 正しい使い方

```
1. アドレスバーに https://example.com と入力 → ✅ 開ける
2. example.com のページ内リンクをクリック → ❌ 遷移しない
3. ブラウザの「戻る」ボタンをクリック → ✅ 戻れる
4. ブックマークから別のサイトを開く → ✅ 開ける
5. 検索フォームに入力してEnter → ✅ 検索できる
6. メールアプリのリンクをクリック → ✅ 開ける
```

## トラブルシューティング

### リンクがブロックされない場合

- 拡張機能が有効になっているか確認
- ページをリロード
- コンソールでエラーメッセージを確認

### Chromiumビルドが失敗する場合

- [Chromium公式ビルドガイド](https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md)を参照
- ディスク容量とメモリを確認
