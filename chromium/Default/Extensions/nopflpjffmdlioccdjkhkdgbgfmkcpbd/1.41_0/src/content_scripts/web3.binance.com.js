chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "web3.binance.com") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 12;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "binance-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "binance-market-floating-buy"
  window.platformPositionSellLog = "binance-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }
  async function getTokenAddress(card) {
    const bscMatch = card?.innerHTML?.match(/0x[a-fA-F0-9]{40}/);
    if (bscMatch && bscMatch[0]) {
      return bscMatch[0];
    }
    const solMatch = card?.innerHTML?.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    if (solMatch && solMatch[0]) {
      return solMatch[0];
    }
    return null;
  }
  async function addPulseButtons(card) {
    const currentChain = await getStoredValue("tradewiz.chain")
    const selectedPreset = await getPresetValueFnMap[currentChain]();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelector(".bn-button");
    // quickBtn.classList.remove("Mui-disabled")
    if (quickBtn) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
        const tokenAddress = await getTokenAddress(card);
        if (!tokenAddress) {
          showToast('Token get failed', {
            isError: true
          })
          await uploadLog({
            source: "5",
            button: "binance-memerush-quickbuy",
            err_message: "Token get failed",
            is_buy: true,
            platform: window.platform,
            mark: card.innerHTML
          })
          return;
        }
        const currentChain = await getStoredValue("tradewiz.chain")
        const presetValue = await getStoredValue(presetNameMap[currentChain]);
        const selectedPreset = presetValue?.find(item => item.isDetault)
          || (presetValue?.length ? presetValue[0] : getDefaultPreset(currentChain));

        return callbackMap[currentChain]({
          ...arg,
          selectedPreset,
          tokenAddress: tokenAddress,
          "log": "binance-memerush-quickbuy"
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

    buyButton.style.right = "50px";
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
  async function findBinanceTokenContainer(timeout = 10000) {
    await new Promise((r) => setTimeout(r, 500));
    for (let i = 0; i < timeout / 500; i++) {
      const tables = Array.from(document.querySelectorAll('div.hide-scrollbar.flex.w-full'))
        .filter(el => el.querySelector('.token-card-animation') || el.querySelector('.t-subtitle2.m-auto.flex.w-full') );
      if (tables.length == 3) {
        return tables;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  async function watchBinanceMeMeRush() {
    const tables = await findBinanceTokenContainer();
    if (!tables || tables.length === 0) return;
    if (tables && tables.length > 0) {
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll(".token-card-animation"));
        rows.forEach((r) => addPulseButtons(r));
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.classList?.contains('bn-tooltips-wrap') || node.classList?.contains('token-card-animation')) {
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
        observers["binance-memerush"] = observers["binance-memerush"] || [];
        observers["binance-memerush"].push(observer);
      }
    }
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "binance-token") {
      await setChain('SOL');
      removeQuickPanel();
      createQuickPanel(undefined, 'SOL');
    } else if (request.message === "binance-token-bsc") {
      await setChain('BSC');
      removeQuickPanel();
      createQuickPanel(undefined, 'BSC');
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "binance-memerush") {
      await setChain('SOL');
      initialConnection();
      const discoverObservers = observers["binance-memerush"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchBinanceMeMeRush();
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (request.message === "binance-memerush-bsc") {
      await setChain('BSC');
      initialConnection();
      const discoverObservers = observers["binance-memerush"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchBinanceMeMeRush();
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (request.message === "leaderboard-bsc" || request.message === "trackers-bsc" || request.message === "trending-bsc") {
      await setChain('BSC');
      initialConnection();
      removeQuickPanel()
    } else if (request.message === "leaderboard" || request.message === "trackers" || request.message === "trending") {
      await setChain('SOL');
      initialConnection();
      removeQuickPanel()
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
      return
    } else {
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});
