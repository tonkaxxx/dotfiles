(function () {
  const previousMutationObserver = window.MutationObserver;
  window.MutationObserver = class extends previousMutationObserver {
    constructor(callback, options) {
      if (callback.toString().toLowerCase().includes("visibility") || callback.toString().toLowerCase().includes("decoy") || callback.toString().toLowerCase().includes("width") || callback.toString().toLowerCase().includes("eea7ed")) {
        callback = () => { };
      }
      super(callback, options);
    }
  };

  const previousWebSocket = window.WebSocket;
  let wsAddListener = previousWebSocket.prototype.addEventListener;
  wsAddListener = wsAddListener.call.bind(wsAddListener);
  window.WebSocket = function WebSocket(url, protocols) {
    if (!(this instanceof WebSocket)) {
      return new WebSocket(url, protocols);
    }

    let ws;
    if (arguments.length === 1) {
      ws = new previousWebSocket(url);
    } else if (arguments.length >= 2) {
      ws = new previousWebSocket(url, protocols);
    } else {
      ws = new previousWebSocket();
    }

    wsAddListener(ws, 'message', function (event) {
      if (event.data.toLowerCase().includes('update_pulse')) {
        let previousPulse = localStorage.getItem('axiom.pulse');
        if (!previousPulse) previousPulse = { content: [] };
        else previousPulse = JSON.parse(previousPulse);
        const newPulseData = JSON.parse(event.data);
        const mergedContents = [...previousPulse.content.filter((t) => !newPulseData.content.some((nt) => nt.tokenAddress === t.tokenAddress)).filter((t) => new Date(t.lastSeen) > new Date(new Date().getTime() - 300e3)), ...newPulseData.content.map((c) => ({ ...c, lastSeen: new Date() }))]
        localStorage.setItem('tradewiz.pulse', JSON.stringify({ content: mergedContents }));
      }
    });
    return ws;
  }
  window.WebSocket.prototype = previousWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;
  const originXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class extends originXHR {
    constructor() {
      super();
      this.addEventListener('load', function () {
        if (this.responseURL.includes('/holder-data-v3')) {
          const holderData = JSON.parse(this.responseText);
          localStorage.setItem('tradewiz.holderData', holderData.map(item => item.walletAddress).join(','));
        } else if (this.responseURL.includes('/top-traders-v3')) {
          const topHolderData = JSON.parse(this.responseText);
          localStorage.setItem('tradewiz.topHolderData', topHolderData.map(item => item.makerAddress).join(','));
        } else if (this.responseURL.includes('/transactions-feed?')) {
          const transactionsFeedData = JSON.parse(this.responseText);
          localStorage.setItem('tradewiz.transactionsFeedData', JSON.stringify(transactionsFeedData));
        } else if (this.responseURL.includes('/pair-info')) {
          const pairInfo = JSON.parse(this.responseText);
          localStorage.setItem('tradewiz.pairInfo', JSON.stringify(pairInfo));
        }
      });
    }
  };

})();
