(function () {
  const setInterval = window.setInterval;
  window.setInterval = (callback, delay) => {
    return setInterval(callback, delay);
  };
  const previousRequestIdleCallback = window.requestIdleCallback;
  window.requestIdleCallback = (callback, options) => {
    if (callback.toString().includes('&&o()')) {
      return;
    }
    return previousRequestIdleCallback(callback, options);
  };
  const previousElementQuerySelectorAll = Element.prototype.querySelectorAll;
  Element.prototype.querySelectorAll = function (selector) {
    const elements = previousElementQuerySelectorAll.call(this, selector);
    return Array.from(elements);
  };
  const previousDocumentQuerySelectorAll = document.querySelectorAll;
  document.querySelectorAll = function (selector) {
    const elements = previousDocumentQuerySelectorAll.call(this, selector);
    return Array.from(elements);
  };
  const setTimeout = window.setTimeout;
  window.setTimeout = function (callback, delay, ...args) {
    if (delay > 500) {
      return setTimeout(callback, 0, ...args);
    }
    return setTimeout(callback, delay, ...args);
  };
})();