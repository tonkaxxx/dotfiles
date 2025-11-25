chrome.storage.local.get("tradewiz.config").then(async (config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "axiom.trade") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = "cls-" + Math.random().toString(36).substring(2, 10);
  window.tokenButtonClassName = "cls-" + Math.random().toString(36).substring(2, 10);
  window.platformButtonClassName = "cls-" + Math.random().toString(36).substring(2, 10);
  window.platform = 0;
  window.platformName = "axiom.trade"
  window.platformMarketFloatingQuickBuyLog = "axiom-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "axiom-market-floating-buy"
  window.platformPositionSellLog = "axiom-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
    "ring": "tradewiz.ring"
  }
  window.isAddressLab = await getStoredValue("tradewiz.showAddressLab") ?? true;
  async function findPulseContainers(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const selectors = await getElementSelectors('axiom-pulse', 'containers');
      if (!selectors.length) return null;
      const containers = document.body.querySelectorAll(selectors.join(','));
      if (containers.length) return containers;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function getTokenAddressDiscover(card) {
    const selectors = await getElementSelectors('axiom-pulse', 'tokenAddresses');
    const tokenImg = card.querySelector(selectors.selector)
    if (!tokenImg) {
      return null
    }
    const match = tokenImg.src.match(selectors.match);
    if (!match) {
      return null
    }

    const [, token] = match;
    return token || "";

  }
  async function findTokenMint(pulseData, startsWith, endsWith) {
    try {
      if (pulseData?.content) {
        const pulseToken = pulseData?.content?.find(
          (token) =>
            token.tokenAddress.startsWith(startsWith) &&
            token.tokenAddress.endsWith(endsWith)
        );
        if (!pulseToken) return null;
        return pulseToken.tokenAddress;
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  }
  async function addPulseButtons(card) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelectorAll("button")
    const selectors = await getElementSelectors('axiom-pulse', 'buttonsClasses');
    const copySelectors = await getElementSelectors('axiom-pulse', 'copyButtons');
    const symbolSelectors = await getElementSelectors('axiom-pulse', 'symbolContainers');
    if (quickBtn.length) {
      quickBtn.forEach((btn) => {
        if (selectors.some(selector => btn.className.includes(selector))) {
          addPulseButton(btn.parentElement, quickBuyAmount, async (arg) => {
            let tokenAddress = await getTokenAddressDiscover(card);
            if (!tokenAddress) {
              const copyButton = card.querySelector(copySelectors[0]);
              const currentPulse = localStorage.getItem('tradewiz.pulse');
              let pulseData = null;
              try {
                pulseData = JSON.parse(currentPulse);
              } catch (e) {
                localStorage.removeItem('tradewiz.pulse');
              }
              const [addressStartsWith, addressEndsWith] = copyButton.textContent.split('...');
              tokenAddress = await findTokenMint(pulseData, addressStartsWith, addressEndsWith);
              if (!tokenAddress) {
                const symbolContainer = card.querySelector(symbolSelectors.join(','));
                const children = symbolContainer.children
                if (children.length > 0) {
                  const symbol = children[0].firstChild.textContent
                  const time = children[1].firstChild.textContent
                  if (!symbol || !time) {
                    return
                  }
                  const tokenSearchResult = await tokenSearch({
                    address: copyButton.textContent,
                    symbol,
                    time
                  })
                  if (tokenSearchResult) {
                    if (tokenSearchResult.matched) {
                      tokenAddress = tokenSearchResult.address
                    }
                  }
                }
              }
              if (!tokenAddress) {
                showToast('Sorry, we don’t support trading this type of token.', {
                  isError: true
                })
                await uploadLog({
                  source: "5",
                  button: "axiom-pulse-quickbuy",
                  err_message: "Sorry, we don’t support trading this type of token.",
                  is_buy: true,
                  platform: window.platform,
                  mark: `pulseData:${pulseData?.content?.length || 0}->${card.innerHTML}`
                })
                return
              }
            }
            const presets = await chrome.storage.local.get("tradewiz.newPreset");
            const presetValue = presets["tradewiz.newPreset"];
            const selectedPreset = presetValue?.find(item => item.isDetault)
              || (presetValue?.length ? presetValue[0] : defaultPreset);
            return tradeCallback({
              ...arg,
              selectedPreset,
              tokenAddress: tokenAddress,
              log: "axiom-pulse-quickbuy"
            })
          });
        }
      })
    }
  }
  async function addPulseButton(card, quickBuyAmount, callback = async () => { }, isSimilar = false) {
    if (!card) return;
    const selectors = await getElementSelectors('axiom-pulse', 'buttons');
    const isUltra = card.querySelector(selectors[0])
    const buyButton = createPlatformButton(
      card.firstChild.className,
      window.platformButtonClassName,
      quickBuyAmount,
    );
    Object.assign(buyButton.style, {
      paddingLeft: card.firstChild.style.paddingLeft,
      paddingRight: card.firstChild.style.paddingRight,
      fontSize: "12px",
      fontWeight: "bold",
      lineHeight: "1",
    });
    if (isUltra) {
      return;
      // Object.assign(card.style, {
      //   position: "relative"
      // })
      // Object.assign(buyButton.style, {
      //   position: "absolute",
      //   paddingBottom: "20px",
      //   left: "70px",
      //   alignItems: "end",
      // })
    }
    buyButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isNaN(parseFloat(quickBuyAmount)) || parseFloat(quickBuyAmount) <= 0) {
        showToast("Please enter a valid number", { isError: true });
        return;
      }
      buyButton.disabled = true;
      buyButton.style.cursor = "not-allowed";
      try {
        await callback({
          "in_amount": parseFloat(quickBuyAmount),
          "is_buy": true,
        });

      } catch (error) {
        console.log(error, 'error')
      } finally {
        buyButton.disabled = false;
        buyButton.style.cursor = "pointer";
      }
    })
    if (!isSimilar) {
      const cardChildren = card.children;
      for (let i = cardChildren.length - 1; i >= 0; i--) {
        if (i === 0) break;
        const child = cardChildren[i];
        if (child !== card) {
          child.remove();
        }
      }
      Object.assign(card.style, {
        display: "flex",
        alignItems: "center",
      });
    }
    card.appendChild(buyButton);

  }
  async function createPulse() {
    const containers = await findPulseContainers();
    if (!containers || containers.length === 0) return;
    const selectors = await getElementSelectors('axiom-pulse', 'cards');
    window.observerselectors = await getElementSelectors('axiom-pulse', 'observer');
    containers.forEach((container) => {
      const cards = container.querySelectorAll(selectors.join(','));
      cards.forEach(addPulseButtons);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.tagName === "DIV" && node.classList.length === 0) {
              addPulseButtons(node);
              continue;
            }
            if (node.classList.contains("hidden") && node.innerHTML.includes(observerSelectors[0])) {
              const card = node.closest(observerSelectors[1]);
              if (card) {
                addPulseButtons(card);
              }
            }
          }
        }
      });

      observer.observe(container, { childList: true, subtree: true });

      if (!observers["pulse"]) {
        observers["pulse"] = [];
      }
      observers["pulse"].push(observer);
    });
  }

  async function findDiscoverContainers(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const container = document.querySelector(".min-h-0.overflow-auto")
      if (container.children.length) {
        return container.children;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function addDiscoverButtons(card) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const quickBtn = card.querySelector("button.bg-primaryBlue")
    if (quickBtn) {
      addPulseButton(quickBtn.parentElement, quickBuyAmount, async (arg) => {
        let tokenAddress = await getTokenAddressDiscover(card);
        if (!tokenAddress) {
          showToast('Token get failed', {
            isError: true
          })
          await uploadLog({
            source: "5",
            button: "axiom-discover-quickbuy",
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
          "log": "axiom-discover-quickbuy"
        })
      });
    }
  }

  async function createDiscover() {
    const discoverObservers = observers["discover"] || [];
    discoverObservers.forEach((observer) => observer.disconnect());
    const containers = await findDiscoverContainers();
    if (!containers) {
      return
    };
    for (const container of containers) {
      const animatePulse = container.querySelectorAll(".animate-pulse")
      const bgPrimaryBlue = container.querySelectorAll(".bg-primaryBlue")
      if (animatePulse.length || !bgPrimaryBlue.length) {
        await new Promise((r) => setTimeout(r, 500));
        createDiscover()
        break
      }
      const contents = container.querySelectorAll(".whitespace-nowrap.border-primaryStroke\\/50")
      contents.forEach((content) => {
        addDiscoverButtons(content);
      });
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.tagName === "BUTTON" && node.className.includes("active:text-primaryBlue")) {
              createDiscover()
            } else if (node.tagName === "DIV" && node.style.position === 'absolute') {
              createDiscover()
            }
          }
        }
      });
      observer.observe(container, { childList: true, subtree: true });
      if (!observers["discover_search"]) {
        observers["discover_search"] = [];
      }
      observers["discover_search"].push(observer);
    }
  }

  async function findTokenButton(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const tokenButtons = document.querySelectorAll("button.bg-decrease.rounded-full.items-center, button.bg-increase.rounded-full.items-center");
      if (tokenButtons.length) {
        const validButtons = Array.from(tokenButtons).filter((t) => t.textContent !== 'Place Order');
        return validButtons[validButtons.length - 1];
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }


  async function findTokenTab(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const tokenTabs = document.querySelectorAll(".w-\\[320px\\] .flex.flex-row > button.group.relative.text-nowrap.transition-colors")
      if (tokenTabs.length) {
        return tokenTabs
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  window.findTokenTab = findTokenTab;

  async function findButtonTab(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const buttonTabs = document.querySelectorAll(".w-\\[320px\\] button.min-h-\\[32px\\]")
      if (buttonTabs.length) {
        return buttonTabs
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  window.findButtonTab = findButtonTab;

  async function findTokenInput(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const tokenInputs = document.querySelectorAll("input.w-full.h-full.bg-transparent");
      if (tokenInputs.length) return tokenInputs[tokenInputs.length - 1];
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  window.findTokenInput = findTokenInput;

  async function findTokenPercentInput(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const tokenPercentInputs = document.querySelectorAll("input.w-full.h-\\[32px\\].bg-transparent");
      if (tokenPercentInputs.length) return tokenPercentInputs[tokenPercentInputs.length - 1];
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  window.findTokenPercentInput = findTokenPercentInput;

  async function findTargetInput(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const targetInputs = document.querySelectorAll('input.flex-1.h-full');
      if (targetInputs.length) return targetInputs[targetInputs.length - 1];
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  window.findTargetInput = findTargetInput;

  async function createLimitWatch() {
    const tokenPercentInput = await findTokenPercentInput(1000);
    if (tokenPercentInput) {
      const observer = new MutationObserver(() => {
        updateRangeUI(document.querySelector(".tradewiz-limit-container"), Number(tokenPercentInput.value));
      });

      observer.observe(tokenPercentInput, {
        attributes: true,
        childList: false,
        subtree: false,
        attributeFilter: ['value'],
      });
    }
    const tokenInput = await findTokenInput();
    if (tokenInput) {
      const observer = new MutationObserver(() => {
        const limitInputValue = document.querySelector(".tradewiz-limit-input-value");
        limitInputValue.value = tokenInput.value;
      });

      observer.observe(tokenInput, {
        attributes: true,
        childList: false,
        subtree: false,
        attributeFilter: ['value'],
      });
    }
  }
  async function createTokenButton() {
    const currentChain = await getStoredValue("tradewiz.chain")
    if (document.querySelector(`.${tokenButtonClassName}`) || currentChain == "BSC") {
      return
    }

    const tokenTabs = await findTokenTab(1000);
    tokenTabs.forEach((tab, index) => {
      tab.addEventListener("click", async (e) => {
        if (e.isTrusted) {
          const limitCheckbox = document.querySelector(".tradewiz-limit-checkbox");
          const limitContainer = document.querySelector(".tradewiz-limit-container")
          if (index === 1) {
            const buttonTabs = await findButtonTab(1000);
            const tokenTabs = await findTokenTab(1000);
            let activeIndex = Array.from(tokenTabs).findIndex(tokentab => tokentab.classList.contains("bg-decrease"));
            if (activeIndex === 0) {
              limitCheckbox.querySelector("input").checked = true;
              limitContainer.style.display = "flex";
              chrome.storage.local.set({ "tradewiz.isLimit": true });
            }
          } else {
            limitCheckbox.querySelector("input").checked = false;
            limitContainer.style.display = "none";
            chrome.storage.local.set({ "tradewiz.isLimit": false });
          }
          await createLimitWatch()
        }
      });
    })
    const buttonTabs = await findButtonTab(1000);
    buttonTabs.forEach((tab, index) => {
      tab.addEventListener("click", async (e) => {
        if (e.isTrusted) {
          const limitCheckbox = document.querySelector(".tradewiz-limit-checkbox");
          const limitContainer = document.querySelector(".tradewiz-limit-container")
          if (index === 1) {
            limitCheckbox.querySelector("input").checked = false;
            limitContainer.style.display = "none";
            chrome.storage.local.set({ "tradewiz.isLimit": false });
          } else {
            const tokenTabs = await findTokenTab(1000);
            let activeIndex = Array.from(tokenTabs).findIndex(tokentab => tokentab.classList.contains("false"));
            if (activeIndex === 1) {
              limitCheckbox.querySelector("input").checked = true;
              limitContainer.style.display = "flex";
              chrome.storage.local.set({ "tradewiz.isLimit": true });
            }
          }
          await createLimitWatch()
        }
      });
    })
    await createLimitWatch()
    const tokenButton = await findTokenButton();
    if (!tokenButton) return
    const tokenInput = await findTokenInput();
    if (!tokenInput) return;
    tokenButton.parentElement.style.flexDirection = 'column';
    tokenButton.style.width = '100%';
    tokenButton.style.marginBottom = '6px';
    const button = tokenButton.cloneNode(true);
    const buttonLogo = document.createElement("img");
    buttonLogo.src = chrome.runtime.getURL("src/public/assets/images/button-logo.png");
    Object.assign(buttonLogo.style, {
      width: "auto",
      height: "16px",
      position: "absolute",
      right: 0,
      top: 0
    });
    button.appendChild(buttonLogo);
    button.style.backgroundColor = "#AC8AFF";
    button.style.position = "relative";
    button.classList.add(tokenButtonClassName);
    tokenButton.parentElement.appendChild(button);
    setTimeout(() => {
      const children = tokenButton.firstChild.children;
      Array.from(button.firstChild.children).forEach(child => child.remove());
      Array.from(children).forEach(child => {
        const clone = child.cloneNode(true);
        button.firstChild.appendChild(clone);
      });
    }, 1000);
    const isSellMode = () => tokenButton.textContent.includes("Sell") || tokenButton.textContent.includes("出售");
    const observer = new MutationObserver(() => {
      const isSell = isSellMode();
      Array.from(button.firstChild.children).forEach(child => child.remove());
      Array.from(tokenButton.firstChild.children).forEach(child => {
        let clone;
        if (isSell && child.nodeName === "IMG") {
          clone = document.createElement("span");
          clone.textContent = "%"
        } else { clone = child.cloneNode(true); }
        button.firstChild.appendChild(clone);
      });
      if (isSell) {
        button.firstChild.firstChild.textContent = `Sell ${tokenInput.value || 0}`;
      }
    });

    const inputObserver = new MutationObserver(() => {
      const isSell = isSellMode();
      if (!isSell) {
        Array.from(button.firstChild.children).forEach(child => child.remove());
        Array.from(tokenButton.firstChild.children).forEach(child => {
          let clone;
          if (isSell && child.nodeName === "IMG") {
            clone = document.createElement("span");
            clone.textContent = "%"
          } else { clone = child.cloneNode(true); }
          button.firstChild.appendChild(clone);
        });
      } else {
        button.firstChild.firstChild.textContent = `Sell ${tokenInput.value || 0}`;
      }
    });

    observer.observe(tokenButton.firstChild, { childList: true });
    observer.observe(tokenButton, { characterData: true, subtree: true });
    inputObserver.observe(tokenInput, { attributes: true, attributeFilter: ["value"] });

    button.onclick = async function (event) {
      event.preventDefault();
      event.stopPropagation();
      const isLimit = button.textContent.includes("@");
      const mode = isSellMode() ? "sell" : "buy";
      const value = tokenInput.value;
      const selectedPreset = await getPresetValue();
      if (!parseFloat(value) || isNaN(parseFloat(value))) return showToast("Invalid amount!", {
        isError: true
      });
      if (isLimit) {
        const targetInput = await findTargetInput(1000);
        if (!targetInput) return;
        if (Number(targetInput.value) <= 0) return showToast("Market cap must be greater than 0", { isError: true });
        const req = {
          isBuy: mode === "buy",
          selectedPreset,
          marketCap: Number(targetInput.value),
          amount: 0,
          sellRatio: 0,
        }
        if (mode === 'buy') {
          req.amount = parseFloat(value) * 10 ** 9
        } else {
          req.sellRatio = Number(value)
        }
        await tradeLimitCallback(req)
      } else {
        const response = await tradeCallback({
          "in_amount": parseFloat(value),
          "is_buy": mode === "buy",
          selectedPreset,
          log: "axiom-market-button"
        })
        if (response) {
          showToast("Transaction confirmed!")
        }
      }
    }
  }

  async function findSimilarTokens(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const similarTokens = Array.from(document.querySelectorAll('a[href*="/meme/"]')).filter((t) => !t.classList.contains("group/token") && !t.classList.contains("group") && !t.classList.contains("tradewiz-href") && t.classList.contains("gap-2"));
      if (similarTokens.length) return similarTokens;
      await new Promise((r) => setTimeout(r, 500));
    }
    return [];
  }

  async function addSimilarTokensButton() {
    const tokens = await findSimilarTokens();
    if (!tokens.length) return;
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    tokens.forEach(token => {
      const buttons = token.querySelectorAll("button")
      buttons.forEach(button => {
        button.remove();
      })
      addPulseButton(token, quickBuyAmount, async () => {
        const tokenAddress = token.href.split("meme/")[1].split("?")[0];
        if (!tokenAddress) {
          await uploadLog({
            source: "5",
            button: "axiom-similar",
            err_message: "Token get failed",
            is_buy: true,
            platform: window.platform,
            mark: token.innerHTML
          })
          showToast('Token get failed', {
            isError: true
          });
          return;
        };
        return tradeCallback({
          "in_amount": parseFloat(quickBuyAmount),
          "is_buy": true,
          selectedPreset,
          tokenAddress: tokenAddress,
          getLp: false,
          "log": "axiom-similar"
        })
      }, true);
    })
  }

  const cleanupAddressTagObservers = () => {
    const observerKeys = ["addressSwitch", "addressTags"];

    observerKeys.forEach(key => {
      if (observers[key]) {
        if (Array.isArray(observers[key])) {
          observers[key].forEach(observer => observer.disconnect());
        } else {
          observers[key].disconnect();
        }
        delete observers[key];
      }
    });
  };

  const getAddressFromContainer = (addressContainer) => {
    return addressContainer?.firstChild?.textContent?.trim() || null;
  };

  const setupAddressModalCopyButton = () => {
    if (observers["addressModalCopy"]) {
      observers["addressModalCopy"].disconnect();
      delete observers["addressModalCopy"];
    }

    const observer = new MutationObserver(async () => {
      if (window.isAddressLab === false) return;
      const addressModal = document.querySelector(".fixed.inset-0");
      if (!addressModal) return;

      const addressContainer = addressModal.querySelector(".group\\/address");
      if (!addressContainer) return;

      if (addressModal.querySelector(".tradewiz-address-tag-wrapper")) return;

      const address = getAddressFromContainer(addressContainer);
      if (!address) return;

      addressContainer.style.position = "relative";
      try {
        createAddressTagInput(addressContainer, address, JSON.parse(localStorage.getItem('tradewiz.addressList') || '{}'));
      } catch (error) {
        console.error("Failed to create or append copy button:", error);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observers["addressModalCopy"] = observer;
  };

  const addAddressTag = async (addressButton, isActive) => {
    if (addressButton.querySelector(".tradewiz-tag")) return;
    const remark = await getWalletsRemark(addressButton.textContent)
    if (!remark) return;
    const tag = createTag(remark, "small");
    if (isActive) {
      Object.assign(tag.style, {
        bottom: "5px"
      });
    }
    Object.assign(addressButton.style, {
      position: "relative"
    });
    addressButton.appendChild(tag);
  };

  const findAddressListContainer = async () => {
    const maxAttempts = 10;
    const delayMs = 500;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const scrollContainers = document.querySelectorAll("div[style*='overflow-y: auto']");
        if (scrollContainers.length) {
          return scrollContainers;
        }
      } catch (error) {
        console.warn("Error finding address list container:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  };

  const findAddressSwitchContainer = async () => {
    const maxAttempts = 10;
    const delayMs = 500;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const switchContainer = document.querySelector(".hide-scrollbar");
        if (switchContainer) return switchContainer;
      } catch (error) {
        console.warn("Error finding address switch container:", error);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  };
  const createAddressTagInput = (target, address) => {
    if (!address || address.length <= 3 || !window.isAddressLab) return;
    const isTrade = target.closest(".group")
    const isModal = target.closest(".group\\/name")
    const targetClose = target.closest(".group") || target.closest(".group\\/name") || target.closest("div[style]");
    if (!targetClose) return;
    const addressMap = JSON.parse(localStorage.getItem('tradewiz.addressList') || '{}');
    const { note = {}, icon = {} } = addressMap[address] || {};
    if (targetClose.querySelector(".tradewiz-address-tag-wrapper")) {
      const addressTag = targetClose.querySelectorAll(".tradewiz-address-tag-content")[0];
      const noteText = addressTag.getAttribute("data-note");
      if (note?.note && noteText !== note?.note) {
        addressTag.setAttribute("data-note", note?.note || "");
        addressTag.innerText = note?.note || "";
      };
      return;
    };
    const container = createAddressHtml(note, icon, address);
    if (isTrade) {
      Object.assign(container.style, {
        right: "18px",
        bottom: "-10px",
        flexDirection: "row-reverse",
      })
    } else if (isModal) {
      Object.assign(container.style, {
        margin: 0,
        position: "initial",
      })
    } else {
      Object.assign(container.style, {
        marginLeft: "52px",
        marginTop: "-10px",
      })
    }
    targetClose.setAttribute("data-inserted-address", address);
    targetClose.appendChild(container);
  }
  const getFullAddress = (address) => {
    const holderData = localStorage.getItem('tradewiz.holderData');
    const topHolderData = localStorage.getItem('tradewiz.topHolderData');
    if (!holderData || !topHolderData) return address;
    const holderAddresses = holderData.split(',');
    const topHolderAddresses = topHolderData.split(',');
    const addressParts = address.split('...');
    if (addressParts.length < 2) return address;
    const startPart = addressParts[0].trim();
    const endPart = addressParts[1].trim();
    const fullAddress = holderAddresses.find((addr) => addr.startsWith(startPart) && addr.endsWith(endPart)) ||
      topHolderAddresses.find((addr) => addr.startsWith(startPart) && addr.endsWith(endPart));
    return fullAddress || address;
  }
  const processExistingAddressElements = async (addressContainer, addressMap) => {
    const hoders = Array.from(addressContainer.querySelectorAll('[style*="position: absolute"]'));
    // const trades = Array.from(addressContainer.querySelectorAll('button.relative.flex'))
    hoders.forEach(item => {
      try {
        const addressButton = item.querySelector("button.text-nowrap");
        if (addressButton) {
          createAddressTagInput(addressButton, getFullAddress(addressButton.textContent), addressMap);
        }
      } catch (error) {
        console.warn("Error processing address item:", error);
      }
    });
    // trades.forEach(item => {
    //   try {
    //     createAddressTagInput(item, getFullAddress(item.textContent), addressMap);
    //   } catch (error) {
    //     console.warn("Error processing trade item:", error);
    //   }
    // })
  };

  const setupAddressListTags = async () => {
    if (!window.isAddressLab) return;
    cleanupAddressTagObservers();

    const waitForHolderData = async () => {
      const maxRetries = 10;
      let retries = 0;
      while (retries < maxRetries) {
        const holderData = localStorage.getItem('tradewiz.holderData');
        const topHolderData = localStorage.getItem('tradewiz.topHolderData');
        if (holderData && topHolderData) return { holderData, topHolderData };
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      throw new Error("holderData or topHolderData not found after waiting.");
    };

    try {
      const { holderData, topHolderData } = await waitForHolderData();

      const addressMap = JSON.parse(localStorage.getItem('tradewiz.addressList') || '{}');

      const token = await extractLp() || await retry(extractToken);
      const holderAddresses = holderData.split(',');
      const topHolderAddresses = topHolderData.split(',');

      const [response1, response2] = await Promise.all([
        addressList({ addresses: holderAddresses, token, is_fully_addresses: true }),
        addressList({ addresses: topHolderAddresses, token, is_fully_addresses: true }),
      ]);

      [...(response1 || []), ...(response2 || [])].forEach(item => {
        addressMap[item.address] = item;
      });

      localStorage.setItem('tradewiz.addressList', JSON.stringify(addressMap));

      await setupAddressSwitchObserver();
      await setupScrollContainerProcessing();

    } catch (error) {
      console.error("Failed to setup address list tags:", error);
    }
  };

  const setupAddressSwitchObserver = async () => {
    const addressSwitchContainer = await findAddressSwitchContainer();
    if (!addressSwitchContainer) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement && node.tagName === "DIV") {
            setupAddressListTags();
          }
        }
      }
    });

    observer.observe(addressSwitchContainer.firstChild, {
      childList: true,
      subtree: true,
    });

    observers["addressSwitch"] = observers["addressSwitch"] || [];
    observers["addressSwitch"].push(observer);
  };

  const setupScrollContainerProcessing = async () => {
    const scrollContainers = await findAddressListContainer();
    if (!scrollContainers || scrollContainers.length === 0) return;

    scrollContainers.forEach((container) => {
      processExistingAddressElements(container);
    });

    setTimeout(() => {
      scrollContainers.forEach((container) => {
        processExistingAddressElements(container);
      });
    }, 2000);

    observers["addressTags"] = observers["addressTags"] || [];

    scrollContainers.forEach((container) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.tagName === "DIV") {
              if (node.style.position === "absolute") {
                try {
                  const addressButton = node.querySelector("button.text-nowrap");
                  if (addressButton) {
                    createAddressTagInput(addressButton, getFullAddress(addressButton.textContent));
                  }
                } catch (error) {
                  console.warn("Error processing new address element:", error);
                }
              } else {
                // const addressButton = node.querySelector("button.relative.flex");
                // if (addressButton && addressButton.parentElement.parentElement) {
                //   try {
                //     createAddressTagInput(addressButton.parentElement.parentElement, getFullAddress(addressButton.textContent));
                //   } catch (error) {
                //     console.warn("Error processing new address element:", error);
                //   }
                // }
              }
            }
          }
        }
      });

      observer.observe(container, { childList: true, subtree: true });
      observers["addressTags"].push(observer);
    });
  };

  const removeLocalStorageItem = () => {
    localStorage.removeItem('tradewiz.addressList');
    localStorage.removeItem('tradewiz.holderData');
    localStorage.removeItem('tradewiz.topHolderData');
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "axiom-token") {
      await setChain('SOL');
      if (request.source !== "quickAmount") {
        removeQuickPanel();
        createQuickPanel(undefined, 'SOL');
        createTokenButton();
        setupAddressModalCopyButton();
        if (window.isAddressLab) {
          setupAddressListTags();
        }
      }
    } else if (request.message === "axiom-token-bsc") {
      await setChain('BSC');
      if (request.source !== "quickAmount") {
        removeQuickPanel();
        createQuickPanel(undefined, 'BSC');
        createTokenButton();
        setupAddressModalCopyButton();
        if (window.isAddressLab) {
          setupAddressListTags();
        }
      }
    } else if (request.message === "axiom-discover") {
      removeQuickPanel();
      setChain("SOL");
    } else if (request.message === "hidePanel") {
      removeQuickPanel();
      cleanupAddressTagObservers();
    } else if (request.message === "axiom-pulse") {
      await setChain('SOL');
      removeLocalStorageItem()
      initialConnection();
      const discoverObservers = observers["pulse"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      createPulse();
      if (request.source !== "quickAmount") {
        removeQuickPanel();
        cleanupAddressTagObservers();
      }
    } else if (request.message === "axiom-pulse-bsc") {
      await setChain('BSC');
      removeLocalStorageItem()
      initialConnection();
      const discoverObservers = observers["pulse"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      removeQuickPanel();
      removeSignalPanel();
      cleanupAddressTagObservers();
    } else if (request.message === "axiom-discover-bsc") {
      await setChain('BSC');
      removeQuickPanel();
    } else if (request.message === "showAddressLab") {
      window.isAddressLab = request.value;
      if (window.isAddressLab) {
        setupAddressListTags();
      } else {
        cleanupAddressTagObservers();
        document.querySelectorAll(".tradewiz-address-tag-wrapper").forEach((item) => {
          item.remove();
        });
      }
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
      return
    } else {
      removeLocalStorageItem()
      removeQuickPanel();
      cleanupAddressTagObservers();
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});