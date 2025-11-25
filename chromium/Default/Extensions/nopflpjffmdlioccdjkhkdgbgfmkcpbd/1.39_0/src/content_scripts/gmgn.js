chrome.storage.local.get(["tradewiz.config"]).then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "gmgn.ai") {
    return;
  }


  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 9;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "gmgn-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "gmgn-market-floating-buy"
  window.platformPositionSellLog = "gmgn-position-sell"

  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }


  async function findMemescopeTokenContainer(timeout = 5000) {
    await new Promise((r) => setTimeout(r, 500));
    for (let i = 0; i < timeout / 500; i++) {
      const tables = Array.from(
        document.querySelectorAll(".g-table-wrapper"),
      );
      if (tables.length) {
        return tables;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function getTokenAddress(card) {
    const anchors = Array.from(card.querySelectorAll("a.bg-bg-100"));

    for (const anchor of anchors) {
      const href = anchor?.href;
      if (!href) continue;

      try {
        const pathMatch = href.match(/\/(?:coin|tokens?|moonshot.com|sol(?:ana)?)\/([^/?#]+)/);
        if (pathMatch?.[1]) {
          return pathMatch[1];
        }

        const url = new URL(href, location.origin);
        const mint = url.searchParams.get("mint");
        if (mint) {
          return mint;
        }

        const queryPart = href.split("?")[1];
        if (queryPart) {
          const parts = queryPart.split("/");
          const last = parts.pop();
          if (last) {
            return last;
          }
        }
      } catch (err) {
        console.warn("Failed to parse href:", href, err);
        continue;
      }
    }

    return null;
  }

  async function addPulseButtons(card) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelector('.bg-btn-secondary-buy')
    const currentChain = await getStoredValue("tradewiz.chain");
    if (currentChain === "BSC") {
      return;
    }
    if (quickBtn) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
        const tokenAddress = await getTokenAddress(card);
        if (!tokenAddress) {
          showToast('Token get failed', {
            isError: true
          })
          await uploadLog({
            source: "5",
            button: "gmgn-discover-quickbuy",
            err_message: "Token get failed",
            is_buy: true,
            platform: window.platform,
            mark: card.innerHTML
          })
          return;
        }
        const presets = await chrome.storage.local.get("tradewiz.newPreset");
        const presetValue = presets["tradewiz.newPreset"];
        const selectedPreset = presetValue?.find(item => item.isDetault)
          || (presetValue?.length ? presetValue[0] : defaultPreset);
        return tradeCallback({
          ...arg,
          selectedPreset,
          tokenAddress: tokenAddress,
          "log": "gmgn-discover-quickbuy"
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
      buyButton.style.cursor = "not-allowed";
      await callback({
        "in_amount": parseFloat(quickBuyAmount),
        "is_buy": true,
      });
      buyButton.disabled = false;
      buyButton.style.cursor = "pointer";
    })
    const cardChildren = card.parentElement;
    cardChildren.querySelector(`.${quickBuyButtonClassName}`)?.remove();
    Object.assign(cardChildren.style, {
      display: "flex",
    });
    card.parentElement.appendChild(buyButton);
  }

  async function createMemescope() {
    const tables = await findMemescopeTokenContainer();
    if (!tables || tables.length === 0) return;
    if (tables && tables.length > 0) {
      const allRows = Array.from(document.querySelectorAll('div[data-index]:not([class])'));
      allRows.forEach((r) => addPulseButtons(r));
      tables.forEach((table) => {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.tagName === "A" && node.href.includes('/sol/token')) {
                addPulseButtons(node.parentElement);
                continue;
              }
              if (node.tagName === "DIV" && node.getAttribute("data-index")) {
                addPulseButtons(node);
                continue;
              }
            }
          }
        });
        observer.observe(table, { childList: true, subtree: true });
        observers["meme"]
          ? observers["meme"].push(observer)
          : (observers["meme"] = [observer]);

      });
    }
  }

  const disconnectObservers = () => {
    const discoverObservers = observers["meme"] || [];
    discoverObservers.forEach((observer) => observer.disconnect());
  }


  async function findAddressContainer(timeout = 5000) {
    await new Promise((r) => setTimeout(r, 500));
    for (let i = 0; i < timeout / 500; i++) {
      const addressContainer = document.getElementById("GlobalScrollDomId").querySelector(".chakra-button");
      if (addressContainer) {
        return addressContainer;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  const getAddress = () => {
    const url = window.location.href;
    const tokenMatch = url.match(/\/address\/([^?]+)/);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1].includes('_') ? tokenMatch[1].split('_')[1] : tokenMatch[1];
    }
  }
  const appendCopyButton = async () => {
    const addressContainer = await findAddressContainer();
    if (addressContainer) {
      if (document.querySelector(".tradewiz-copy-button")) {
        return;
      }
      const button = createCopyButton(getAddress())
      const target = addressContainer.parentElement
      target.insertBefore(button, target.firstChild);
    }
  }
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "gmgn-token") {
      await setChain('SOL');
      if (request.source !== "quickAmount") {
        removeQuickPanel();
        createQuickPanel(undefined, 'SOL');
      }
    } else if (request.message === "gmgn-token-bsc") {
      await setChain('BSC');
      if (request.source !== "quickAmount") {
        removeQuickPanel();
        createQuickPanel(undefined, 'BSC');
      }
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "gmgn-meme" || request.message === "new-pair") {
      await setChain('SOL');
      initialConnection();
      disconnectObservers();
      createMemescope();
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (request.message === "gmgn-meme-bsc" || request.message === "new-pair-bsc") {
      await setChain('BSC');
      initialConnection();
      disconnectObservers();
      removeQuickPanel()
    } else if (request.message === "gmgn-address") {
      await setChain('SOL');
      removeQuickPanel();
      appendCopyButton();
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
      return
    } else {
      disconnectObservers();
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});
