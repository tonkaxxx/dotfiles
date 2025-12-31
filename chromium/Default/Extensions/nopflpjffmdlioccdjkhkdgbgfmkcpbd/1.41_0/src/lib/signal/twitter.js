
const createTwitterSignal = async (container = document.querySelector(".signal-container")) => {
  const alphaSignal = await getStoredValue("tradewiz.alphaSignal");
  const showTwitter = await getStoredValue("tradewiz.showTwitter");
  const minimizeModule = await getStoredValue("tradewiz.minimizeModule") || [];
  if (minimizeModule.includes("twitter")) {
    return;
  }
  if (showTwitter === false) {
    const currentTwitterContainer = document.querySelector(".tradewiz-signal-panel[type='twitter']");
    if (currentTwitterContainer) {
      currentTwitterContainer.remove();
    }
    if (alphaSignal === false && container) {
      container.style.display = "none";
    }
    return;
  };
  if (container) {
    container.style.display = "flex";
  }
  if (container.querySelector(".tradewiz-signal-panel[type='twitter']")) {
    return;
  }
  const panel = createStyledDiv({});
  panel.className = "tradewiz-signal-panel";
  panel.setAttribute("type", "twitter");
  const header = await createSignalHeader("Twitter Tracker")
  panel.appendChild(header);
  const itemContainer = createStyledDiv({
    padding: "0 12px",
  });
  itemContainer.className = "signal-item-container";
  panel.appendChild(itemContainer);
  container.appendChild(panel);
  loadTwiterSignal(panel);
}
const twiterType = {
  "tweet": `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_360_4255)">
    <path d="M3.11347 7.22166C2.97432 7.59576 2.85619 7.94184 2.75052 8.29128C3.32607 7.87332 4.01126 7.608 4.80116 7.50924C6.30912 7.32078 7.64856 6.32508 8.32674 5.0742L7.45326 4.20131L8.30088 3.35249C8.5011 3.15201 8.70126 2.95167 8.90148 2.75147C9.15906 2.49386 9.45 2.01708 9.75773 1.33093C6.40182 1.85108 4.3469 3.90587 3.11347 7.22166ZM9.15 4.20042L9.75 4.8C9.15 6.6 7.35 8.4 4.95 8.7C3.34887 8.90016 2.34853 10.0001 1.94894 12H0.75C1.35 8.4 2.55 0 11.55 0C10.9505 1.7984 10.3511 2.99786 9.75162 3.5984C9.54972 3.80028 9.34986 4.00028 9.15 4.20042Z" fill="currentColor"/>
    </g>
    <defs>
    <clipPath id="clip0_360_4255">
    <rect width="12" height="12" fill="currentColor"/>
    </clipPath>
    </defs>
    </svg>
  `,
  "quoted": `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_360_4255)">
    <path d="M3.11347 7.22166C2.97432 7.59576 2.85619 7.94184 2.75052 8.29128C3.32607 7.87332 4.01126 7.608 4.80116 7.50924C6.30912 7.32078 7.64856 6.32508 8.32674 5.0742L7.45326 4.20131L8.30088 3.35249C8.5011 3.15201 8.70126 2.95167 8.90148 2.75147C9.15906 2.49386 9.45 2.01708 9.75773 1.33093C6.40182 1.85108 4.3469 3.90587 3.11347 7.22166ZM9.15 4.20042L9.75 4.8C9.15 6.6 7.35 8.4 4.95 8.7C3.34887 8.90016 2.34853 10.0001 1.94894 12H0.75C1.35 8.4 2.55 0 11.55 0C10.9505 1.7984 10.3511 2.99786 9.75162 3.5984C9.54972 3.80028 9.34986 4.00028 9.15 4.20042Z" fill="currentColor"/>
    </g>
    <defs>
    <clipPath id="clip0_360_4255">
    <rect width="12" height="12" fill="currentColor"/>
    </clipPath>
    </defs>
    </svg>
  `,
  "retweeted": `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.25 1.93994L4.466 4.00994L3.784 4.73994L2.75 3.77494V7.99994C2.75 8.54994 3.198 8.99994 3.75 8.99994H6.5V9.99994H3.75C2.6455 9.99994 1.75 9.10494 1.75 7.99994V3.77494L0.715997 4.73994L0.0339966 4.00994L2.25 1.93994ZM8.25 2.99994H5.5V1.99994H8.25C9.3545 1.99994 10.25 2.89494 10.25 3.99994V8.22494L11.284 7.25994L11.966 7.98994L9.75 10.0599L7.534 7.98994L8.216 7.25994L9.25 8.22494V3.99994C9.25 3.44994 8.802 2.99994 8.25 2.99994Z" fill="currentColor" />
    </svg>
  `,
  "reply": `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.62696 1.35741C4.78665 1.19364 5.02955 1.14307 5.24146 1.22923C5.45337 1.31546 5.59229 1.52119 5.59229 1.74998V3.75682C7.09112 3.8884 8.39389 4.50635 9.47779 5.60472C10.6856 6.82871 11.377 8.35415 11.5593 10.1523C11.5844 10.3992 11.445 10.6336 11.2158 10.7287C10.9867 10.8239 10.722 10.7574 10.5647 10.5654C9.35477 9.0885 8.37332 8.37625 7.62403 8.21727C6.91172 8.06616 6.23533 8.02036 5.59229 8.07372V10.2497C5.59229 10.4813 5.44982 10.6898 5.23414 10.7742C5.01854 10.8583 4.773 10.8014 4.61597 10.6313L0.58692 6.26756C0.38414 6.04785 0.388612 5.70835 0.597174 5.49413L4.62696 1.35741ZM1.77491 5.89622L4.46729 8.81126V7.57567C4.46732 7.30012 4.66704 7.06502 4.93897 7.02049C5.87361 6.8675 6.84811 6.90226 7.85767 7.11644C8.53912 7.26103 9.23488 7.66635 9.94654 8.28612C9.64738 7.5796 9.22507 6.95017 8.67725 6.395C7.67087 5.37515 6.46398 4.86543 5.0254 4.85399C4.71648 4.85155 4.46729 4.60041 4.46729 4.29149V3.1328L1.77491 5.89622Z" fill="currentColor" />
    </svg>
  `,
  "communities": `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.625 6C4.07475 6 5.25 7.17525 5.25 8.625V12H0V8.625C0 7.17525 1.17525 6 2.625 6ZM9.375 6C10.8247 6 12 7.17525 12 8.625V12H6.75V8.625C6.75 7.17525 7.92525 6 9.375 6ZM2.625 7.125C1.79657 7.125 1.125 7.79657 1.125 8.625V10.875H4.125V8.625C4.125 7.79657 3.45343 7.125 2.625 7.125ZM9.375 7.125C8.54657 7.125 7.875 7.79657 7.875 8.625V10.875H10.875V8.625C10.875 7.79657 10.2034 7.125 9.375 7.125ZM2.625 0C4.07475 0 5.25 1.17525 5.25 2.625C5.25 4.07475 4.07475 5.25 2.625 5.25C1.17525 5.25 0 4.07475 0 2.625C0 1.17525 1.17525 0 2.625 0ZM9.375 0C10.8247 0 12 1.17525 12 2.625C12 4.07475 10.8247 5.25 9.375 5.25C7.92525 5.25 6.75 4.07475 6.75 2.625C6.75 1.17525 7.92525 0 9.375 0ZM2.625 1.125C1.79657 1.125 1.125 1.79657 1.125 2.625C1.125 3.45343 1.79657 4.125 2.625 4.125C3.45343 4.125 4.125 3.45343 4.125 2.625C4.125 1.79657 3.45343 1.125 2.625 1.125ZM9.375 1.125C8.54657 1.125 7.875 1.79657 7.875 2.625C7.875 3.45343 8.54657 4.125 9.375 4.125C10.2034 4.125 10.875 3.45343 10.875 2.625C10.875 1.79657 10.2034 1.125 9.375 1.125Z" fill="currentColor"/>
  </svg>
  `,
  "account": `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_1557_10431)">
      <path d="M7.875 7.875C10.7745 7.875 13.125 10.2255 13.125 13.125V14H0.875V13.125C0.875 10.2255 3.22551 7.875 6.125 7.875H7.875ZM6.125 9.1875C4.09829 9.1875 2.42995 10.7188 2.21228 12.6875H11.7877C11.5701 10.7188 9.90171 9.1875 7.875 9.1875H6.125ZM7 0C8.933 0 10.5 1.567 10.5 3.5C10.5 5.433 8.933 7 7 7C5.067 7 3.5 5.433 3.5 3.5C3.5 1.567 5.067 8.45599e-08 7 0ZM7 1.3125C5.79188 1.3125 4.8125 2.29188 4.8125 3.5C4.8125 4.70812 5.79188 5.6875 7 5.6875C8.20812 5.6875 9.1875 4.70812 9.1875 3.5C9.1875 2.29188 8.20812 1.3125 7 1.3125Z" fill="currentColor"/>
      </g>
      <defs>
      <clipPath id="clip0_1557_10431">
      <rect width="14" height="14" fill="currentColor"/>
      </clipPath>
      </defs>
      </svg>
      `
}

function getTwiterType(url) {
  if (url.includes("/i/communities")) {
    return { text: "Same Twitter Community", svg: twiterType.communities }
  }
  if (url.includes("/status/")) {
    return { text: "Same Twitter Tweet", svg: twiterType.tweet }
  } else if (url) {
    return { text: "Same Twitter Account", svg: twiterType.account }
  }
  return { text: "", svg: "" }
}

async function loadTwiterSignal(container) {
  const itemContainers = container.querySelector('.signal-item-container');
  let next = ""
  let isLastPage = false;
  attachInfiniteScroll({
    container: itemContainers,
    loadFn: loadMoreData,
    hasMore: () => !isLastPage
  });
  loadMoreData(true);
  async function loadMoreData(isFirst = false) {
    showLoader(itemContainers);
    if (isFirst) {
      next = "";
      signalUseSet(window.platform, 6)
    }
    try {
      const response = await signalMsg({
        next, size: 15
      })
      hideLoader(itemContainers);
      if (!response || !response.tweets || response.tweets.length === 0) {
        return;
      }
      response.tweets.forEach((item) => {
        const twiterSignalItem = createSignalTweetsItem(item);
        itemContainers.appendChild(twiterSignalItem);
      })
      next = response.next || "";
      if (!next) {
        isLastPage = true;
        return false;
      }
    } catch (error) {
      hideLoader(itemContainers);
      console.error("Error loading Twitter signals:", error);
    }
  }
}

const createSignalTweetsItem = (tweet) => {
  const twiterSignalItem = document.createElement('div');
  twiterSignalItem.className = 'twiter-signal-item';
  twiterSignalItem.setAttribute('data-uid', tweet.twitter_id);
  const created_at = tweet.created_at;
  const timeAgo = Math.floor((new Date() - new Date(created_at)) / 1000) > 0 ? formatTimestamp(Math.floor((new Date() - new Date(created_at)) / 1000)) : "";
  const relatedList = tweet.related || [];
  twiterSignalItem.innerHTML = `
    <div class="twiter-signal-item-header">
        <div class="twiter-signal-item-header-left">
          <img src="${tweet.user.avatar}"/>
          <span class="twiter-signal-item-header-left-username">${tweet.user.name}</span>
          <a href="https://x.com/${tweet.user.screen_name}" target="_blank" class="twiter-signal-item-header-left-username screen">@${tweet.user.screen_name}</a>
        </div>
        <div class="twiter-signal-item-header-right">
        <span class="triggered_time" data-createdAt="${created_at}">${timeAgo}</span>
         <a href="https://x.com/${tweet.user.screen_name}/status/${tweet.twitter_id}" target="_blank">
          ${twiterType[tweet.type]}
         </a>
        </div>
      </div>
      <div class="twiter-signal-item-content">
      ${tweet.type === "retweeted" ? `Retweeted to <a href="https://x.com/${tweet.retweeted_status.user.screen_name}" target="_blank">@${tweet.retweeted_status.user.name}</a>` : tweet.type === "reply" ? `Replying  to <a href="https://x.com/${tweet.quoted_status.user.screen_name}" target="_blank">@${tweet.quoted_status.user.name}</a>` : ""}
       ${renderTweet(tweet)}
      </div>
      ${tweet.retweeted_status || tweet.quoted_status ? `<div class="twiter-signal-item-forward">
        <div class="twiter-signal-item-header">
          <div class="twiter-signal-item-header-left">
            <img src="${(tweet.retweeted_status || tweet.quoted_status).user.avatar}"/>
            <span class="twiter-signal-item-header-left-username">${(tweet.retweeted_status || tweet.quoted_status).user.name}</span>
            <a href="https://x.com/${(tweet.retweeted_status || tweet.quoted_status).user.screen_name}}" target="_blank" class="twiter-signal-item-header-left-username screen">@${(tweet.retweeted_status || tweet.quoted_status).user.screen_name}</a>
          </div>
        </div>
        <div class="twiter-signal-item-content">
          ${renderTweet(tweet.retweeted_status || tweet.quoted_status)}
        </div>
      </div>` : ""}
      ${relatedList.length ? `<div class="twiter-signal-item-ca">
        <div class="twiter-signal-item-ca-title">
          <div class="twiter-signal-item-ca-title-gradient">
            Related CA
          </div>
        </div>
        <div class="twiter-signal-item-ca-content" style="padding-top: 8px;">
        </div>
      </div>`: ""}
  `
  const relatedCaContent = twiterSignalItem.querySelector('.twiter-signal-item-ca-content');
  relatedList.forEach(ca => {
    const caItem = createCurrentTokenCaItem(ca, "");
    relatedCaContent.appendChild(caItem);
  })
  const tweetTexts = twiterSignalItem.querySelectorAll(".tweet-text");
  tweetTexts.forEach(tweetText => {
    tweetText.addEventListener("click", (e) => {
      e.stopPropagation();
      signalUseSet(window.platform, 3)
      window.open(tweetText.getAttribute("data-url"), "_blank", "noopener,noreferrer");
    });
  });
  return twiterSignalItem;
}

function createCurrentTokenCaItem(ca, getToken) {
  const caItem = document.createElement('div');
  caItem.className = `tradewiz-signal-current-token-related-ca-item ${getToken === ca.token ? "active" : ""}`;
  caItem.setAttribute('data-token', ca.token);
  caItem.innerHTML = `
    <div class="tradewiz-signal-current-token-related-ca-item-content">
      <img src="https://axiomtrading.sfo3.cdn.digitaloceanspaces.com/${ca.token}.webp"/>
      <span class="symbol" data-tip="${ca.symbol}">${ca.symbol}</span>
      <span style="width: 60px;flex: 0 0 60px">
        MC
        <span class="tradewiz-mc">$${formatTokenPrice(+ca.mc)}</span>
      </span>
      <span class="time">1h</span>
      <span class="tradewiz-vol">$${formatTokenPrice(+ca.vol1h)}</span>
    </div>
    <div class="triggered_time" data-createdAt=${ca.init_block_time} data-token=${ca.token}>${formatTimestamp(Math.floor((new Date() - new Date(ca.init_block_time)) / 1000))}</div>
  `;
  caItem.addEventListener('click', (e) => {
    if (window.platform === 0 || window.platform === 9) {
      e.preventDefault();
      navigateToToken(platformPathMap(window.platform, ca.token))
      signalUseSet(window.platform, 2)
      caItem.classList.add('active');
      caItem.parentElement.querySelectorAll('.tradewiz-signal-current-token-related-ca-item').forEach(item => {
        if (item !== caItem) {
          item.classList.remove('active');
        }
      }
      );
    }
  });
  attachHoverPopup({
    target: caItem,
    createPopupContent: createTwiterSignalItem,
    popupClassName: "twiter-signal-item-hover-warpper"
  });
  return caItem;
}

async function createTwiterSignalItem(target) {
  const token = target.getAttribute('data-token');
  if (!token) return "";
  const response = await signalToken(token);
  if (!response.msg) {
    response.msg = {
      combos: 0,
      total_buy_usd: 0,
      created_at: ""
    };
  }
  const triggeredAgo = response.msg.created_at ? formatTimestamp(Math.floor((new Date() - new Date(response.msg.created_at)) / 1000)) : ""
  const maxMultiple = Math.round(Number(1 + response.max_change) * 10) / 10 || 0;
  const trades = response.trades || [];
  const itemHovover = document.createElement('div');
  itemHovover.className = 'twiter-signal-item-hover';
  itemHovover.innerHTML = `
      <div class="twiter-signal-item-hover-content">
        <div class="twiter-signal-item-hover-container">
          <div class="twiter-signal-item-hover-header">
            <div class="twiter-signal-item-hover-header-left">
              <div class="twiter-signal-item-hover-header-left-title">Wiz Wallets</div>
              <div>Triggered ${response.msg.combos} Time</div>
            </div>
            <div class="twiter-signal-item-hover-header-right triggered_time" data-createdAt="${response.msg.created_at}" >
              ${triggeredAgo}
            </div>
          </div>
          <div class="twiter-signal-item-hover-content-multiple">
            <div>Max Multiple From 1st Trigger</div>
            <div class="twiter-signal-item-hover-content-multiple-value">${maxMultiple >= 1.3 ? `${maxMultiple}x` : ""}</div>
          </div>
          <div class="twiter-signal-item-hover-content-metrics">
            <div class="twiter-signal-item-hover-content-metrics-item">
              <dl>
                <dt>${response.msg ? response.msg.n_holders || 0 : 0} Smart Wallets</dt>
                <dd>15 min</dd>
              </dl>
              <dl>
                <dt>$${formatTokenPrice(+response.msg.total_buy_usd)} Inflow</dt>
                <dd>15 min</dd>
              </dl>
              <dl>
                <dt>${response.holder_count}/${response.swap_holder_count} Holding</dt>
                <dd>Current</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="twiter-signal-item-hover-footer">
          <div class="twiter-signal-item-hover-footer-title">
            <div style="flex:0 0 76px">Smart Money</div>
            <div style="flex:0 0 72px"><span class="mc-rose">Buy</span> / <span class="mc-fall">Sell</span></div>
            <div style="flex:0 0 64px">MC</div>
            <div style="flex:0 0 36px">PNL</div>
            <div></div>
          </div>
          <div class="twiter-signal-item-hover-footer-content">
          </div>
        </div>
      </div>
  `
  const itemContainer = itemHovover.querySelector(".twiter-signal-item-hover-footer-content");
  trades.forEach(trade => {
    const tradeItem = createTradeItem(trade);
    itemContainer.appendChild(tradeItem);
  })
  return itemHovover.outerHTML;
}

function createTradeItem(trade) {
  const tradeItem = document.createElement('div');
  tradeItem.className = 'twiter-signal-item-hover-footer-content-item';
  tradeItem.innerHTML = `
      <div style="flex:0 0 76px;color:#fff;">${trade.alias || formatAddress(trade.wallet)}</div>
      <div style="flex:0 0 72px" class="${trade.is_buy ? "mc-rose" : "mc-fall"}">${formatTokenPrice(+trade.trade_sol)} SOL</div>
      <div style="flex:0 0 64px;color:#fff;">$${formatTokenPrice(+trade.mc)}</div>
      <div style="flex:0 0 42px" class="${+trade.pnl > 0 ? 'mc-rose' : +trade.pnl < 0 ? 'mc-fall' : ''}">${+trade.pnl ? formatProfitRate(+trade.pnl, false, 'u') : "-"}</div>
      <div class="triggered_time" data-createdAt="${trade.on_chain_time}">${formatTimestamp(Math.floor((new Date() - new Date(trade.on_chain_time)) / 1000))}</div>
  `
  return tradeItem;
}
