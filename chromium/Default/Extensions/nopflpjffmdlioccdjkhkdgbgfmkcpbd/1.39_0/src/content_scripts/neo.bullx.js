chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "neo.bullx.io") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platformButtonClassName = "cls-" + Math.random().toString(36).substring(2, 10);
  window.platform = 2;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "neo-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "neo-market-floating-buy"
  window.platformPositionSellLog = "neo-position-sell"

  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }

  async function findTokenContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const content = document.querySelector(".ant-layout-content");
      const grid = content?.querySelector(".grid");
      if (content && grid) {
        const containers = Array.from(grid.children);
        if (containers.length) return containers;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }


  async function getTokenAddress(card) {
    const tags = card.querySelectorAll('a');
    for (const tag of tags) {
      if (tag.href.includes("terminal")) {
        const url = new URL(tag.href);
        return url.searchParams.get("address");
      }
    }
    return null;
  }
  async function addPulseButtons(card) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const tokenAddress = await getTokenAddress(card);
    const quickBtn = card.querySelector("button.ant-btn.ant-btn-text");
    if (quickBtn && tokenAddress) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
        const presets = await chrome.storage.local.get("tradewiz.newPreset");
        const presetValue = presets["tradewiz.newPreset"];
        const selectedPreset = presetValue?.find(item => item.isDetault)
          || (presetValue?.length ? presetValue[0] : defaultPreset);
        return tradeCallback({
          ...arg,
          selectedPreset,
          tokenAddress: tokenAddress
        })
      });
    }
  }
  function addPulseButton(card, quickBuyAmount, callback = async () => { }) {
    const buyButton = createPlatformButton(
      card.className,
      window.platformButtonClassName,
      quickBuyAmount,
    );
    Object.assign(buyButton.style, {
      zIndex: "1000",
      border: "1px solid #AC8AFF"
    });
    buyButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isNaN(parseFloat(quickBuyAmount)) || parseFloat(quickBuyAmount) <= 0) {
        showToast("Please enter a valid number", { isError: true });
        return;
      }
      buyButton.disabled = true;
      buyButton.style.cursor = "not-allowed";
      await callback({
        "in_amount": parseFloat(quickBuyAmount),
        "is_buy": true,
      });
      buyButton.disabled = false;
      buyButton.style.cursor = "pointer";
    })
    const cardChildren = card.parentElement.children;
    for (let i = cardChildren.length - 1; i >= 0; i--) {
      if (cardChildren[i] !== card) {
        cardChildren[i].remove();
      }
    }
    card.parentElement.prepend(buyButton);
  }

  async function watchNeoVision() {
    let retryCount = 0;
    const maxRetries = 3;
    async function tryFindContainers() {
      const containers = await findTokenContainer();
      if (!containers || containers.length === 0) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 500));
          return tryFindContainers();
        }
        return null;
      }
      return containers;
    }

    const containers = await tryFindContainers();
    if (!containers) return;

    containers.forEach((container) => {
      const cards = container.querySelectorAll(".some-card");
      cards.forEach(addPulseButtons);
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.tagName === "DIV" && node.className.includes("some-card")) {
              addPulseButtons(node);
              continue;
            }
            const cardsInNode = node.querySelectorAll(".some-card");
            if (cardsInNode && cardsInNode.length > 0) {
              cardsInNode.forEach(addPulseButtons);
            }
          }
        }
      });
      observer.observe(container, { childList: true, subtree: true });

      if (!observers["neo-vision"]) {
        observers["neo-vision"] = [];
      }
      observers["neo-vision"].push(observer);
    });
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "neo-token") {
      removeQuickPanel();
      createQuickPanel();
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "neo-vision") {
      initialConnection();
      const discoverObservers = observers["neo-vision"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchNeoVision();
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
      return
    } else {
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});