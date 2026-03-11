// Content Script - ページ内リンクの無効化

(function() {
  'use strict';
  
  // injected.jsを注入
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
  
  // すべてのクリックイベントをキャプチャ
  document.addEventListener('click', function(e) {
    // リンク要素を探す
    let target = e.target;
    while (target && target.tagName !== 'A') {
      target = target.parentElement;
    }
    
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href');
      
      // 相対リンクや同一ドメインへのリンクをブロック
      if (href && !isExternalNavigation(href)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('[制限付きブラウザ] ページ内リンクがブロックされました:', href);
        return false;
      }
    }
  }, true);
  
  // フォーム送信は許可（コメントアウト）
  // document.addEventListener('submit', function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   console.log('[制限付きブラウザ] フォーム送信がブロックされました');
  //   return false;
  // }, true);
  
  function isExternalNavigation(href) {
    // javascript:, #, 相対パスなどをブロック
    if (!href || 
        href.startsWith('#') || 
        href.startsWith('javascript:') ||
        href.startsWith('data:') ||
        !href.match(/^https?:\/\//)) {
      return false;
    }
    return true;
  }
  
  // MutationObserverで動的に追加されるリンクも監視
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          disableLinks(node);
        }
      });
    });
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  function disableLinks(element) {
    if (element.tagName === 'A') {
      element.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && !isExternalNavigation(href)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
    }
    
    const links = element.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && !isExternalNavigation(href)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
    });
  }
  
  // 初期ロード時のリンクを無効化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      disableLinks(document.body);
    });
  } else {
    disableLinks(document.body);
  }
})();
