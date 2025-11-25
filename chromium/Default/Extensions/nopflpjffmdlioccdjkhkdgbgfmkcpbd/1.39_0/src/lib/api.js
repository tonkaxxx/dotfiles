async function getStoredValue(key) {
  const value = await chrome.storage.local.get(key);
  return value[key];
}

async function logError(url, errorMessage) {
  const errorObj = {
    url: url,
    error: errorMessage,
    timestamp: new Date().toISOString()
  }
  let errors = await getStoredValue("tradewiz.error") || [];
  if (errors) {
    errors.push(errorObj);
  } else {
    errors = [errorObj];
  }
  chrome.storage.local.set({ "tradewiz.error": errors });
}

const toastLineSvg = `<svg width="4" height="22" viewBox="0 0 4 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0C2.20914 0 4 1.79086 4 4V18C4 20.2091 2.20914 22 0 22V0Z" fill="url(#paint0_linear_8075_130446)"/>
<defs>
<linearGradient id="paint0_linear_8075_130446" x1="-1" y1="-7" x2="3.47615" y2="24.0034" gradientUnits="userSpaceOnUse">
<stop offset="0.26" stop-color="#9448F8"/>
<stop offset="0.66" stop-color="#2A3CFD"/>
<stop offset="1" stop-color="#09D79E"/>
</linearGradient>
</defs>
</svg>`
const toastCloseSvg = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.6359 1.53108L4.99956 3.89475L7.36406 1.53108C7.64881 1.24632 8.0987 1.22733 8.40548 1.47411L8.46891 1.53106C8.77401 1.83615 8.77402 2.33081 8.46892 2.63592L6.10456 4.99975L8.46908 7.36441C8.75384 7.64917 8.77281 8.09906 8.52602 8.40583L8.46907 8.46926C8.16397 8.77436 7.66931 8.77435 7.36421 8.46925L4.99956 6.10475L2.63575 8.46925C2.351 8.75401 1.90111 8.773 1.59433 8.52621L1.53089 8.46926C1.22579 8.16417 1.22579 7.66951 1.53087 7.36442L3.89519 4.99975L1.53103 2.63592C1.24628 2.35115 1.2273 1.90127 1.4741 1.5945L1.53105 1.53106C1.83615 1.22597 2.33081 1.22598 2.6359 1.53108Z" fill="white" fill-opacity="0.8"/>
    </svg> `
const successSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0ZM10.5075 4.61813C10.0967 4.2321 9.44832 4.24771 9.057 4.65319L6.06638 7.75192L4.943 6.58739C4.55168 6.18192 3.90326 6.16631 3.49253 6.55234C3.07932 6.94069 3.06332 7.58801 3.457 7.99593L5.32367 9.93014C5.72855 10.3497 6.40479 10.3497 6.80967 9.93014L10.543 6.06172C10.9367 5.6538 10.9207 5.00648 10.5075 4.61813Z" fill="#7FFA8B"/>
</svg>
`
const errorSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_8075_130503)">
<path d="M7 0C8.88122 0 10.6459 0.746384 11.9497 2.05025C13.2536 3.35414 14 5.11879 14 7C14 8.88122 13.2536 10.6459 11.9497 11.9497C10.6459 13.2536 8.88122 14 7 14C5.11879 14 3.35414 13.2536 2.05025 11.9497C0.746384 10.6459 0 8.88122 0 7C0 5.11879 0.746382 3.35414 2.05025 2.05025C3.35414 0.746382 5.11879 0 7 0ZM7 9.1875C6.35567 9.1875 5.83333 9.70984 5.83333 10.3542C5.83333 10.9985 6.35567 11.5208 7 11.5208C7.64433 11.5208 8.16667 10.9985 8.16667 10.3542C8.16667 9.70984 7.64433 9.1875 7 9.1875ZM7 2.10795C6.40692 2.10795 5.92614 2.58874 5.92614 3.18182V7.39773C5.92614 7.99081 6.40692 8.47159 7 8.47159C7.59308 8.47159 8.07386 7.99081 8.07386 7.39773V3.18182C8.07386 2.58874 7.59308 2.10795 7 2.10795Z" fill="#FF4D67"/>
</g>
<defs>
<clipPath id="clip0_8075_130503">
<rect width="14" height="14" fill="white"/>
</clipPath>
</defs>
</svg>
`
const successAudio = new Audio(
  chrome.runtime.getURL("src/public/assets/audio/success.mp3")
);
const errorAudio = new Audio(
  chrome.runtime.getURL("src/public/assets/audio/error.mp3")
);
const baseUrl = "https://extension.tradewiz.ai/api/v1/auth"
const pingSOL = "https://bscext.tradewiz.ai/ping"
function showToast(message, { isError = false, duration = 3000, tradeToast = false } = {}) {
  const toast = document.createElement("div");
  Object.assign(toast.style, {
    position: "fixed",
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "8px",
    zIndex: "10000",
    fontSize: "12px",
    minWidth: "154px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2B2B33",
    border: "1px solid rgba(173, 173, 204, 0.1)",
    cursor: "pointer",
    transition: "opacity 0.3s ease",
  });
  const close = createButtonIcon({
    svg: toastCloseSvg,
    onClick: () => {
      isHovering = false;
      removeToast()
    }
  })
  const article = document.createElement("div")
  article.innerHTML = toastLineSvg
  const spanIcon = document.createElement("span")
  spanIcon.innerHTML = isError ? errorSvg : successSvg
  spanIcon.style.width = "14px"
  spanIcon.style.height = "14px"
  spanIcon.style.marginRight = "8px"
  Object.assign(article.style, {
    position: "absolute",
    left: "0",
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "22px",
  })
  Object.assign(close.style, {
    width: "20px",
    height: "20px",
    marginLeft: "20px",
  })
  toast.innerText = message;
  toast.appendChild(article)
  toast.insertBefore(spanIcon, toast.firstChild)
  toast.appendChild(close)
  document.body.appendChild(toast);

  let timeoutId;
  let isHovering = false;

  const removeToast = () => {
    if (!isHovering) {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  };

  const startTimer = () => {
    if (!isHovering) {
      timeoutId = setTimeout(removeToast, duration);
    }
  };

  const stopTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  toast.addEventListener("mouseenter", () => {
    isHovering = true;
    stopTimer();
  });

  toast.addEventListener("mouseleave", () => {
    isHovering = false;
    startTimer();
  });
  if (tradeToast) {
    if (isError) {
      errorAudio.currentTime = 0;
      errorAudio.play();
    } else {
      successAudio.currentTime = 0;
      successAudio.play();
    }
  }
  startTimer();
}
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000, isTrade = false, showError = false) {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const auth = await chrome.storage.local.get(["tradewiz.token"]);
  if (auth["tradewiz.token"]) {
    options.headers = {
      "Authorization": `Bearer ${auth["tradewiz.token"]}`
    }
    try {
      const response = await fetch(baseUrl + url, { ...options, signal });
      let res = null;
      try {
        res = await response.json();
      } catch (error) {
        throw new Error("Request failed " + response.status)
      }
      if (res.code === 401 && res.message === "User info expired") {
        chrome.storage.local.remove("tradewiz.token");
        chrome.runtime.sendMessage({ message: "checkAuth" });
        throw new Error("Please log in to the TradeWiz extension first")
      }
      if (res.code !== 200) {
        const errorText = res.message || res.error || "failed"
        throw new Error(errorText)
      }
      return res.data;
    } catch (error) {
      if (!isTrade) {
        console.error(error)
        await logError(url, error.message);
        if (showError) {
          showToast(error.message, { isError: true });
        }
        return null;
      }
      if (error.name === "AbortError") {
        await logError(url, error.message);
        showToast("The request took too long and was automatically cancelled. Please try again.", {
          isError: true,
          tradeToast: isTrade
        })
      } else if (error.message?.includes('Failed to fetch')) {
        await logError(url, error.message);
        showToast("Network error. Please check your connection or try again later.", {
          isError: true,
          tradeToast: isTrade
        })
      } else {
        const config = await getStoredValue("tradewiz.config");
        if (config && config.transactionFailed[error.message]) {
          showToast(config.transactionFailed[error.message], {
            isError: true,
            tradeToast: isTrade
          });
        } else {
          showToast(error.message || "An unexpected error occurred. Please refresh the page or try again.", { isError: true, tradeToast: isTrade });
        }
      }
      throw error
    } finally {
      clearTimeout(timeout);
    }
  } else if (url.includes("/trade")) {
    showToast("Please log in to the TradeWiz extension first", {
      isError: true
    })
  }

}
async function initialConnection() {
  const pingURL = await getStoredValue("tradewiz.chain") === 'BSC' ? pingBSC : pingSOL
  await fetch(pingURL)
}

async function sendTradeRequest(data) {
  return await fetchWithTimeout("/trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      platform: window.platform
    }),
  }, 8000, true);
}

async function getTokenInfo(tokenId, lp = "") {
  return await fetchWithTimeout(`/tokeninfo?tokenId=${tokenId || ""}&lp=${lp || ""}`, {
    method: "GET",
  }, 30000);
}

async function getPosition() {
  return await fetchWithTimeout("/tokenlist", {
    method: "GET",
  }, 30000);
}

async function getSolBalance() {
  return await fetchWithTimeout("/solbalance", {
    method: "GET",
  });
}

async function getSolPrice() {
  return await fetchWithTimeout("/solprice", {
    method: "GET",
  });
}

async function getAutoSell() {
  return await fetchWithTimeout("/getautosell", {
    method: "GET",
  });
}
async function setAutoSell(data) {
  return await fetchWithTimeout("/setautosell", {
    method: "POST",
    body: JSON.stringify(data),
  }, timeoutMs = 8000, isTrade = false, showError = true);
}

async function getLimitOrderList() {
  return await fetchWithTimeout("/getLimitOrderList", {
    method: "GET",
  });
}
async function addLimitOrder(data) {
  return await fetchWithTimeout("/addLimitOrder", {
    method: "POST",
    body: JSON.stringify(data),
  }, timeoutMs = 8000, isTrade = false, showError = true);
}
async function deleteLimitOrder(data) {
  return await fetchWithTimeout("/deleteLimitOrder", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getCopyTrading(data) {
  return await fetchWithTimeout("/getCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getCopyTradingList() {
  return await fetchWithTimeout("/getCopyTradingList", {
    method: "GET",
  });
}

async function deleteCopyTrading(data) {
  return await fetchWithTimeout("/deleteCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function enableAllCopyTrading(data) {
  return await fetchWithTimeout("/enableAllCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function disableAllCopyTrading(data) {
  return await fetchWithTimeout("/disableAllCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function switchCopyTrading(data) {
  return await fetchWithTimeout("/switchCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function upsertCopyTrading(data) {
  return await fetchWithTimeout("/upsertCopyTrading", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getAddressType(data) {
  return await fetchWithTimeout("/getAddressType", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getWalletList({ size = 9999, next = "" }) {
  return await fetchWithTimeout(`/siginal/custom-wallet/list?size=${size}&next=${next}`, {
    method: "get"
  });
}

async function addWallets(data) {
  return await fetchWithTimeout("/siginal/custom-wallet/set", {
    method: "POST",
    body: JSON.stringify(data),
  }, 60 * 1000);
}

async function deleteWallet(data) {
  return await fetchWithTimeout("/siginal/custom-wallet/delete", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

async function uploadLog(data) {
  return await fetchWithTimeout("/log", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function uploadLogStat(data) {
  return await fetchWithTimeout("/log/stat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


async function updateSignalSettings(data) {
  return await fetchWithTimeout(`/signal/signal_setting`, {
    method: "POST",
    body: JSON.stringify(data),
  }, 30000);
}
async function signalEvent(data) {
  return await fetchWithTimeout(`/siginal/trace/event`, {
    method: "POST",
    body: JSON.stringify(data),
  }, 30000);
}

async function getSignalSettings(type) {
  return await fetchWithTimeout(`/signal/signal_setting?type=${type}`, {
    method: "GET",
  }, 30000);
}

async function getSignalList({ next = "", size = 15, type = "public" }) {
  return await fetchWithTimeout(`/signal/msgs?size=${size}&type=${type}&next=${next}`, {
    method: "GET",
  }, 30000);
}

async function tokenSearch(data) {
  return await fetchWithTimeout("/token/search", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function cashbackInfo() {
  return await fetchWithTimeout("/cashback/info", {
    method: "get",
  });
}
async function getTwitterUserInfo(username) {
  return await fetchWithTimeout(`/twitter/info/${username}`, {
    method: "get",
  });
}
async function getTwitterCAInfo(username) {
  return await fetchWithTimeout(`/twitter/ca/${username}`, {
    method: "get",
  });
}
async function getTwitterFollowers(username) {
  return await fetchWithTimeout(`/twitter/followers/${username}`, {
    method: "get",
  });
}
async function getTwitterLabelList() {
  return await fetchWithTimeout(`/twitter/label_all`, {
    method: "get",
  });
}
async function setTwitterLabel(data) {
  return await fetchWithTimeout("/twitter/label", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function kolList({ next = "", search = "", is_follow = true }) {
  return await fetchWithTimeout(`/x/kol/list?size=100&next=${next}&search=${search}&is_follow=${is_follow}`, {
    method: "GET",
  });
}
async function kolFollow(data) {
  return await fetchWithTimeout("/x/kol/user/follow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function cashbackClaim() {
  return await fetchWithTimeout("/cashback/claim", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
async function getAccountInfo(data) {
  return await fetchWithTimeout("/account/info/get", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
async function kolUnfollow(data) {
  return await fetchWithTimeout("/x/kol/user/unfollow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function signalTokenDetail(token = "") {
  return await fetchWithTimeout(`/signal/token/detail?token=${token}`, {
    method: "GET",
  });
}

async function signalMsg({ next = "", size = 15 }) {
  return await fetchWithTimeout(`/x/signal/msgs?next=${next}&size=${size}`, {
    method: "GET",
  });
}

async function signalUseSet(platform, type) {
  return await fetchWithTimeout("/signal/use/set", {
    method: "POST",
    body: JSON.stringify({
      platform: platform,
      type: type
    }),
  });
}

async function signalToken(token) {
  return await fetchWithTimeout(`/x/signal/token?token=${token}`, {
    method: "GET",
  });
}

async function subTokens(data) {
  return await fetchWithTimeout("/sub/token", {
    method: "POST",
    body: JSON.stringify(data)
  });
}


async function addressList(data) {
  return await fetchWithTimeout("/address/list", {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function addressNotes(data) {
  return await fetchWithTimeout("/address/notes", {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function addressEdit(data) {
  return await fetchWithTimeout("/address/edit", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function addressInfo(address = "") {
  return await fetchWithTimeout(`/address/info?address=${address}`, {
    method: "GET",
  });
}

async function setAlert(data) {
  return await fetchWithTimeout("/signal/alert/setting", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function deleteAlert(data) {
  return await fetchWithTimeout("/signal/alert/del", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function getAlertList(tokenAddress, next, size = 10) {
  return await fetchWithTimeout(`/signal/alert/get?token=${tokenAddress}&next=${next}&size=${size}`, {
    method: "GET",
  });
}

async function getSignalStatistics() {
  return await fetchWithTimeout("/signal/change/stat", {
    method: "GET",
  });
}

//bsc

const baseUrlBSC = "https://bscext.tradewiz.ai/api/v1/auth"
const pingBSC = "https://extension.tradewiz.ai/ping"
async function fetchWithTimeoutBSC(url, options = {}, timeoutMs = 8000, isTrade = false, showError = false) {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const auth = await chrome.storage.local.get(["tradewiz.tokenBSC"]);
  if (auth["tradewiz.tokenBSC"]) {
    options.headers = {
      "Authorization": `Bearer ${auth["tradewiz.tokenBSC"]}`
    }
    try {
      const response = await fetch(baseUrlBSC + url, { ...options, signal });
      let res = null;
      try {
        res = await response.json();
      } catch (error) {
        throw new Error("Request failed " + response.status)
      }
      if (res.code === 401 && res.message === "User info expired") {
        chrome.storage.local.remove("tradewiz.tokenBSC");
        chrome.runtime.sendMessage({ message: "checkAuth" });
        throw new Error("Please log in to the TradeWiz extension first")
      }
      if (res.code !== 200) {
        const errorText = res.message || res.error || "failed"
        throw new Error(errorText)
      }
      return res.data;
    } catch (error) {
      if (!isTrade) {
        console.error(error)
        await logError(url, error.message);
        if (showError) {
          showToast(error.message, { isError: true });
        }
        return null;
      }
      if (error.name === "AbortError") {
        await logError(url, error.message);
        showToast("The request took too long and was automatically cancelled. Please try again.", {
          isError: true,
          tradeToast: isTrade
        })
      } else if (error.message?.includes('Failed to fetch')) {
        await logError(url, error.message);
        showToast("Network error. Please check your connection or try again later.", {
          isError: true,
          tradeToast: isTrade
        })
      } else {
        const config = await getStoredValue("tradewiz.config");
        let errMessage = error.message
        if (errMessage == "not enough sol") {
          errMessage = "not enough bnb"
        } else if (errMessage == "insufficient balance") {
          errMessage = "insufficient balance bnb"
        }
        if (config && config.transactionFailed[errMessage]) {
          showToast(config.transactionFailed[errMessage], {
            isError: true,
            tradeToast: isTrade
          });
        } else {
          showToast(error.message || "An unexpected error occurred. Please refresh the page or try again.", { isError: true, tradeToast: isTrade });
        }
      }
      throw error
    } finally {
      clearTimeout(timeout);
    }
  } else if (url.includes("/swap")) {
    showToast("Please log in to the TradeWiz extension first", {
      isError: true
    })
  }

}

async function sendTradeRequestBSC(data) {
  return await fetchWithTimeoutBSC("/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      platform: window.platform
    }),
  }, 8000, true);
}

async function getLimitOrderListBSC() {
  return await fetchWithTimeoutBSC("/getLimitOrderList", {
    method: "GET",
  });
}

async function deleteLimitOrderBSC(data) {
  return await fetchWithTimeoutBSC("/deleteLimitOrder", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function getAutoSellBSC() {
  return await fetchWithTimeoutBSC("/getautosell", {
    method: "GET",
  });
}
async function setAutoSellBSC(data) {
  return await fetchWithTimeoutBSC("/setautosell", {
    method: "POST",
    body: JSON.stringify(data),
  }, timeoutMs = 8000, isTrade = false, showError = true);
}

async function getBNBBalance() {
  return await fetchWithTimeoutBSC("/bnbbalance", {
    method: "GET",
  });
}

async function getPositionBSC() {
  return await fetchWithTimeoutBSC("/tokenlist", {
    method: "GET",
  }, 30000);
}

async function getBNBPrice() {
  return await fetchWithTimeoutBSC("/bnbprice", {
    method: "GET",
  });
}

async function getTokenInfoBSC(tokenId, lp = "") {
  return await fetchWithTimeoutBSC(`/tokeninfo?tokenId=${tokenId || ""}&lp=${lp || ""}`, {
    method: "GET",
  }, 30000);
}