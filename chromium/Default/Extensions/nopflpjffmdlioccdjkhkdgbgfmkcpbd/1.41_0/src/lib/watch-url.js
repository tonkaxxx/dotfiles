(function () {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      // if (removePlatformStyle) {
      //   removePlatformStyle(platform)
      // }
      if (setPlatformStyle) {
        setPlatformStyle(window.platform)
      }
      lastUrl = currentUrl;
    }
  }).observe(document, { subtree: true, childList: true });

  const pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
  };

  const replaceState = history.replaceState;
  history.replaceState = function () {
    replaceState.apply(history, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  window.addEventListener('locationchange', () => {
    if (setPlatformSignalStyle) {
      setPlatformSignalStyle(platform, null)
    }
    // if (removePlatformStyle) {
    //   removePlatformStyle(platform)
    // }
    if (setPlatformStyle) {
      setPlatformStyle(window.platform)
    }
  });
})();