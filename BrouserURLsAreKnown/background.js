// バックグラウンドスクリプト - ナビゲーション制御

let allowedNavigations = new Set();

// 外部からの遷移を許可
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // トップフレームのみ処理
  if (details.frameId !== 0) return;
  
  const transitionTypes = details.transitionQualifiers || [];
  const transitionType = details.transitionType;
  
  // 許可される遷移タイプ
  // - typed: URL直接入力
  // - from_address_bar: アドレスバーから
  // - auto_bookmark: ブックマークから
  // - reload: ページリロード
  // - form_submit: フォーム送信
  const allowedTypes = [
    'typed',           // URL直接入力
    'from_address_bar', // アドレスバー
    'auto_bookmark',   // ブックマーク
    'reload',          // リロード
    'form_submit'      // フォーム送信
  ];
  
  // 履歴からのアクセスも許可
  const allowedQualifiers = ['from_address_bar', 'forward_back'];
  
  if (allowedTypes.includes(transitionType) || 
      transitionQualifiers.some(q => allowedQualifiers.includes(q))) {
    allowedNavigations.add(details.tabId);
    // 5秒後に削除
    setTimeout(() => allowedNavigations.delete(details.tabId), 5000);
  }
});

// ページ内リンククリックをブロック
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  
  const transitionType = details.transitionType;
  
  // linkクリックの場合
  if (transitionType === 'link') {
    // 許可リストにない場合はブロック
    if (!allowedNavigations.has(details.tabId)) {
      chrome.tabs.goBack(details.tabId).catch(() => {
        // 戻れない場合は空ページ
        chrome.tabs.update(details.tabId, { url: 'about:blank' });
      });
    }
  }
});

// Omniboxでの検索を無効化
chrome.omnibox?.onInputEntered?.addListener((text, disposition) => {
  // URL形式でない場合は無視
  if (!isValidURL(text)) {
    return;
  }
});

function isValidURL(string) {
  try {
    const url = new URL(string.startsWith('http') ? string : 'http://' + string);
    return true;
  } catch (_) {
    return false;
  }
}
