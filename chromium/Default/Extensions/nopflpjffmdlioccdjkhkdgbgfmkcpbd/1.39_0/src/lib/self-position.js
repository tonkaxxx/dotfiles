const loadPosition = async (showPosition) => {
  if (window.platform === 5 || window.platform === 10) {
    return
  }
  const auth = await getStoredValue("tradewiz.token");
  const chain = await getStoredValue("tradewiz.chain") || "SOL";
  if (!auth || chain == "BSC") {
    return
  }
  if (showPosition === undefined) {
    showPosition = await getStoredValue("tradewiz.showPosition")
  }
  const positionContainer = document.querySelector(".tradewiz-position-container")
  if (showPosition === false) {
    if (positionContainer) {
      removePlatformStyle(platform)
      positionContainer.remove()
    }
    return
  }
  signalUseSet(window.platform, 10)
  const cachedPosition = await getStoredValue("tradewiz.position.sorted")
  if (cachedPosition) {
    try {
      createPosition(cachedPosition)
    } catch (error) {
      console.log(error)
    }
  }
  setPlatformStyle(window.platform)
  const response = await getPosition()
  if (!response || !response.tokens) {
    return
  }
  const sortedTokens = sortTokens(response)
  chrome.storage.local.set({
    "tradewiz.position.sorted": sortedTokens
  })
  createPosition(sortedTokens)
}
const sortTokens = ({ tokens, solPrice }) => {
  const sortedTokens = tokens.map(({ token, tradingSummary }) => {
    const price = parseFloat(token.priceInSol || 0) * 10 ** token.decimals / 10 ** 9 * solPrice;
    const tokenBalance = (token.amount / 10 ** token.decimals) || 0;
    const tokenBalanceInUsd = (
      tokenBalance ? tokenBalance * price : 0
    )
    const buyAmountInUsd = tradingSummary?.buyAmountInUsd || 0;
    const sellAmountInUsd = tradingSummary.sellAmountInUsd || 0;
    const profitInUsd = (tokenBalanceInUsd + sellAmountInUsd - buyAmountInUsd)
    const profitRate = Math.round(buyAmountInUsd ? (profitInUsd / buyAmountInUsd) * 100 : 0)
    return {
      token: {
        publicKey: token.publicKey,
        symbol: token.symbol,
      },
      tradingSummary, solPrice, profitInUsd, profitRate, tokenBalanceInUsd, buyAmountInUsd, sellAmountInUsd, tokenBalance
    }
  })
  return sortedTokens.sort((a, b) => b.tokenBalanceInUsd - a.tokenBalanceInUsd)
}
const createPosition = async (tokens) => {
  if (window.platform === 5) {
    return
  }
  if (window.platform === -1) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  const chain = await getStoredValue("tradewiz.chain");
  if (chain !== "SOL") {
    return
  }
  const positionContainer = createStyledDiv({
    width: "100vw",
    height: "32px",
    background: "linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)",
    padding: "0 0 1px 0",
  })
  if (platform !== -1) {
    Object.assign(positionContainer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      zIndex: window.platform === 2 ? "2100" : "1000",
    })
  }
  positionContainer.classList.add("tradewiz-position-container")
  const positionContent = createStyledDiv({
    width: "100%",
    height: "32px",
    background: "#16161C",
    display: "flex",
    gap: "12px",
    padding: "0 50px 0 8px",
    flexWrap: "nowrap",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    overflowX: "auto",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  })
  const uniqueTokens = tokens.filter((token, index, self) =>
    index === self.findIndex((t) => t.token.publicKey === token.token.publicKey)
  )
  uniqueTokens.forEach((token, index) => {
    positionContent.appendChild(createPositionItem({ ...token, isLast: uniqueTokens.length - 1 === index }))
  })
  const closeIcon = createButtonIcon({
    svg: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.6359 1.53108L4.99956 3.89475L7.36406 1.53108C7.64881 1.24632 8.0987 1.22733 8.40548 1.47411L8.46891 1.53106C8.77401 1.83615 8.77402 2.33081 8.46892 2.63592L6.10456 4.99975L8.46908 7.36441C8.75384 7.64917 8.77281 8.09906 8.52602 8.40583L8.46907 8.46926C8.16397 8.77436 7.66931 8.77435 7.36421 8.46925L4.99956 6.10475L2.63575 8.46925C2.351 8.75401 1.90111 8.773 1.59433 8.52621L1.53089 8.46926C1.22579 8.16417 1.22579 7.66951 1.53087 7.36442L3.89519 4.99975L1.53103 2.63592C1.24628 2.35115 1.2273 1.90127 1.4741 1.5945L1.53105 1.53106C1.83615 1.22597 2.33081 1.22598 2.6359 1.53108Z" fill="currentColor"/>
        </svg>
    `,
    onClick: () => {
      const positionContainer = document.querySelector(".tradewiz-position-container")
      if (positionContainer) {
        positionContainer.remove()
      }
      chrome.storage.local.set({ "tradewiz.showPosition": false }, () => {
        removePlatformStyle(platform)
        chrome.runtime.sendMessage({ message: "showPosition", value: false });
      });
    }
  })
  Object.assign(closeIcon.style, {
    position: "absolute",
    right: "8px",
    top: "6px",
    width: "20px",
    height: "20px"
  })
  positionContent.appendChild(closeIcon)
  positionContainer.appendChild(positionContent)
  if (document.body.querySelector(".tradewiz-position-container")) {
    document.body.querySelector(".tradewiz-position-container").remove()
  }
  document.body.insertBefore(positionContainer, document.body.firstChild);
}



const applyPlatformStyle = async (platform) => {
  if (!document.body.querySelector(".tradewiz-position-container")) {
    return false;
  }

  let applied = false;

  if (platform === 7) {
    const container = document.querySelector(".container")
    const topbar = document.querySelector(".topbar")
    if (container && topbar) {
      if (container.style.paddingTop !== "100px") {
        Object.assign(container.style, { paddingTop: "100px" })
        applied = true;
      }
      if (topbar.style.top !== "33px") {
        Object.assign(topbar.style, { top: "33px" })
        applied = true;
      }
    }
  } else if (platform === 9) {
    const header = document.querySelector("header")
    if (header) {
      if (header.style.paddingTop !== "40px" || header.style.height !== "100px") {
        Object.assign(header.style, {
          paddingTop: "40px",
          height: "100px"
        })
        applied = true;
      }
    }
  } else if (platform === 8) {
    const notranslate = document.querySelector(".notranslate")
    if (notranslate) {
      if (notranslate.style.paddingTop !== "40px") {
        Object.assign(notranslate.style, { paddingTop: "40px" })
        applied = true;
      }
    }
  } else if (platform === 3 || platform === 2) {
    const container = document.querySelector(".ant-layout.ant-layout-has-sider")
    if (container) {
      if (container.style.paddingTop !== "40px") {
        Object.assign(container.style, { paddingTop: "40px" })
        applied = true;
      }
    }
  } else if (platform === 4) {
    const container = document.querySelector(".page-wrapper")
    if (container) {
      if (container.style.paddingTop !== "40px") {
        Object.assign(container.style, { paddingTop: "40px" })
        applied = true;
      }
    }
  } else if (platform === 1) {
    const container = document.body
    if (container) {
      if (container.style.paddingTop !== "40px") {
        Object.assign(container.style, { paddingTop: "40px" })
        applied = true;
      }
    }
  } else if (platform === 6) {
    const nav = document.querySelector("nav")
    if (nav) {
      if (nav.style.paddingTop !== "40px" || nav.style.height !== "88px") {
        Object.assign(nav.style, {
          paddingTop: "40px",
          height: "88px"
        })
        applied = true;
      }
    }
  } else if (platform === 0) {
    const container = document.querySelector(".h-screen-safe")
    if (container) {
      if (container.style.paddingTop !== "40px") {
        Object.assign(container.style, { paddingTop: "40px" })
        applied = true;
      }
    }
  } else if (platform === 11) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const root = document.getElementById("root")
    const container = root.querySelector(".padre-no-scroll")
    if (container) {
      Object.assign(container.style, { top: "40px" })
      const container1 = root.querySelector("[data-panel-group-direction='horizontal']")
      Object.assign(container1.parentElement.style, { paddingTop: "117px" })
      applied = true;
    }
  }

  return applied;
}

const setPlatformStyle = async (platform) => {
  let applied = applyPlatformStyle(platform);

  if (applied) {
    startStyleMonitoring(platform);
  } else {
    await new Promise(resolve => setTimeout(resolve, 100));
    applied = applyPlatformStyle(platform);
    if (applied) {
      startStyleMonitoring(platform);
    }
  }
}

let styleMonitorInterval = null;

const startStyleMonitoring = (platform) => {
  if (styleMonitorInterval) {
    clearInterval(styleMonitorInterval);
  }

  styleMonitorInterval = setInterval(() => {
    const applied = applyPlatformStyle(platform);
    if (!document.body.querySelector(".tradewiz-position-container")) {
      if (styleMonitorInterval) {
        clearInterval(styleMonitorInterval);
        styleMonitorInterval = null;
      }
    }
  }, 200);
}

const stopStyleMonitoring = () => {
  if (styleMonitorInterval) {
    clearInterval(styleMonitorInterval);
    styleMonitorInterval = null;
  }
}

const removePlatformStyle = async (platform) => {
  stopStyleMonitoring();

  if (platform === 7) {
    const container = document.querySelector(".container")
    const topbar = document.querySelector(".topbar")
    if (container) {
      Object.assign(container.style, { paddingTop: "" })
    }
    if (topbar) {
      Object.assign(topbar.style, { top: "" })
    }
  } else if (platform === 9) {
    const header = document.querySelector("header")
    if (header) {
      Object.assign(header.style, {
        paddingTop: "",
        height: ""
      })
    }
  } else if (platform === 8) {
    const notranslate = document.querySelector(".notranslate")
    if (notranslate) {
      Object.assign(notranslate.style, { paddingTop: "" })
    }
  } else if (platform === 3 || platform === 2) {
    const container = document.querySelector(".ant-layout.ant-layout-has-sider")
    if (container) {
      Object.assign(container.style, { paddingTop: "" })
    }
  } else if (platform === 4) {
    const container = document.querySelector(".page-wrapper")
    if (container) {
      Object.assign(container.style, { paddingTop: "" })
    }
  } else if (platform === 1) {
    const container = document.body
    if (container) {
      Object.assign(container.style, { paddingTop: "" })
    }
  } else if (platform === 6) {
    const nav = document.querySelector("nav")
    if (nav) {
      Object.assign(nav.style, {
        paddingTop: "",
        height: ""
      })
    }
  } else if (platform === 0) {
    const container = document.querySelector(".h-screen-safe")
    if (container) {
      Object.assign(container.style, { paddingTop: "" })
    }
  } else if (platform === 11) {
    const container = document.querySelector(".padre-no-scroll")
    if (container) {
      Object.assign(container.style, { top: "" })
      const container1 = document.querySelector("[data-panel-group-direction='horizontal']")
      Object.assign(container1.parentElement.style, { paddingTop: "77px" })
    }
  }
}

const createPositionItem = ({ token, tokenBalanceInUsd, buyAmountInUsd, sellAmountInUsd, profitInUsd, profitRate, tokenBalance, isLast = false }) => {
  const positionItem = document.createElement("a");
  Object.assign(positionItem.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#fff",
    flex: "0 0 auto",
    cursor: "pointer",
    position: "relative",
    textDecoration: "none",
  })
  positionItem.className = "tradewiz-token-card";
  const color = profitInUsd > 0 ? '#7FFA8B' : profitInUsd < 0 ? '#FF4D4D' : '#fff'
  positionItem.setAttribute("data-token", token.publicKey);
  positionItem.setAttribute("buy-amount-in-usd", buyAmountInUsd);
  positionItem.setAttribute("sell-amount-in-usd", sellAmountInUsd);
  positionItem.setAttribute("token-balance", tokenBalance);
  positionItem.href = platformPathMap(platform, token.publicKey)
  positionItem.rel = "preload";
  const img = document.createElement("img");
  img.src = `https://axiomtrading.sfo3.cdn.digitaloceanspaces.com/${token.publicKey}.webp`;
  img.style.borderRadius = "4px";
  img.style.width = "20px";
  img.style.height = "20px";
  img.style.objectFit = "cover";
  img.onerror = () => {
    img.src = `https://axiom.trade/pfps/${token.symbol[0].toUpperCase()}_pfp.webp`;
  };

  const spanSymbol = document.createElement("span");
  spanSymbol.textContent = token.symbol;

  const spanBalance = document.createElement("span");
  spanBalance.className = "tradewiz-token-balance";
  spanBalance.textContent = `$${tokenBalanceInUsd.toFixed(2)}`;

  const spanPnl = document.createElement("span");
  spanPnl.className = "tradewiz-token-pnl";
  spanPnl.style.color = color;
  spanPnl.textContent = `${formatProfitAndLoss(profitInUsd)}(${formatProfitRate(profitRate)})`;

  positionItem.innerHTML = "";
  positionItem.appendChild(img);
  positionItem.appendChild(spanSymbol);
  positionItem.appendChild(spanBalance);
  positionItem.appendChild(spanPnl);

  if (!isLast) {
    const divider = document.createElement("div");
    divider.style.width = "1px";
    divider.style.height = "20px";
    divider.style.background = "rgba(173, 173, 204, 0.1)";
    divider.style.marginLeft = "12px";
    positionItem.appendChild(divider);
  }

  positionItem.addEventListener("click", (e) => {
    if (window.platform === 0 || window.platform === 9) {
      e.preventDefault();
      navigateToToken(platformPathMap(window.platform, token.publicKey))
    }
  })

  const sellButtonContainer = createStyledDiv({
    position: "fixed",
    left: "0",
    top: "0",
    height: "40px",
    display: "flex",
    alignItems: "end",
    opacity: "0",
    transform: "translateY(6px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    display: "none",
    zIndex: "10002",
  })

  const sellButton = createQuickButton("Sell 100%", "Sell", false, {
    maxWidth: "auto",
    width: "auto",
    padding: "0 12px",
  })
  sellButtonContainer.appendChild(sellButton)
  document.body.appendChild(sellButtonContainer)

  const containerId = `sell-btn-${token.publicKey}-${Date.now()}`
  sellButtonContainer.id = containerId

  let hideTimeout = null

  positionItem.addEventListener("mouseover", (e) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    const rect = positionItem.getBoundingClientRect()
    sellButtonContainer.style.left = `${rect.left}px`
    sellButtonContainer.style.top = `${rect.bottom}px`

    sellButtonContainer.style.display = "flex"
    sellButtonContainer.style.opacity = "1"
    sellButtonContainer.style.transform = "translateY(0)"
    sellButton.style.cursor = "pointer"
  })

  positionItem.addEventListener("mouseout", (e) => {
    const rect = sellButtonContainer.getBoundingClientRect()
    const mouseX = e.clientX
    const mouseY = e.clientY

    if (mouseX >= rect.left && mouseX <= rect.right &&
      mouseY >= rect.top && mouseY <= rect.bottom) {
      return
    }

    hideTimeout = setTimeout(() => {
      sellButtonContainer.style.display = "none"
      sellButtonContainer.style.opacity = "0"
      sellButtonContainer.style.transform = "translateY(6px)"
      sellButton.style.cursor = "default"
    }, 150)
  })

  sellButtonContainer.addEventListener("mouseover", () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  })

  sellButtonContainer.addEventListener("mouseout", () => {
    hideTimeout = setTimeout(() => {
      sellButtonContainer.style.display = "none"
      sellButtonContainer.style.opacity = "0"
      sellButtonContainer.style.transform = "translateY(6px)"
      sellButton.style.cursor = "default"
    }, 100)
  })

  sellButton.addEventListener("click", async (e) => {
    e.stopPropagation()
    e.preventDefault()
    const selectedPreset = await getPresetValue()
    await handleButtonClick(sellButton, async () => {
      return await tradeCallback({
        in_amount: 100,
        is_buy: false,
        selectedPreset,
        tokenAddress: token.publicKey,
        getLp: false,
        log: platformPositionSellLog
      });
    });
  })

  const observer = new MutationObserver(() => {
    if (!document.contains(positionItem)) {
      if (document.getElementById(containerId)) {
        document.getElementById(containerId).remove()
      }
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return positionItem
}

(function () {
  chrome.storage.local.get(["tradewiz.config"]).then(async (config) => {
    if (!config || !config["tradewiz.config"]) {
      return;
    }
    const getConfig = config["tradewiz.config"];
    if (!getConfig || !getConfig[window.location.hostname]) {
      return;
    }
    loadPosition()
    chrome.runtime.onMessage.addListener(async (request) => {
      const currentChain = await getStoredValue("tradewiz.chain") || "SOL";
      if (request.message === "showPosition") {
        loadPosition(request.value)
      } else if (request.message === "showError") {
        showToast(request.text, { isError: request.isError ?? true, tradeToast: request.tradeToast });
      } else if (request.message === "price" || request.message === "trade") {
        if (currentChain == "BSC") {
          setPanelDataBSC(document, request.data, request.message)
        } else {
          setPanelData(document, request.data, request.message)
        }
      } else if (request.message === "limit-order") {
        if (currentChain == "BSC") {
          await updatePNLInfo(document.querySelector(".tradewiz-panel"))
          setPanelLimitDataBSC(request.data, request.message)
        } else {
          setPanelLimitData(request.data, request.message)
        }

      } else if (request.message === "transfer") {
        updateBalance(request.data)
      } else if (request.message === "user_trade") {
        if (currentChain == "BSC") {
          updatePNLInfo(document.querySelector(".tradewiz-panel"))
        }
      }
    })
    document.addEventListener("DOMContentLoaded", () => {
      setPlatformStyle(window.platform)
    })
  }).catch((error) => {
    console.error("Error loading config:", error);
  });
})();