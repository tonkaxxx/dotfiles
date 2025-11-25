const createWalletSignal = async (container = document.querySelector(".signal-container")) => {
  const alphaSignal = await getStoredValue("tradewiz.alphaSignal");
  const showTwitter = await getStoredValue("tradewiz.showTwitter");
  const minimizeModule = await getStoredValue("tradewiz.minimizeModule") || [];
  if (minimizeModule.includes("wallet")) {
    return;
  }
  if (alphaSignal === false) {
    const currentWalletContainer = document.querySelector(".tradewiz-signal-panel[type='wallet']");
    if (currentWalletContainer) {
      currentWalletContainer.remove();
      if (showTwitter === false && container) {
        container.style.display = "none";
      }
    }
    return;
  };
  if (container) {
    container.style.display = "flex";
  }
  if (container.querySelector(".tradewiz-signal-panel[type='wallet']")) {
    return;
  }
  const panel = createStyledDiv({});
  panel.className = "tradewiz-signal-panel";
  panel.setAttribute("type", "wallet");
  const header = await createSignalHeader("Wallet Signal")
  panel.appendChild(header);
  const itemContainer = createStyledDiv({});
  itemContainer.className = "signal-item-container";
  const myWalletsCheckbox = createCheckboxLabel(
    "my-wallets",
    "U",
    true,
    "#AC8AFF",
    "tradewiz.myWallets",
    loadWalletSignal,
    'Your Smartmoney Signal'
  );
  const tradewizWalletsCheckbox = createCheckboxLabel(
    "tradewiz-wallets",
    "W",
    true,
    "#AC8AFF",
    "tradewiz.publicWallets",
    loadWalletSignal,
    'TradeWiz Official Smartmoney Signal'
  );
  const footer = createStyledDiv({
    display: "flex",
  })
  footer.className = "tradewiz-signal-footer"
  footer.appendChild(tradewizWalletsCheckbox);
  footer.appendChild(myWalletsCheckbox);
  panel.appendChild(itemContainer);
  panel.appendChild(footer);
  container.insertBefore(panel, container.firstChild);
  loadWalletSignal(panel);
}
function loadWalletSignal(container) {
  const itemContainer = container ? container.querySelector('.signal-item-container') : document.querySelector('.tradewiz-signal-panel[type="wallet"] .signal-item-container');
  let next = ""
  let isLastPage = false;
  attachInfiniteScroll({
    container: itemContainer,
    loadFn: loadMoreData,
    hasMore: () => !isLastPage
  });
  loadMoreData(true);

  async function loadMoreData(isFirst = false) {
    showLoader(itemContainer);
    if (isFirst) {
      next = "";
      const res = await getStoredValue("tradewiz.signalList");
      if (res?.data) {
        itemContainer.innerHTML = "";
        res.data.forEach(data => {
          itemContainer.appendChild(createItemFromData(data));
        });
      }
      signalUseSet(window.platform, 5)
    }
    const checkBoxList = document.querySelectorAll('.custom-checkbox')
    for (let i = 0; i < checkBoxList.length; i++) {
      if (checkBoxList[i]) {
        checkBoxList[i].style.pointerEvents = "none"
        checkBoxList[i].parentNode.style.cursor = 'not-allowed'
      }
    }
    const result = await chrome.storage.local.get(["tradewiz.myWallets", "tradewiz.publicWallets", "tradewiz.token"]);
    function publicChecked() {
      return result["tradewiz.publicWallets"] || result["tradewiz.myWallets"] == undefined;
    }
    function customChecked() {
      return result["tradewiz.myWallets"] || result["tradewiz.myWallets"] == undefined;
    }
    if ((!result["tradewiz.myWallets"] && !result["tradewiz.publicWallets"]) || (result["tradewiz.myWallets"] && result["tradewiz.publicWallets"])) {
      window.signalType = "both";
    } else if (result["tradewiz.myWallets"] === true && result["tradewiz.publicWallets"] === false) {
      window.signalType = "custom";
    } else if (result["tradewiz.myWallets"] === false && result["tradewiz.publicWallets"] === true) {
      window.signalType = "public";
    }
    if (customChecked()) {
      await signalEvent({ event_type: 'my_wallet_signal', event_value: "1" });
    }
    if (publicChecked()) {
      await signalEvent({ event_type: "tradewiz_signal", event_value: "1" });
    }
    const res = await getSignalList({ type: window.signalType, next });
    hideLoader(itemContainer);
    for (let i = 0; i < checkBoxList.length; i++) {
      if (checkBoxList[i]) {
        checkBoxList[i].parentNode.style.cursor = 'auto';
        checkBoxList[i].style.pointerEvents = "all";
      }
    }
    if (!res) return;
    next = res.next || "";
    if (isFirst) {
      itemContainer.innerHTML = "";
      chrome.storage.local.set({ "tradewiz.signalList": res });
    }
    res.data.forEach(data => {
      const uid = getUID(data);
      if (!itemContainer.querySelector(`[data-uid="${uid}"]`)) {
        const item = createItemFromData(data);
        itemContainer.appendChild(item);
      }
    });
    if (!next) {
      isLastPage = true;
      return false;
    }
  }
}
function getUID(data) {
  const { channel, token_address, time_window, direction } = data;
  const { id } = channel;
  return `${direction}_${id}_${time_window}_${token_address}`
}


const createSignalItem = ({ combos, tokenName, tokenCreatedAgo, created_at, imageLink, originMc, tokenMc, triggerMCValue, currentMCValue, maxChangePercent, newHoldersCount, inflowUSD, isSystem, tokenAddress, uid }) => {
  const flexCenter = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
  const signalContent = createStyledDiv({
    width: '100%',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  })
  const coinIcon = createIcon(imageLink, {
    borderRadius: '2px',
    marginRight: '4px'
  }, "16px");
  const contentRight = createStyledDiv({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  })
  const contentBottom = createStyledDiv({
    width: '100%',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '4px',
  })
  contentBottom.className = "content-bottom"
  const name = createStyledDiv({
    color: 'rgba(255, 255, 255, 1)',
    fontSize: '12px',
    fontWeight: 400,
    maxWidth: "60px",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }, null, tokenName)
  name.setAttribute('data-tip', tokenName)
  const timePassed = createStyledDiv({
    height: '14px',
    padding: '1px 3px',
    fontSize: '12px',
    borderRadius: '4px',
    color: 'rgba(255, 255, 255, 0.60)',
    backgroundColor: 'rgba(173, 173, 204, 0.1)',
    margin: '0px 4px',
    ...flexCenter,
  }, null, tokenCreatedAgo)
  timePassed.setAttribute('data-tip', 'Token Launch Time')
  const multiple = Math.round(maxChangePercent * 10) / 10
  const maxChangeValue = createStyledDiv({
    color: "#FFC300",
    fontSize: '14px',
    fontWeight: 500,
    marginLeft: 'auto',
    ...flexCenter
  }, null, multiple >= 1.3 ? multiple + "x" : "")
  maxChangeValue.className = "tradewiz-max-change"
  maxChangeValue.setAttribute("data-multiple", multiple)
  const triggeredAgo = formatTimestamp(Math.floor((new Date() - new Date(created_at)) / 1000))
  const triggeredTime = createStyledDiv({
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: '12px',
    marginLeft: 'auto',
    fontWeight: 300
  }, null, triggeredAgo)
  triggeredTime.setAttribute("data-createdAt", created_at)
  triggeredTime.setAttribute("data-token", tokenAddress)
  triggeredTime.className = "triggered_time"
  contentBottom.appendChild(coinIcon)
  contentBottom.appendChild(name)
  contentBottom.appendChild(timePassed)
  contentBottom.appendChild(triggeredTime)
  const buyTag = `${newHoldersCount} ${newHoldersCount == 1 ? 'wallet' : 'wallets'} bought this token`
  const newHoldersValue = createStyledDiv({
    color: '#fff',
    fontSize: '12px',
    fontWeight: 400,
    marginRight: '2px',
    ...flexCenter
  }, null, newHoldersCount)
  newHoldersValue.setAttribute('data-tip', buyTag)
  const newHolders = createStyledDiv({
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontWeight: 300,
    marginLeft: '2px',
    whiteSpace: 'nowrap',
    ...flexCenter
  }, null, newHoldersCount == 1 ? ' N.Smart Buy' : ' N.Smart Buys')
  newHolders.setAttribute('data-tip', buyTag)
  const inflowTag = 'Smart Money Net Buy'
  const inflowValue = createStyledDiv({
    color: '#fff',
    fontSize: '12px',
    height: '14px',
    fontWeight: 400,
    marginLeft: '8px',
    paddingLeft: '4px',
    marginLeft: '4px',
    borderLeft: '1px solid rgba(173, 173, 204, 0.10)',
    marginRight: '2px',
    whiteSpace: 'nowrap',
    ...flexCenter
  }, null, inflowUSD)
  inflowValue.setAttribute('data-tip', inflowTag)
  const inflow = createStyledDiv({
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontWeight: 300,
    marginLeft: '2px',
    whiteSpace: 'nowrap',
    ...flexCenter
  }, null, ' Fund inflow in 30m')
  inflow.setAttribute('data-tip', inflowTag)
  const contentTop = createStyledDiv({
    width: '100%',
    height: '18px',
    display: 'flex',
    margintTop: '3px',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'flex-start'
  })
  contentTop.appendChild(newHoldersValue)
  contentTop.appendChild(newHolders)
  contentTop.appendChild(inflowValue)
  contentTop.appendChild(inflow)
  contentRight.appendChild(contentTop)
  contentRight.appendChild(contentBottom)
  signalContent.appendChild(contentRight)
  const mcContainer = createStyledDiv({})
  mcContainer.className = "mc-container"
  const trigMc = createStyledDiv({
  })
  trigMc.innerHTML = `Trig MC $${triggerMCValue}`
  trigMc.setAttribute('data-tip', 'Trigger Market Cap')
  const rightArrow = createIcon(chrome.runtime.getURL("src/public/assets/images/right-arrow.png"), {}, size = "10px")
  const currentMc = createStyledDiv({})
  currentMc.innerHTML = `Curr MC <span class="${tokenMc > originMc ? "mc-rose" : tokenMc < originMc ? "mc-fall" : ""} tradewiz-mc" data-trigger-mc=${originMc}>$${currentMCValue}</span>`
  currentMc.setAttribute('data-tip', 'Current Market Cap')
  mcContainer.appendChild(trigMc)
  mcContainer.appendChild(rightArrow)
  mcContainer.appendChild(currentMc)
  contentRight.appendChild(mcContainer)
  const signalHeader = createStyledDiv({
    width: '100%',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  })
  const triggered = createStyledDiv({
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: '12px',
    fontWeight: 400,
  }, null, 'Triggered')
  const triggeredTimesValue = createStyledDiv({
    fontSize: '12px',
    fontWeight: 400,
    color: '#FFF',
    margin: '0px 4px',
  }, null, combos)
  const times = createStyledDiv({
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: '12px',
    fontWeight: 400,
  }, null, combos == 1 ? 'Time' : "Times")

  const wizWallets = createIcon(chrome.runtime.getURL(isSystem ? "src/public/assets/images/w.png" : "src/public/assets/images/u.png"), { marginRight: '6px' }, "14px");
  if (isSystem) {
    wizWallets.setAttribute('data-tip', 'TradeWiz Official Smartmoney Signal')
  } else {
    wizWallets.setAttribute('data-tip', 'Your Smartmoney Signal')
  }
  const signalItem = document.createElement("a");
  signalItem.className = "signal-item";
  signalItem.href = platformPathMap(platform, tokenAddress);
  signalItem.rel = "preload";
  signalHeader.appendChild(wizWallets)
  signalHeader.appendChild(triggered)
  signalHeader.appendChild(triggeredTimesValue)
  signalHeader.appendChild(times)
  signalHeader.appendChild(maxChangeValue)
  signalItem.appendChild(signalHeader)
  signalItem.appendChild(signalContent)
  signalItem.addEventListener("click", (e) => {
    if (window.platform === 0 || window.platform === 9) {
      e.preventDefault();
      navigateToToken(platformPathMap(window.platform, tokenAddress))
      signalUseSet(window.platform, 1)
    }
  })
  signalItem.setAttribute('data-uid', uid)
  signalItem.setAttribute('data-token', tokenAddress)
  if (isSystem) {
    attachHoverPopup({
      target: signalItem,
      createPopupContent: createTwiterSignalItem,
      popupClassName: "twiter-signal-item-hover-warpper"
    });
  }
  return signalItem
}
const createItemFromData = (currentData) => {
  const { token_info, combos, created_at, n_holders, channel, max_change, first_push_mc, holder_count, swap_holder_count, total_buy_usd, total_sell_usd, token_address } = currentData;
  const { created_at: token_created_at, symbol = "" } = token_info;
  const { is_system, id, type } = channel;
  let isSystem = false
  if (is_system || type == 0) {
    isSystem = true
  } else {
    isSystem = false
  }
  const tokenName = symbol;
  const uid = getUID(currentData)
  const tokenCreatedAgo = formatTimestamp(Math.floor((new Date() - new Date(token_created_at)) / 1000))

  const maxChangePercent = Number(1 + max_change)
  let triggerMCValue = formatTokenPrice(+first_push_mc)
  if (+first_push_mc < 1000) {
    triggerMCValue = (+first_push_mc / 1000).toFixed(1) + "k"
  }
  let currentMCValue = formatTokenPrice(+token_info.mc)
  if (+token_info.mc < 1000) {
    currentMCValue = (+token_info.mc / 1000).toFixed(1) + "k"
  }
  const inflow = +total_buy_usd - +total_sell_usd
  let inflowUSD = "$" + formatTokenPrice(inflow)
  if (inflow < 1000) {
    inflowUSD = "$" + (+inflow / 1000).toFixed(1) + "k"
  }
  return createSignalItem({
    originMc: Number(first_push_mc),
    tokenMc: Number(token_info.mc),
    tokenName, combos, tokenCreatedAgo, isSystem,
    created_at, maxChangePercent, imageLink: `https://axiomtrading.sfo3.cdn.digitaloceanspaces.com/${token_address}.webp`, newHoldersCount: n_holders,
    triggerMCValue, currentMCValue, inflowUSD, tokenAddress: token_address,
    uid, holderCount: holder_count, swapHolderCount: swap_holder_count
  })
}
function createCheckboxLabel(id, text, checked = false, checkmarkColor = "#AC8AFF", storageKey = null, onChangeCallback, tip = "") {
  const label = document.createElement('label');
  label.className = 'custom-checkbox';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = id;

  if (storageKey) {
    chrome.storage.local.get([storageKey], (result) => {
      input.checked = result[storageKey] !== undefined ? result[storageKey] : checked;
    });
  } else {
    input.checked = checked;
  }

  input.addEventListener('change', async (e) => {
    const isChecked = e.target.checked;
    if (storageKey) {
      await chrome.storage.local.set({ [storageKey]: isChecked })
    }

    onChangeCallback?.();
    await signalEvent({ event_type: id == "my-wallets" ? 'my_wallet_signal' : "tradewiz_signal", event_value: isChecked ? '1' : '0' })
  });

  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';

  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  textSpan.setAttribute('data-tip', tip)

  label.appendChild(input);
  label.appendChild(checkmark);
  label.appendChild(textSpan);

  return label;
}