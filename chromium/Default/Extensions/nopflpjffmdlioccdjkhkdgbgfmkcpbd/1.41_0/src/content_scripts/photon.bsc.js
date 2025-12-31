chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "photon-bnb.tinyastro.io") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 15;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "photon-bsc-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "photon-bsc-market-floating-buy"
  window.platformPositionSellLog = "photon-bsc-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }

  async function findMemescopeTokenContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const lpLinks = Array.from(document.querySelectorAll('a[href*="/lp/"]'));
      if (lpLinks.length > 0) {
        const containers = Array.from(
          new Set(lpLinks.map((n) => n.parentElement.parentElement))
        ).filter((n) => !n.classList.contains("js-watching-list"));
        if (containers.length == 3) return containers;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function getTokenAddress(card) {
    const tokenAddress = card.querySelector(".js-copy-to-clipboard");
    const dataAddress = tokenAddress?.getAttribute("data-address");
    return dataAddress;
  }
  async function addPulseButtons(card) {
    const currentChain = "BSC"
    const selectedPreset = await getPresetValueFnMap[currentChain]();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelector("button.c-btn")
    const tokenAddress = await getTokenAddress(card);
    if (quickBtn && tokenAddress) {
      addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
         const currentChain = "BSC"
        const presetValue = await getStoredValue(presetNameMap[currentChain]);
        const selectedPreset = presetValue?.find(item => item.isDetault)
          || (presetValue?.length ? presetValue[0] : getDefaultPreset(currentChain));
        return callbackMap[currentChain]({
          ...arg,
          selectedPreset,
          tokenAddress: tokenAddress,
          log: "photon-bsc-memescope-quickbuy"
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
    Object.assign(card.parentElement.style, {
      display: "flex",
    });
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
    card.parentElement.appendChild(buyButton);
  }

  async function createMemescope(container, idx) {
    const cards = Array.from(container.querySelectorAll("a[href*='/lp/']")).map(
      (n) => n.parentElement
    );
    cards.forEach((card) => {
      addPulseButtons(card);
    })
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName && node.nodeName.toLowerCase() === "div") {
            const lpLink = node.querySelector("a[href*='/lp/']");
            if (lpLink) {
              addPulseButtons(node);
            }
          }

          if (node.nodeName && node.nodeName.toLowerCase() === "span") {
            const card = mutation.target?.offsetParent?.offsetParent;
            if (card) {
              addPulseButtons(card);
            }
          }
        });
      });
    });

    observer.observe(container, { childList: true, subtree: true });
    observers["memescope"]
      ? observers["memescope"].push(observer)
      : (observers["memescope"] = [observer]);

    const containerParent = container.parentElement;
    if (containerParent) {
      const parentObserver = new MutationObserver(() => {
        observer.disconnect();
        parentObserver.disconnect();
        return watchMemescope(idx);
      });

      parentObserver.observe(containerParent, { childList: true });
      observers["memescope"]
        ? observers["memescope"].push(parentObserver)
        : (observers["memescope"] = [parentObserver]);
    }
  }

  async function watchMemescope(idx) {
    const containers = await findMemescopeTokenContainer();
    if (idx && containers[idx]) {
      createMemescope(containers[idx], idx);
    } else {
      containers.forEach((container, idx) =>
        createMemescope(container, idx)
      );
    }
  }


  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "photon-token-bsc") {
      await setChain('BSC');
      removeQuickPanel();
      createQuickPanel(undefined, 'BSC');
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "photon-memescope-bsc") {
      await setChain('BSC');
      initialConnection();
      const discoverObservers = observers["memescope"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      watchMemescope();
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