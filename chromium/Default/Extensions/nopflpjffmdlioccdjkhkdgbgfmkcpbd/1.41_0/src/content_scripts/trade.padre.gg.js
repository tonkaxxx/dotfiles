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
  let firstTimeQuickbuy = true
  async function getTokenAddress(card) {
    const bscMatch = card?.innerHTML?.match(/0x[a-fA-F0-9]{40}/);
    if (bscMatch && bscMatch[0]) {
      return bscMatch[0];
    }
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
    const currentChain = await getStoredValue("tradewiz.chain")
    const selectedPreset = await getPresetValueFnMap[currentChain]();
    // const selectedPreset = await getPresetValue();
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
        const currentChain = await getStoredValue("tradewiz.chain")
        const presets = await chrome.storage.local.get("tradewiz.newPreset");
        // const presetValue = presets["tradewiz.newPreset"];
        // const selectedPreset = presetValue?.find(item => item.isDetault)
        //   || (presetValue?.length ? presetValue[0] : defaultPreset);
        const presetValue = await getStoredValue(presetNameMap[currentChain]);
        const selectedPreset = presetValue?.find(item => item.isDetault)
          || (presetValue?.length ? presetValue[0] : getDefaultPreset(currentChain));

        return callbackMap[currentChain]({
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
      const tables = Array.from(
        document.querySelectorAll("div.ReactVirtualized__Grid__innerScrollContainer"),
      );
      if (tables.length) {
        return tables;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  let lastExists = null;
  async function setPadreTrenchesChain() {
    const topBar = document.querySelector('[data-testid="top-bar"]');
    if (!topBar) return
    const observer = new MutationObserver(async (mutations) => {
      const exists = !!topBar.querySelector('svg[viewBox="-5 -5 60 60"] path[fill="#F0B90B"]');
      if (exists !== lastExists) {
        lastExists = exists;
        chrome.runtime.sendMessage({ message: "padre-trenches" });
      }
    });
    observer.observe(topBar, {
      childList: true,
      subtree: true,
    });
    observers["padre-trenches"] = observers["padre-trenches"] || [];
    observers["padre-trenches"].push(observer);
  }
  async function addTableObservers(table) {
    const selectors = await getElementSelectors('padre-trenches', 'cards');
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
  async function watchPadreTrenches() {
    await setPadreTrenchesChain()
    const tables = await findPadreTokenContainer();
    if (!tables || tables.length === 0) return;
    if (tables && tables.length > 0) {
      for (const table of tables) {
        // const rows = Array.from(table.querySelectorAll(selectors.join(", ")));
        // rows.forEach((r) => addPulseButtons(r));
        // const observer = new MutationObserver((mutations) => {
        //   for (const mutation of mutations) {
        //     for (const node of mutation.addedNodes) {
        //       if (node.getAttribute && node.getAttribute("role") === "gridcell") {
        //         addPulseButtons(node);
        //         continue;
        //       }
        //     }
        //   }
        // });
        // observer.observe(table, {
        //   childList: true,
        //   subtree: true,
        // });
        // observers["padre-trenches"] = observers["padre-trenches"] || [];
        // observers["padre-trenches"].push(observer);
        addTableObservers(table)
      }
    }
    const tableContainer = document.querySelector('.MuiContainer-root.MuiContainer-maxWidthNone')
    const containerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.getAttribute && node.getAttribute("class") && node.getAttribute("class") == "ReactVirtualized__Grid__innerScrollContainer") {
            addTableObservers(node)
            continue;
          }
        }
      }
    });
    containerObserver.observe(tableContainer, {
      childList: true,
      subtree: true,
    });
    observers["padre-trenches"] = observers["padre-trenches"] || [];
    observers["padre-trenches"].push(containerObserver);
  }
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "padre-token") {
      await setChain('SOL');
      removeQuickPanel();
      createQuickPanel();
    } else if (request.message === "padre-token-bsc") {
      await setChain('BSC');
      removeQuickPanel();
      createQuickPanel(undefined, 'BSC');
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "padre-trenches") {
      if (firstTimeQuickbuy) {
        await new Promise((r) => setTimeout(r, 1000))
        firstTimeQuickbuy = false;
      }
      const topBar = document.querySelector('[data-testid="top-bar"]');
      const exists = !!topBar.querySelector('svg[viewBox="-5 -5 60 60"] path[fill="#F0B90B"]');
      await setChain(exists ? "BSC" : 'SOL');
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
