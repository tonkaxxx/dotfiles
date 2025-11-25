



function createLimitOrderCardBSC({
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
    positionItem.setAttribute("data-order-id", limitOrder.id);
    positionItem.setAttribute("data-token", limitOrder?.token.toLowerCase());
    const isBuy = limitOrder.isBuy;
    const decimals = limitOrder?.tokenMeta?.decimals || limitOrder.decimals;
    const amount = limitOrder.amount
    const triggerPriceInUsd = limitOrder.triggerPriceInUsd;
    const autoSellPercent = limitOrder.autoSellPercent;
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
      <span>Price</span>
      <span>
        $${formatTokenPrice(triggerPriceInUsd)}
      </span>
      
      <div style="width:1px;height:12px;background:rgba(173, 173, 204, 0.2)"></div>
      <span>
        ${Number((+amount / 10 ** 18)).toFixed(3)} BNB
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
        await deleteLimitOrderBSC({
            id: limitOrder.id,
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
async function createPositionListBSC(panel, { limitOrders }) {
    // Get panel state from storage
    const {
        "tradewiz.posPanel": posPanel = false,
    } = await chrome.storage.local.get(["tradewiz.posPanel"]);

    // Create main list container
    const list = createStyledDiv({
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
    const posHeader = await createPositionHeader(posPanel, list);
    posHeader.classList.add("tradewiz-position-header");
    panel.appendChild(posHeader);
    list.innerHTML = "";

    // Create limit order container
    const limitOrderContainer = createStyledDiv({}, "div");
    limitOrderContainer.className = "tradewiz-limit-order-list";
    const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
    const filterLimitOrders = limitOrders.filter(item => item?.token.toLowerCase() === tokenAddress.toLowerCase())
    const posHeaderText = panel.querySelector(".tradewiz-pos-header-text")
    if (posHeaderText) {
        posHeaderText.innerText = filterLimitOrders.length ? `Orders (${filterLimitOrders.length})` : "Orders"
    }
    const limitOrderItems = filterLimitOrders
        ?.map(item => createLimitOrderCardBSC({ limitOrder: item }));
    limitOrderItems.forEach(item => limitOrderContainer.appendChild(item));
    list.appendChild(limitOrderContainer);
    panel.appendChild(list);
}

async function setPanelDataBSC(panel, data, type) {
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
                panel.querySelector(".tradewiz-sol-balance").innerText = Number(data?.bnb_balance || 0).toFixed(3);
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
            const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
            if (tokenAddress === data.token_address) {
                updateLimitOrderBSC();
            }
        }
    } catch (error) {
        console.log(error, 'error')
    }
}
function updateLimitOrderBSC() {
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
async function setPanelLimitDataBSC(data, type) {
    if (type === 'limit-order') {
        const isRemove = data.type === "deletion";
        const tokenAddress = document.querySelector(".tradewiz-current-token-info")?.getAttribute("data-token");
        const limitOrderContainer = document.querySelector(".tradewiz-limit-order-list");
        if (isRemove) {
            const limitOrderCard = limitOrderContainer.querySelector(`[data-order-id="${data.orderId}"]`);
            if (limitOrderCard) {
                limitOrderContainer.removeChild(limitOrderCard);
            }
        } else if (data.orders[0]?.token.toLowerCase() == tokenAddress.toLowerCase()) {
            data.orders.forEach(order => {
                const limitOrderCard = createLimitOrderCardBSC({
                    limitOrder: order
                });
                limitOrderContainer.appendChild(limitOrderCard);
            });
        }
        updateLimitOrderBSC();
    }
}

