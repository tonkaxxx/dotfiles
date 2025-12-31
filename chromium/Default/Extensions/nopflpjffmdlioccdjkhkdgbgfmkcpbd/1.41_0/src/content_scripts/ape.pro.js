chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "ape.pro") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 6;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "ape-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "ape-market-floating-buy"
  window.platformPositionSellLog = "ape-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }

  async function findGemsContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const container = document.querySelector("div.grid-cols-1");
      if (container) return container;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function createGemsQTButtons(container) {
    const cards = Array.from(container.querySelectorAll("div.h-20"));
    cards.forEach((card) => {
      addPulseButtons(card);
    })
  }
  async function watchGems() {
    const containers = await findGemsContainer();
    if (containers) {
      const crads = Array.from(containers.children)
      crads.forEach((card) => {
        createGemsQTButtons(card);
      })
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === "DIV" && node.className.includes("relative")) {
              addPulseButtons(node);
            }
            if (node.tagName === "DIV" && node.className.includes("overflow-y-auto")) {
              createGemsQTButtons(node);
            }
          });
        });
      });
      observer.observe(containers, { childList: true, subtree: true });
    }
  }

  async function getTokenAddress(card) {
    const anchor = card.querySelector('a[preload="false"]');
    if (!anchor) return;

    const tokenAddress = anchor.href.split("/solana/")[1];
    if (!tokenAddress) return;
    return tokenAddress;
  }
  async function addPulseButtons(card) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelector("button.text-xs.transition")
    const tokenAddress = await getTokenAddress(card);
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
      quickBuyButtonClassName,
      quickBuyAmount,
    );
    buyButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isNaN(parseFloat(quickBuyAmount)) || parseFloat(quickBuyAmount) <= 0) {
        showToast("Please enter a valid number", { isError: true });
        return;
      }
      buyButton.disabled = true;
      try {
        await callback({
          "in_amount": parseFloat(quickBuyAmount),
          "is_buy": true,
        });
      } catch (error) {

      } finally {
        buyButton.disabled = false;
      }
    })
    const cardChildren = card.parentElement;
    cardChildren.querySelector(`.${quickBuyButtonClassName}`)?.remove();
    card.style.marginLeft = "auto"
    card.parentElement.appendChild(buyButton);
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "ape-token") {
      await setChain('SOL',false);
      removeQuickPanel();
      createQuickPanel();
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "ape-gems") {
      await setChain('SOL',false);
      initialConnection();
      const discoverObservers = observers["Gems"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchGems();
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert"].includes(request.message)) {
      return
    } else {
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});
