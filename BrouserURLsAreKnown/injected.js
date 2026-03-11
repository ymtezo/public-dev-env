// ページコンテキストに注入されるスクリプト
// window.location等の直接操作をブロック

(function() {
  'use strict';
  
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  // history APIをオーバーライド
  history.pushState = function() {
    console.log('[制限付きブラウザ] history.pushState がブロックされました');
    return;
  };
  
  history.replaceState = function() {
    console.log('[制限付きブラウザ] history.replaceState がブロックされました');
    return;
  };
  
  // window.locationの変更を監視
  let currentLocation = window.location.href;
  
  Object.defineProperty(window, 'location', {
    get: function() {
      return currentLocation;
    },
    set: function(value) {
      console.log('[制限付きブラウザ] window.location の変更がブロックされました:', value);
      return currentLocation;
    }
  });
  
  // window.openをブロック
  const originalOpen = window.open;
  window.open = function(url, target, features) {
    console.log('[制限付きブラウザ] window.open がブロックされました:', url);
    return null;
  };
  
})();
