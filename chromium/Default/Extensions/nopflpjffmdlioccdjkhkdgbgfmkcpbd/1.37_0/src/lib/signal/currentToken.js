async function createCurrentTokenElement() {
  const showCurrentToken = await getStoredValue("tradewiz.showCurrentToken");
  const showTwitter = await getStoredValue("tradewiz.showTwitter");
  const alphaSignal = await getStoredValue("tradewiz.alphaSignal");
  const minimizeModule = await getStoredValue("tradewiz.minimizeModule") || [];
  if (minimizeModule.includes("current-token")) {
    return;
  }
  if (showCurrentToken === false) {
    const currentTokenContent = document.querySelector(
      ".tradewiz-signal-current-token-head"
    );
    if (currentTokenContent) {
      currentTokenContent.remove();
    }
    return;
  };
  if (showTwitter === false && alphaSignal === false) {
    return;
  }
  let target = document.querySelector(".tradewiz-signal-panel[type='wallet']") || document.querySelector(".tradewiz-signal-panel[type='twitter']");
  if (showTwitter === false) {
    target = document.querySelector(".tradewiz-signal-panel[type='wallet']");
  } else if (alphaSignal === false) {
    target = document.querySelector(".tradewiz-signal-panel[type='twitter']");
  }
  signalUseSet(window.platform, 7)
  const header = await createSignalHeader();
  const getToken = await retry(extractToken);
  const lp = !getToken ? await extractLp() : "";
  if (!getToken && !lp) {
    removeCurrentTokenElement();
    const alertContainer = document.querySelector("#price-alert-wrapper");
    if (alertContainer) {
      alertContainer.remove();
    }
    return;
  }
  const response = await signalTokenDetail(getToken || lp);
  const { data: alertList = [] } = await getAlertList(response.token, "");
  const alertListCount = alertList.length;
  const currentToken =
    document.querySelector(".tradewiz-signal-current-token-head") ||
    createStyledDiv({});
  currentToken.className = "tradewiz-signal-current-token-head";
  currentToken.setAttribute("type", "current-token");
  const maxMultiple =
    Math.round(Number(1 + response.max_change) * 10) / 10 || 0;
  currentToken.innerHTML = `
  <div class="tradewiz-signal-current-token">
  <div class="tradewiz-signal-current-token-flex">
    <div class="tradewiz-signal-current-token-content">
      <div class="tradewiz-signal-current-token-image">
        <img src="https://axiomtrading.sfo3.cdn.digitaloceanspaces.com/${response.token
    }.webp"/>
        <span data-tip="${response.symbol}">${response.symbol}</span>
      </div>
    </div>
    <div class="tradewiz-signal-current-token-time">
      <div data-tip="Triggered ${response.combos} Time">
        <img src="${chrome.runtime.getURL("src/public/assets/images/w.png")}"/>
        <span>${response.combos}</span>
      </div>
      
    </div>
    ${maxMultiple >= 1.3
      ? `<div class="tradewiz-signal-current-token-metrics" data-tip="Max Multiple From 1st Trigger">
      <span>${maxMultiple}x</span>
    </div>`
      : ""
    }
    <div style="width:21px;height:18px;position:relative;cursor:pointer;margin-left:6px;display:flex;justify-content:center;align-items:center;color:${alertListCount ? "#FFC300" : "white"
    }" id="alert-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <g clip-path="url(#clip0_2015_341)">
            <path d="M13.0518 12.5757C13.4355 12.6151 13.7354 12.9393 13.7354 13.3335C13.7353 13.7276 13.4355 14.0519 13.0518 14.0913L12.9736 14.0952H2.30664C1.88588 14.0952 1.54498 13.7542 1.54492 13.3335C1.54492 12.9127 1.88585 12.5718 2.30664 12.5718H12.9736L13.0518 12.5757ZM7.63965 1.57178C10.2695 1.57182 12.4014 3.7036 12.4014 6.3335V11.0005C12.4011 11.421 12.0603 11.7622 11.6396 11.7622H3.63965C3.21901 11.7622 2.87817 11.4211 2.87793 11.0005V6.3335C2.87794 3.70358 5.00973 1.57179 7.63965 1.57178ZM1.13867 2.92236L1.21387 2.94385L2.21387 3.27686L2.28613 3.30518C2.63838 3.46362 2.82003 3.86643 2.69531 4.24072C2.56225 4.63992 2.13064 4.85523 1.73145 4.72217L0.731445 4.38916L0.65918 4.36084C0.307159 4.20227 0.125273 3.79947 0.25 3.42529C0.374867 3.05131 0.762014 2.83799 1.13867 2.92236ZM1.43359 1.12744C1.71243 0.848601 2.15387 0.8319 2.45312 1.07568L2.51172 1.12744L3.51172 2.12744L3.56348 2.18604C3.80745 2.48529 3.79063 2.92666 3.51172 3.20557C3.23281 3.48443 2.79143 3.50128 2.49219 3.25732L2.43359 3.20557L1.43359 2.20557L1.38184 2.14697C1.13806 1.84774 1.15479 1.40629 1.43359 1.12744ZM3.73145 -0.0561523C4.10564 -0.180884 4.50844 0.000980874 4.66699 0.353027L4.69531 0.425293L5.02832 1.42529C5.16139 1.82449 4.94607 2.25609 4.54688 2.38916C4.17261 2.51381 3.76975 2.33219 3.61133 1.97998L3.58301 1.90771L3.25 0.907715L3.22852 0.83252C3.14411 0.455877 3.35751 0.0687582 3.73145 -0.0561523Z" fill="currentColor"/>
            </g>
            <defs>
            <clipPath id="clip0_2015_341">
            <rect width="14" height="14" fill="white"/>
            </clipPath>
            </defs>
        </svg>
      </div>
    </div>
    ${(response.token_list || []).length
      ? `<div class="twiter-signal-item-ca">
      <div class="twiter-signal-item-ca-title">
        <a class="twiter-signal-item-ca-title-gradient" href=${response.twitter ? response.twitter : ""
      } target="_blank">
          ${getTwiterType(response.twitter).text} ${getTwiterType(response.twitter).svg
      }
        </a>
      </div>
      <div class="twiter-signal-item-ca-content">
        <div class="tradewiz-signal-current-token-related-ca">
        </div>
      </div>
    </div>
    </div>`
      : ""
    }
    `;

  const relatedCaContainer = currentToken.querySelector(
    ".tradewiz-signal-current-token-related-ca"
  );
  currentToken
    .querySelector("#alert-button")
    .addEventListener("click", async (event) => {
      const alertContainer = document.querySelector("#price-alert-wrapper");
      if (
        alertContainer &&
        event.target &&
        alertContainer.contains(event.target)
      ) {
        return;
      }
      if (alertContainer) {
        alertContainer.remove();
      } else {
        await createPriceAlert(
          document.querySelector(".signal-container"),
          response
        );
      }
    });
  const tokenList = response.token_list || [];
  if (relatedCaContainer) {
    tokenList.forEach((ca) => {
      const caItem = createCurrentTokenCaItem(ca, getToken);
      relatedCaContainer.appendChild(caItem);
    });
  }
  if (window.platform === 0 && !window.location.href.includes("/meme/")) {
    return;
  } else {
    currentToken.insertBefore(header, currentToken.firstChild);
    if (target) {
      target.insertBefore(currentToken, target.firstChild);
    }
  }
  await updateAlertButton();
}
async function removeCurrentTokenElement() {
  const getToken = await extractToken();
  if (getToken) return;
  const currentTokenContent = document.querySelector(
    ".tradewiz-signal-current-token-head"
  );
  if (currentTokenContent) {
    if (window.platform === 0 && (window.location.href.includes("/meme/") || window.location.href.includes("/t/"))) {
      return;
    }
    currentTokenContent.remove();
  }
}
