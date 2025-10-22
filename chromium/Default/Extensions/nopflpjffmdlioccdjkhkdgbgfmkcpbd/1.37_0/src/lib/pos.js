/**
 * get token position info
 * @param {*} param0 
 * @returns 
 */
const getTokenPositionInfo = ({ token, tradingSummary }) => {
  if (!token) {
    return {
      tokenBalanceInSol: 0,
      tokenBalanceInUsd: 0,
      profitInSol: 0,
      priceInSol: 0,
      symbol: "",
      tokenBalance: 0,
      profitInUsd: 0,
      profitRate: 0
    }
  }
  const priceInSol = parseFloat(token.priceInSol || 0) * 10 ** token.decimals / 10 ** 9;
  const tokenBalance = token.amount / 10 ** token.decimals;
  const tokenBalanceInSol = (
    tokenBalance ? tokenBalance * priceInSol : 0
  )
  const tokenBalanceInUsd = tokenBalance * priceInSol * solPrice
  const profitInUsd = tokenBalanceInUsd + tradingSummary.sellAmountInUsd - tradingSummary.buyAmountInUsd
  const profitInSol = profitInUsd / solPrice
  const profitRate = tradingSummary.buyAmountInUsd ? (profitInUsd / tradingSummary.buyAmountInUsd) * 100 : 0
  return {
    tokenBalanceInSol,
    tokenBalanceInUsd,
    profitInSol,
    priceInSol,
    symbol: token.symbol,
    tokenBalance,
    profitInUsd,
    profitRate
  }
}

async function createPositionHeader(posPanel, list) {
  // Create header container
  const posHeader = createStyledDiv({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    fontWeight: "500",
    padding: "12px 12px 10px 12px",
    cursor: "pointer",
    userSelect: "none",
  }, "div");

  // Create tab container
  const headerContainer = createStyledDiv({
    display: "flex",
    gap: "16px",
    alignItems: "center",

  }, "div");

  const limitOrderText = createStyledDiv({
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    cursor: "pointer",
  }, "span", "Orders");
  limitOrderText.classList.add("tradewiz-pos-header-text")

  // Create expand/collapse arrow
  const arrow = createIcon(chrome.runtime.getURL("src/public/assets/images/arrow-white.png"), {
    transform: posPanel ? "rotate(0deg)" : "rotate(180deg)",
    transition: "transform 0.3s ease",
  }, "14px");

  // Add expand/collapse handler
  const toggleList = () => {
    const isHidden = list.style.maxHeight === "0px" || list.style.maxHeight === "";

    list.style.maxHeight = isHidden ? "150px" : "0";
    list.style.opacity = isHidden ? "1" : "0";
    arrow.style.transform = `rotate(${isHidden ? 0 : 180}deg)`;

    chrome.storage.local.set({ "tradewiz.posPanel": isHidden });


  };

  posHeader.addEventListener("click", toggleList);

  // Assemble components
  headerContainer.append(limitOrderText);
  posHeader.append(headerContainer, arrow);

  return posHeader;
}

function createTokenCard({
  lp,
  token,
  tradingSummary,
  tokenBalanceInSol,
  profitInSol,
  support
}) {
  const positionItem = createStyledDiv({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 0",
    fontSize: "12px",
    lineHeight: 1,
    whiteSpace: "nowrap",
  }, "div");
  positionItem.className = "tradewiz-token-card";
  positionItem.setAttribute("data-token", token.publicKey);
  positionItem.setAttribute("buy-amount-in-usd", tradingSummary?.buyAmountInUsd || 0);
  positionItem.setAttribute("sell-amount-in-usd", tradingSummary.sellAmountInUsd || 0);
  positionItem.setAttribute("token-balance", token?.amount / 10 ** token.decimals || 0);
  let address = lp ? platform === 0 ? lp.lp : token.publicKey : token.publicKey;
  if (address && address.includes("11111111111111111111111111")) {
    address = ""
  }
  const profitInSolStr = profitInSol.toFixed(3);
  positionItem.innerHTML = `<a class="tradewiz-href" href="${platformPathMap[platform] && address ? platformPathMap[platform] + address : "javascript:void(0)"}" rel="preload" style="color: #ADADCC;position: relative;display: flex;align-items: center;gap: 2px;width: 100%;">
    <span style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 50px;">${token.symbol}</span>
    <span style="color: #fff;" class="tradewiz-token-balance">${tokenBalanceInSol.toFixed(3)} SOL</span>
    <span>|</span>
    <span>PNL</span>
    <span style="color: ${Number(profitInSolStr) > 0 ? "#7FFA8B" : Number(profitInSolStr) < 0 ? "#FF4D67" : "#fff"};" class="tradewiz-token-pnl">${profitInSolStr} SOL</span>
    ${!support ? `<div style="flex:0 0 14px" class="tradewiz-info-icon-container" onmouseover="document.querySelector('.tradewiz-info-icon-container').style.display='block'" onmouseout="document.querySelector('.tradewiz-info-icon-container').style.display='none'">
      <img class="tradewiz-info-icon" src="${chrome.runtime.getURL("src/public/assets/images/info.png")}" width="12" height="12" style="cursor: pointer;display: block;" />
    </div>` : ""}
    </a>`
  return positionItem
}

function createLimitOrderCard({
  limitOrder,
}) {
  const positionItem = createStyledDiv({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
    fontSize: "12px",
    lineHeight: 1,
    whiteSpace: "nowrap",
  }, "div");
  positionItem.className = "tradewiz-limit-order-card";
  positionItem.setAttribute("data-order-id", limitOrder.Order.id);
  positionItem.setAttribute("data-token", limitOrder.Order.token.publicKey);
  const isBuy = limitOrder.Order.isBuy;
  const decimals = limitOrder.Order.token.decimals;
  const amount = limitOrder.Order.amount
  const triggerPriceInUsd = limitOrder.Order.triggerPriceInUsd;
  const autoSellPercent = limitOrder.Order.autoSellPercent;
  const trailingStopActivationBps = limitOrder.Order.trailingStopActivationBps || 0;
  const trailingStopBps = limitOrder.Order.trailingStopBps * -1
  const devSell = limitOrder.Order.triggerType == 3
  const triggerDuration = limitOrder.Order.triggerDuration
  const enableTimeSell = triggerDuration != 0
  const triggerType = limitOrder.Order.triggerType
  const cancel = createStyledDiv({
    cursor: "pointer",
    color: "#AC8AFF",
    fontSize: "12px",
    textDecoration: "underline",
    position: "absolute",
    right: "0",
    top: "0",
  }, "div")
  cancel.innerText = "Cancel"
  const tokenBalance = Number(document.querySelector(".tradewiz-current-token-info")?.getAttribute("token-balance")) || 0;
  if (isBuy) {
    positionItem.innerHTML = `
    <div style="width:100%;height:14px;align-items:center;color:rgba(255, 255, 255, 0.8);font-size:12px;line-height:1;white-space:nowrap;position: relative;display:flex;gap:8px;">
    <div style="background:rgba(127, 250, 139, 0.2);font-size:10px;color:#7FFA8B;width:24px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;">Buy</div>
      ${devSell?`<span>Dev Sell: ${limitOrder.Order.devSellType == 1 ? "Whole Amount" : "Any Amount"}</span>`:`<span>Price</span>
      <span>
        $${formatTokenPrice(triggerPriceInUsd)}
      </span>`}
      
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span>
        ${Number((amount / 10 ** 9)).toFixed(3)} SOL
      </span>
    </div>
    `
  } else if (triggerType == 2) {
    const tokenAmount = Number((amount / 10 ** decimals).toFixed(2))
    positionItem.setAttribute("data-token-amount", tokenAmount);
    const percentage = tokenBalance ? Math.min(Math.round(((tokenAmount / tokenBalance) * 100)), 100) + "%" : "";
    positionItem.innerHTML = `
     <div style="width:100%;align-items:center;color:rgba(255, 255, 255, 0.8);font-size:12px;line-height:1;white-space:nowrap;position: relative;display:flex;gap:8px;">
      <div style="background:rgba(255, 77, 103, 0.2);font-size:10px;color:#FF4D67;width:24px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;">Sell</div>
      <span style="line-height:1.2;">
        Activation ${formatProfitRate(trailingStopActivationBps / 100)}
        <br/>
        Trailing Delta ${formatProfitRate(trailingStopBps / 100)}
      </span>
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span class="tradewiz-token-percentage">
        ${percentage}
      </span>
      </div>
    `
  }else if (triggerType == 3) {
    const tokenAmount = Number((amount / 10 ** decimals).toFixed(2))
    positionItem.setAttribute("data-token-amount", tokenAmount);
    const percentage = tokenBalance ? Math.min(Math.round(((tokenAmount / tokenBalance) * 100)), 100) + "%" : "";
    positionItem.innerHTML = `
     <div style="width:100%;align-items:center;color:rgba(255, 255, 255, 0.8);font-size:12px;line-height:1;white-space:nowrap;position: relative;display:flex;gap:8px;">
      <div style="background:rgba(255, 77, 103, 0.2);font-size:10px;color:#FF4D67;width:24px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;">Sell</div>
      <span style="line-height:1.2;">
        Dev Sell: ${limitOrder.Order.devSellType == 1 ? "Whole Amount" : "Any Amount"}
      </span>
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span class="tradewiz-token-percentage">
        ${percentage}
      </span>
      </div>
    `
  } else if (triggerType == 1) {
    const tokenAmount = Number((amount / 10 ** decimals).toFixed(2))
    positionItem.setAttribute("data-token-amount", tokenAmount);
    const percentage = tokenBalance ? Math.min(Math.round(((tokenAmount / tokenBalance) * 100)), 100) + "%" : "";
    positionItem.innerHTML = `
     <div style="width:100%;height:14px;align-items:center;color:rgba(255, 255, 255, 0.8);font-size:12px;line-height:1;white-space:nowrap;position: relative;display:flex;gap:8px;">
      <div style="background:rgba(255, 77, 103, 0.2);font-size:10px;color:#FF4D67;width:24px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;">Sell</div>
      <span>Time (${formatSecondsToTokenAge(triggerDuration)})</span>
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span class="tradewiz-token-percentage">
        ${percentage}
      </span>
      </div>
    `
  } else {
    const tokenAmount = Number((amount / 10 ** decimals).toFixed(2))
    positionItem.setAttribute("data-token-amount", tokenAmount);
    const percentage = tokenBalance ? Math.min(Math.round(((tokenAmount / tokenBalance) * 100)), 100) + "%" : "";
    positionItem.innerHTML = `
     <div style="width:100%;height:14px;align-items:center;color:rgba(255, 255, 255, 0.8);font-size:12px;line-height:1;white-space:nowrap;position: relative;display:flex;gap:8px;">
      <div style="background:rgba(255, 77, 103, 0.2);font-size:10px;color:#FF4D67;width:24px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;">Sell</div>
      <span>Price</span>
      <span>
        ${autoSellPercent ? `${formatProfitRate(autoSellPercent / 100)}/` : ""}${formatTokenPrice(triggerPriceInUsd)}
      </span>
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span class="tradewiz-token-percentage">
        ${percentage}
      </span>
      </div>
    `
  }
  cancel.addEventListener("click", async () => {
    await deleteLimitOrder({
      id: limitOrder.Order.id,
    });
  });
  positionItem.firstElementChild.appendChild(cancel);
  return positionItem;
}
/**
 * create quick position
 * @param {*} panel 
 * @param {*} param1 
 */
async function createPositionList(panel, { limitOrders, update }) {
  // Get panel state from storage
  const {
    "tradewiz.posPanel": posPanel = false,
  } = await chrome.storage.local.get(["tradewiz.posPanel"]);

  // Create main list container
  const list = update ? document.querySelector(".tradewiz-list") : createStyledDiv({
    display: "flex",
    gap: "6px",
    flexDirection: "column",
    fontSize: "12px",
    color: "#ADADCC",
    maxHeight: posPanel ? "150px" : "0",
    overflow: "auto",
    transition: "max-height 0.3s ease, opacity 0.3s ease",
    opacity: posPanel ? "1" : "0",
    userSelect: "none",
    padding: "0 12px 10px"
  }, "div");
  list.className = "tradewiz-list";

  // Create and append header
  if (!update) {
    const posHeader = await createPositionHeader(posPanel, list);
    posHeader.classList.add("tradewiz-position-header");
    panel.appendChild(posHeader);
  }
  list.innerHTML = "";

  // Create limit order container
  const limitOrderContainer = createStyledDiv({}, "div");
  limitOrderContainer.className = "tradewiz-limit-order-list";
  const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
  const filterLimitOrders = limitOrders.filter(item => item.OrderType === 0 && item.Order.token.publicKey === tokenAddress)
  const posHeaderText = panel.querySelector(".tradewiz-pos-header-text")
  if (posHeaderText) {
    posHeaderText.innerText = filterLimitOrders.length ? `Orders (${filterLimitOrders.length})` : "Orders"
  }
  const limitOrderItems = filterLimitOrders
    ?.map(item => createLimitOrderCard({ limitOrder: item }));
  limitOrderItems.forEach(item => limitOrderContainer.appendChild(item));
  list.appendChild(limitOrderContainer);
  panel.appendChild(list);
}

async function setPanelData(panel, data, type) {
  if (![1, 2].includes(data.buy_or_sell)) {
    return;
  }
  const isBuy = data.buy_or_sell === 1;
  try {
    if (type === 'trade') {
      const tokenBalance = Number(data.token_balance) || 0;
      const tokenBalanceInUsd = tokenBalance * Number(data.price_usd);
      const tradeUsd = Number(data.trade_usd);
      const posTokenCard = document.querySelector(`[data-token="${data.token_address}"].tradewiz-token-card`);
      const currentTokenInfo = panel.querySelector(`[data-token="${data.token_address}"].tradewiz-current-token-info`);
      if (posTokenCard) {
        if (tokenBalance > 0) {
          posTokenCard.querySelector(".tradewiz-token-balance").innerText = tokenBalanceInUsd.toFixed(2);
          const posTokenPnl = posTokenCard.querySelector(".tradewiz-token-pnl")
          let buyAmountInUsd = Number(posTokenCard.getAttribute("buy-amount-in-usd")) || 0;
          let sellAmountInUsd = Number(posTokenCard.getAttribute("sell-amount-in-usd")) || 0;

          if (isBuy) {
            buyAmountInUsd += tradeUsd;
            posTokenCard.setAttribute("buy-amount-in-usd", buyAmountInUsd);
          } else {
            sellAmountInUsd += tradeUsd;
            posTokenCard.setAttribute("sell-amount-in-usd", sellAmountInUsd);
          }
          posTokenCard.setAttribute("token-balance", tokenBalance);
          const totalProfit = tokenBalanceInUsd + sellAmountInUsd - buyAmountInUsd;
          const profitRate = Math.round(buyAmountInUsd ? (totalProfit / buyAmountInUsd) * 100 : 0);
          if (posTokenPnl) {
            const totalProfitStr = Math.abs(totalProfit).toFixed(2);
            if (Number(totalProfitStr) > 0) {
              posTokenPnl.style.color = "#7FFA8B"
            } else if (Number(totalProfitStr) < 0) {
              posTokenPnl.style.color = "#FF4D67"
            } else {
              posTokenPnl.style.color = "#fff"
            }
            posTokenPnl.innerText = `${formatProfitAndLoss(totalProfit)}(${formatProfitRate(profitRate)})`;
          }
        } else {
          const positionSorted = (await getStoredValue("tradewiz.position.sorted")) || []
          const newPositionSorted = positionSorted.filter(item => item.token.publicKey !== data.token_address)
          chrome.storage.local.set({
            "tradewiz.position.sorted": newPositionSorted || []
          })
          posTokenCard.remove();
        }
      }

      if (currentTokenInfo) {
        panel.querySelector(".tradewiz-sol-balance").innerText = Number(data.sol_balance).toFixed(3);
        currentTokenInfo.style.display = tokenBalance > 0 ? "flex" : "none";
        currentTokenInfo.querySelector(".tradewiz-current-token-balance").innerText = tokenBalanceInUsd.toFixed(2);
        let buyAmountInUsd = Number(currentTokenInfo.getAttribute("buy-amount-in-usd")) || 0;
        let sellAmountInUsd = Number(currentTokenInfo.getAttribute("sell-amount-in-usd")) || 0;
        if (isBuy) {
          buyAmountInUsd += tradeUsd;
          currentTokenInfo.setAttribute("buy-amount-in-usd", buyAmountInUsd);
        } else {
          sellAmountInUsd += tradeUsd;
          currentTokenInfo.setAttribute("sell-amount-in-usd", sellAmountInUsd);
        }
        currentTokenInfo.setAttribute("token-balance", tokenBalance);
        if (tokenBalance === 0) {
          currentTokenInfo.setAttribute("buy-amount-in-usd", 0)
          currentTokenInfo.setAttribute("sell-amount-in-usd", 0)
        }
        const totalProfit = tokenBalanceInUsd + sellAmountInUsd - buyAmountInUsd;
        const profitRate = Math.round(buyAmountInUsd ? (totalProfit / buyAmountInUsd) * 100 : 0);
        const posTokenPnl = currentTokenInfo.querySelector(".tradewiz-current-token-pnl")
        currentTokenInfo.querySelector(".tradewiz-current-token-symbol").innerText = data.token_symbol;
        if (posTokenPnl) {
          const totalProfitStr = Math.abs(totalProfit).toFixed(2);
          if (Number(totalProfitStr) > 0) {
            posTokenPnl.style.color = "#7FFA8B"
          } else if (Number(totalProfitStr) < 0) {
            posTokenPnl.style.color = "#FF4D67"
          } else {
            posTokenPnl.style.color = "#fff"
          }
          posTokenPnl.innerText = `${formatProfitAndLoss(totalProfit)}(${formatProfitRate(profitRate)})`;
        }
      }
      if (!posTokenCard) {
        const newToken = {
          token: {
            publicKey: data.token_address,
            symbol: data.token_symbol,
          },
          tradingSummary: {
            buyAmountInUsd: tradeUsd,
            sellAmountInUsd: 0,
          },
          solPrice,
          profitInUsd: 0,
          profitRate: 0,
          tokenBalanceInUsd: tradeUsd,
          buyAmountInUsd: tradeUsd,
          sellAmountInUsd: 0,
          tokenBalance: data.token_balance
        }
        const positionSorted = (await getStoredValue("tradewiz.position.sorted")) || []
        positionSorted.push(newToken)
        const sortedTokens = positionSorted.sort((a, b) => b.tokenBalanceInUsd - a.tokenBalanceInUsd)
        chrome.storage.local.set({
          "tradewiz.position.sorted": sortedTokens
        })
        const showPosition = await getStoredValue("tradewiz.showPosition")
        if (showPosition || showPosition === undefined) {
          createPosition(sortedTokens)
        }
      }
      const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
      if (tokenAddress === data.token_address) {
        updateLimitOrder();
      }
    }
    else if (type === 'price') {
      const tokenPanels = document.querySelectorAll(`[data-token="${data.token_address}"].tradewiz-token-card, [data-token="${data.token_address}"].tradewiz-current-token-info`);
      if (!tokenPanels.length) {
        return;
      }
      tokenPanels.forEach((currentTokenPnl) => {
        const posTokenPnl = currentTokenPnl.querySelector(".tradewiz-token-pnl") || currentTokenPnl.querySelector(".tradewiz-current-token-pnl");
        const tokenBalance = Number(currentTokenPnl.getAttribute("token-balance")) || 0;
        const tokenBalanceInUsd = tokenBalance * Number(data.price_usd);
        const buyAmountInUsd = Number(currentTokenPnl.getAttribute("buy-amount-in-usd")) || 0;
        const sellAmountInUsd = Number(currentTokenPnl.getAttribute("sell-amount-in-usd")) || 0;
        const profit = tokenBalanceInUsd + sellAmountInUsd - buyAmountInUsd;
        const profitRate = Math.round(buyAmountInUsd ? (profit / buyAmountInUsd) * 100 : 0);
        const tokenBalanceEl = currentTokenPnl.querySelector(".tradewiz-token-balance") || currentTokenPnl.querySelector(".tradewiz-current-token-balance");
        if (tokenBalanceEl) {
          tokenBalanceEl.innerText = `$${tokenBalanceInUsd.toFixed(2)}`;
        }
        if (posTokenPnl) {
          if (Number(profit) > 0) {
            posTokenPnl.style.color = "#7FFA8B"
          } else if (Number(profit) < 0) {
            posTokenPnl.style.color = "#FF4D67"
          } else {
            posTokenPnl.style.color = "#fff"
          }
          posTokenPnl.innerText = `${formatProfitAndLoss(profit)}(${formatProfitRate(profitRate)})`;
        }
      });
    }
  } catch (error) {
    console.log(error, 'error')
  }
}
function updateLimitOrder() {
  const limitOrderCards = document.querySelectorAll(".tradewiz-limit-order-card");
  const tokenBalance = Number(document.querySelector(".tradewiz-current-token-info")?.getAttribute("token-balance")) || 0;
  limitOrderCards.forEach(card => {
    const tokenAmount = Number(card.getAttribute("data-token-amount")) || 0;
    const percentageContainer = card.querySelector(".tradewiz-token-percentage");
    if (percentageContainer) {
      const percentage = tokenBalance ? Math.round(((tokenAmount / tokenBalance) * 100)) + "%" : "";
      percentageContainer.innerText = percentage;
    }
  })
  const posHeaderText = document.querySelector(".tradewiz-pos-header-text")
  if (posHeaderText) {
    posHeaderText.innerText = limitOrderCards.length ? `Orders (${limitOrderCards.length})` : "Orders"
  }
}
async function setPanelLimitData(data, type) {
  if (type === 'limit-order') {
    const isRemove = data.type === 1;
    const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
    if (data.orders[0].token && tokenAddress !== data.orders[0].token.publicKey) {
      return;
    }
    const limitOrderContainer = document.querySelector(".tradewiz-limit-order-list");
    data.orders.forEach(order => {
      if (isRemove) {
        const limitOrderCard = limitOrderContainer.querySelector(`[data-order-id="${order.id}"]`);
        if (limitOrderCard) {
          limitOrderContainer.removeChild(limitOrderCard);
        }
      } else {
        const limitOrderCard = createLimitOrderCard({
          limitOrder: {
            Order: order
          }
        });
        limitOrderContainer.appendChild(limitOrderCard);
      }
    });
    updateLimitOrder();
  }
}
async function updateBalance(balance) {
  const solBalanceElement = document.querySelector(".tradewiz-sol-balance")
  if (solBalanceElement) {
    solBalanceElement.innerHTML = ((balance) / 10 ** 9).toFixed(3);
  }
}
