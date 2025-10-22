"use strict";

(() => {
  function navigateToToken(t) {
    var e;
    try {
      if ((e = window.next) != null && e.router && typeof window.next.router.push == "function") {
        window.next.router.push(t);
        return;
      }
      if (window.router && typeof window.router.push == "function") {
        window.router.push(t);
        return;
      }
      history.pushState({}, "", t);
      window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
    } catch (n) {
      history.pushState({}, "", t);
      window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
    }
  }
  window.addEventListener("from-plugin", (e) => {
    navigateToToken(e.detail.path)
  })
})();
