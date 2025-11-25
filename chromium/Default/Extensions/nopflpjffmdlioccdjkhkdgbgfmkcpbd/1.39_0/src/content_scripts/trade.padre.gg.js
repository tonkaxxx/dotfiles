chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "trade.padre.gg") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 11;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "padre-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "padre-market-floating-buy"
  window.platformPositionSellLog = "padre-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }
  async function getTokenAddress(card) {
    const tokenAddressesSelector = await getElementSelectors("padre-trenches", 'tokenAddresses');
    const anchors = Array.from(card.querySelectorAll(tokenAddressesSelector.selector));
    for (const anchor of anchors) {
      const href = anchor?.href || anchor?.src;
      if (!href) continue;
      try {
        const pathMatch = href.match(/\/(?:coin|tokens?|moonshot.com|bags.fm|studio|sol(?:ana)?)\/([^/?#]+)/);
        if (pathMatch?.[1]) {
          return pathMatch[1];
        }
        const url = new URL(href, location.origin);
        const mint = url.searchParams.get("mint");
        if (mint) {
          return mint;
        }
        const regex = new RegExp(tokenAddressesSelector.match);
        const match = href.match(regex);
        if (match?.[1]) {
          return match[1]
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
    const selectors = await getElementSelectors("padre-trenches", 'copyButtons');
    const quickBtn = card.querySelector(selectors.join(", "));
    quickBtn.classList.remove("Mui-disabled")
    if (quickBtn) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
        const tokenAddress = await getTokenAddress(card);
        if (!tokenAddress) {
          showToast('Token get failed', {
            isError: true
          })
          await uploadLog({
            source: "5",
            button: "padre-trenches-quickbuy",
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
          "log": "padre-trenches-quickbuy"
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
  async function findPadreTokenContainer(timeout = 5000) {
    await new Promise((r) => setTimeout(r, 500));
    for (let i = 0; i < timeout / 500; i++) {
      const selectors = await getElementSelectors('padre-trenches', 'containers');
      const tables = Array.from(
        document.querySelectorAll(selectors.join(", ")),
      );
      if (tables.length) {
        return tables;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function watchPadreTrenches() {
    const tables = await findPadreTokenContainer();
    console.log("padre trenches tables", tables);
    if (!tables || tables.length === 0) return;
    const selectors = await getElementSelectors('padre-trenches', 'cards');
    if (tables && tables.length > 0) {
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll(selectors.join(", ")));
        rows.forEach((r) => addPulseButtons(r));
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.getAttribute && node.getAttribute("role") === "gridcell") {
                addPulseButtons(node);
                continue;
              }
            }
          }
        });
        observer.observe(table, {
          childList: true,
          subtree: true,
        });
        observers["padre-trenches"] = observers["padre-trenches"] || [];
        observers["padre-trenches"].push(observer);
      }
    }
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "padre-token") {
      removeQuickPanel();
      createQuickPanel();
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "padre-trenches") {
      initialConnection();
      const discoverObservers = observers["padre-trenches"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchPadreTrenches();
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
