chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "bullx.io") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 3;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "bullx-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "bullx-market-floating-buy"
  window.platformPositionSellLog = "bullx-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "bullx-token") {
      removeQuickPanel();
      createQuickPanel();
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
      return
    } else {
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});
