chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "app.debot.ai" && hostname !== "debot.ai") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platform = 4;
  window.platformMarketFloatingQuickBuyLog = "debot-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "debot-market-floating-buy"
  window.platformPositionSellLog = "debot-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }

  async function findMemescopeTokenContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const tables = Array.from(
        document.querySelectorAll('div[data-testid="virtuoso-scroller"]'),
      );
      if (tables.length > 0) {
        return tables;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function getTokenAddress(card) {
    if (!card) return null;

    const anchor = card.querySelector(
      "a[href*='/token/solana/'], a[href*='/token/bsc/']"
    );
    if (!anchor) return null;

    const href = anchor.href;

    let chain = null;
    if (href.includes("/token/solana/")) chain = "solana";
    if (href.includes("/token/bsc/")) chain = "bsc";

    if (!chain) return null;

    const raw = href.split(`/token/${chain}/`)[1];
    if (!raw) return null;

    let tokenAddress = raw.split("?")[0];

    if (tokenAddress.includes("_")) {
      tokenAddress = tokenAddress.split("_")[1];
    }

    return tokenAddress;
  }
  async function addPulseButtons(card) {
    const currentChain = await getStoredValue("tradewiz.chain")
    const selectedPreset = await getPresetValueFnMap[currentChain]();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const svgs = card.querySelectorAll('svg[fill="var(--dt-buy)"][width="12"][height="12"]:not([class])');
    const tokenAddress = await getTokenAddress(card);
    const quickBtn = svgs.length > 0 ? svgs[svgs.length - 1].parentElement : null;
    if (quickBtn && tokenAddress) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
        const currentChain = await getStoredValue("tradewiz.chain")
        const selectedPreset = await getPresetValueFnMap[currentChain]();
        return callbackMap[currentChain]({
          ...arg,
          selectedPreset,
          tokenAddress: tokenAddress,
          log: "debot-meme-quickbuy"
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
    Object.assign(cardChildren.style, {
      display: "flex",
      gap: "4px",
    })
    cardChildren.querySelector(`.${quickBuyButtonClassName}`)?.remove();
    card.parentElement.appendChild(buyButton);
  }

  let lastExists = null;
  async function setDebotMemeChain() {
    const combo = document.querySelector('div[role="combobox"]');
    if (!combo) return
    const observer = new MutationObserver(async (mutations) => {
      const exists = combo.querySelector('svg rect[fill="#F0B90B"]') !== null;
      if (exists !== lastExists) {
        lastExists = exists;
        chrome.runtime.sendMessage({ message: "debot-meme" });
      }
    });
    observer.observe(combo, {
      childList: true,
      subtree: true,
    });
    observers["meme"] = observers["meme"] || [];
    observers["meme"].push(observer);
  }

  async function createMemescope() {
    await setDebotMemeChain()
    const tables = await findMemescopeTokenContainer();
    if (!tables || tables.length === 0) return;
    if (tables && tables.length > 0) {
      const allRows = Array.from(document.querySelectorAll('div[data-item-index]'));
      allRows.forEach((r) => addPulseButtons(r));
      tables.forEach((table) => {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.tagName === "A" && node.href.includes('/token/solana/')) {
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

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "debot-token") {
      await setChain('SOL');
      removeQuickPanel();
      createQuickPanel(undefined, 'SOL');
    } else if (request.message === "debot-token-bsc") {
      await setChain('BSC');
      removeQuickPanel();
      createQuickPanel(undefined, 'BSC');
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "debot-meme") {
      const combo = document.querySelector('div[role="combobox"]');
      const exists = combo.querySelector('svg rect[fill="#F0B90B"]') !== null;

      await setChain(exists ? "BSC" : 'SOL');
      initialConnection();
      const discoverObservers = observers["meme"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      createMemescope();
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
