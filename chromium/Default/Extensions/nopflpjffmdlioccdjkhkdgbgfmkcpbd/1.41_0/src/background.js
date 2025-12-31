const tabStatusMap = {};
let socket;
let pingInterval;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 50;
const RECONNECT_DELAY = 5000;
const PING_INTERVAL = 5000;
const PING_TIMEOUT = 10000;
let pingTimeout;
let siteTypeConfig = null;
const defaultPreset = {
  label: "Default",
  values: {
    buyAmounts: [0.1, 1, 2, 5, 10],
    sellPercents: [10, 20, 50, 100],
    buyFee: 0.002,
    buyTip: 0.002,
    buySlippage: 20,
    sellFee: 0.002,
    sellTip: 0.002,
    sellSlippage: 20,
    quickBuy: 0.1,
    antiMev: true,
    sellAntiMev: true,
  }
}
const defaultPresetBSC = {
  label: "Default",
  values: {
    buyAmounts: [0.05, 0.5, 1, 5, 10],
    sellPercents: [10, 20, 50, 100],
    buyFee: 5,
    buySlippage: 20,
    sellFee: 5,
    sellSlippage: 20,
    antiMev: true,
    sellAntiMev: true,
    quickBuy: 0.1,
  }
}


class SocketManager {
  static instance = null;

  constructor(authToken, chain) {
    if (SocketManager.instance && SocketManager?.instance.authToken == authToken) {
      return SocketManager.instance;
    }

    this.authToken = authToken;
    this.chain = chain;
    this.socket = null;
    this.pingInterval = null;
    this.pingTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnect = 50;
    this.reconnectDelay = 5000;
    this.pingIntervalMs = 5000;
    this.pingTimeoutMs = 10000;
    this.manuallyClosed = false;

    this.initSocket();

    SocketManager.instance = this;
  }

  initSocket() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }
    if (this.socket) {
      this.socket.close();
    }

    console.log("Connecting WebSocket...");
    const baseUrl = this.chain === 'BSC' ? 'wss://bscext.tradewiz.ai/api/v1/ws' : 'wss://extension.tradewiz.ai/api/v1/ws';
    this.socket = new WebSocket(`${baseUrl}?auth_token=${encodeURIComponent(this.authToken)}`);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      clearInterval(this.pingInterval);
      clearTimeout(this.pingTimeout);
      this.socket.send("ping");
      this.startPing();
    };

    this.socket.onmessage = async (event) => {
      clearTimeout(this.pingTimeout);
      try {
        const data = JSON.parse(event.data);
        if (data.Type === "price" || data.Type === "trade" || data.Type === "signal-result") {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: data.Activities?.[0] || data.Signal
              });
            });
          });
        } else if (data.Type === "user_trade") {
          const currentTab = await chrome.tabs.query({ active: true });
          let errMessage = data.UserTrade.errorMsg
          if (this.chain == "BSC") {
            if (errMessage == "not enough sol") {
              errMessage = "not enough bnb"
            } else if (errMessage == "insufficient balance") {
              errMessage = "insufficient balance bnb"
            }
          }
          let message = data.UserTrade.status === 1 ? "Transaction confirmed!" : siteTypeConfig?.transactionFailed?.[errMessage] || "Transaction failed";
          if (data.UserTrade.status === 3) {
            message = siteTypeConfig?.transactionFailed?.["timeout"] || "Transaction failed";
          }
          chrome.tabs.sendMessage(currentTab[0].id, {
            message: "showError", text: message, isError: data.UserTrade.status === 1 ? false : true, tradeToast: true
          });
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: data.UserTrade.status === 1 ? "success" : "error"
              });
            });
          });
        } else if (data.Type === "transfer") {
          const solBalance = data.Balance * 10 ** 9
          chrome.storage.local.set({ "tradewiz.balance": solBalance })
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: solBalance
              });
            });
          });
        } else if (data.Type === "limit-order") {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: data.LimitOrder
              });
            });
          });
        } else if (data.Type === "token-mc-vol") {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: {
                  ...data
                }
              });
            });
          });
        } else if (data.Type === "signal_tweet") {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.Type,
                data: data.Tweet
              });
            });
          });
        } else if (data.type === "token-alert") {
          chrome.tabs.query({}, function (tabs) {
            tabs.forEach((tab) => {
              chrome.tabs.sendMessage(tab.id, {
                message: data.type,
                data: data
              });
            });
          });
        }
      } catch (error) {
        // console.error("WebSocket error:", error);
      }
    };

    this.socket.onclose = () => {
      console.warn("WebSocket closed");
      this.cleanup();
      if (this.reconnectAttempts < this.maxReconnect && !this.manuallyClosed) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.initSocket();
        }, this.reconnectDelay);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.socket?.close();
    };
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send("ping");
        this.pingTimeout = setTimeout(() => {
          console.warn("Ping timeout - closing socket");
          this.socket?.close();
        }, this.pingTimeoutMs);
      }
    }, this.pingIntervalMs);
  }

  manualClose() {
    this.manuallyClosed = true;
    this.socket.close()
    this.cleanup()
  }

  cleanup() {
    clearInterval(this.pingInterval);
    clearTimeout(this.pingTimeout);
    this.socket = null;
  }

  static getInstance(authToken, chain) {
    if (!SocketManager.instance || SocketManager?.instance.authToken != authToken) {
      if (SocketManager.instance) {
        SocketManager?.instance?.manualClose()
      }
      SocketManager.instance = new SocketManager(authToken, chain);
    }
    return SocketManager.instance;
  }
}


function getTabCategory(url) {
  if (!url || typeof url !== "string" || !siteTypeConfig) {
    return undefined;
  }
  try {
    verifyLogin();
    const domain = new URL(url).hostname.replace("www.", "");
    const siteConfig = siteTypeConfig[domain];
    if (!siteConfig) {
      return undefined;
    }

    // Check patterns
    for (const pattern of siteConfig.patterns) {
      if (url.includes(pattern.path)) {
        // Handle special conditions
        if (pattern.condition === "shortPath") {
          if (url.split("/").pop().length < 30) {
            return pattern.type;
          }
          continue;
        }
        if (pattern.queryParams) {
          if (url.includes(pattern.queryParams)) {
            return pattern.type;
          }
          continue;
        }
        return pattern.type;
      }
    }
    // Return default type if no patterns match
    return siteConfig.defaultType;
  } catch (error) {
    return undefined;
  }
}

function normalizeUrl(url) {
  return url?.replace(/(https:\/\/gmgn\.ai\/(bsc|sol)\/token\/)(?:[A-Za-z0-9]+_)?/, '$1');
}

function isSameTokenUrl(url1, url2) {
  const url1_ = url1?.replace("?tag=remarks", "")
  const url2_ = url2?.replace("?tag=remarks", "")
  return normalizeUrl(url1_) === normalizeUrl(url2_) || url1_ === url2_;
}
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete" && !changeInfo?.url?.includes("axiom.trade")) return;
  const tab = await chrome.tabs.get(tabId);
  const previousTabStatus = tabStatusMap[tabId] || {};
  if ((isSameTokenUrl(previousTabStatus.url, tab.url) && previousTabStatus.status === changeInfo.status) || (previousTabStatus.url === tab.url && previousTabStatus?.url?.includes('axiom.trade') && previousTabStatus?.url?.includes('?chain=') && tab.url.includes('axiom.trade') && tab.url.includes('?chain='))) return;
  tabStatusMap[tabId] = { url: tab.url, status: changeInfo.status };
  const message = getTabCategory(tab.url, "onUpdated");
  if (message) {
    try {
      await chrome.tabs.sendMessage(tabId, {
        message,
        event: "onUpdated",
        url: tab.url,
      });
    } catch (error) {
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          message,
          event: "onUpdated",
          url: tab.url,
        });
      }, 1000)
    }
  } else {
    delete tabStatusMap[tabId];
  }
});

chrome.tabs.onActivated.addListener(async (details) => {
  const { tabId } = details;
  const tab = await chrome.tabs.get(tabId);
  const message = getTabCategory(tab.url);
  if (message) {
    chrome.tabs.sendMessage(tabId, {
      message,
      event: "onActivated",
      url: tab.url,
    });
  } else {
    delete tabStatusMap[tabId];
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  let changeUrl = details.url;
  if (!changeUrl || changeUrl === "about:blank" || changeUrl === "chrome://new-tab-page/") {
    try {
      const tab = await chrome.tabs.get(details.tabId);
      changeUrl = tab?.url || "";
    } catch {
      console.log("tabs.get.error");
      return;
    }
  }
  const tabStatus = tabStatusMap[details.tabId] || {};
  if (!changeUrl.includes("debot.ai/meme") && tabStatus.url === changeUrl && tabStatus.status === "complete") {
    if (tabStatus.url === changeUrl && tabStatus.status === "complete") {
      if (changeUrl.includes('axiom.trade') && !changeUrl.includes('?chain=')) return;
      return delete tabStatusMap[details.tabId];
    }
  }
  tabStatusMap[details.tabId] = { url: changeUrl, status: "complete" };
  const message = getTabCategory(changeUrl);
  if (message) {
    chrome.tabs.sendMessage(details.tabId, {
      message,
      event: "onCompleted",
      url: changeUrl,
    });
  } else {
    delete tabStatusMap[details.tabId];
  }
});


chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "update") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/public/whats_new.html"),
    });
  }
  if (details.reason === "install") {
    setTimeout(() => {
      chrome.tabs.create({
        url: "https://fastradewiz.com/extensionhome",
      });
    }, 1000);
  }
});


async function getConfig() {
  const response = await fetch("https://extension.tradewiz.ai/new-extension-config.json?t=" + Date.now(), {
    method: "GET",
  });
  try {
    const res = await response.json();
    siteTypeConfig = res;
    chrome.storage.local.set({ "tradewiz.config": res });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch config:", error);
    return null;
  }
}

function verifyUserLogin() {
  chrome.storage.local.get(["tradewiz.token"], function (result) {
    if (result["tradewiz.token"]) {
      SocketManager.getInstance(result["tradewiz.token"], 'SOL');
      chrome.action.setPopup({ popup: "src/public/popup.html" });
    } else {
      chrome.action.setPopup({ popup: "src/public/landing.html" });
    }
  });
}
function verifyUserLoginBSC() {
  chrome.storage.local.get(["tradewiz.tokenBSC"], function (result) {
    if (result["tradewiz.tokenBSC"]) {
      SocketManager.getInstance(result["tradewiz.tokenBSC"], 'BSC');
      chrome.action.setPopup({ popup: "src/public/popupBSC.html" });
    } else {
      chrome.action.setPopup({ popup: "src/public/landing.html" });
    }
  });
}
function verifyLogin() {
  chrome.storage.local.get(["tradewiz.chain"], function (result) {
    if (result["tradewiz.chain"] === "BSC") {
      verifyUserLoginBSC();
    } else {
      verifyUserLogin();
    }

  })
}

chrome.runtime.onMessage.addListener(async function (request, _sender, sendResponse) {
  switch (request.message) {
    case "openTab":
      chrome.tabs.create({
        url: request.url,
      });
      break;
    case "checkAuth":
      verifyLogin();
      break;
    case "showPanel":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          const message = getTabCategory(tab.url);
          if (message) {
            chrome.tabs.sendMessage(tab.id, {
              message,
              event: "onUpdated",
              url: tab.url,
            });
          }
        });
      });
      break;
    case "hidePanel":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            message: "hidePanel",
          });
        });
      });
      break;
    case "showError":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "showError", text: request.text, isError: request.isError, tradeToast: request.tradeToast });
        });
      });
      break;
    case "quickAmount":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          const message = getTabCategory(tab.url);
          if (message) {
            chrome.tabs.sendMessage(tab.id, {
              message,
              event: "onUpdated",
              url: tab.url,
              source: "quickAmount"
            });
          }
        });
      });
    case "showPosition":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "showPosition", value: request.value });
        });
      });
      break;
    case "alphaSignal":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "alphaSignal", value: request.value });
        });
      });
      break;
    case "switchKeyboard":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "switchKeyboard", value: request.value });
        });
      });
      break;
    case "switchPreset":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          const message = getTabCategory(tab.url);
          if (message) {
            chrome.tabs.sendMessage(tab.id, {
              message,
              event: "onUpdated",
              url: tab.url,
              source: "switchPreset"
            });
          }
        });
      });
      break;
    case "showAddressLab":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "showAddressLab", value: request.value });
        });
      });
      break;
    case "showCurrentToken":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "showCurrentToken", value: request.value });
        });
      });
      break;
    case "showTwitter":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "showTwitter", value: request.value });
        });
      });
      break;
    case "padre-trenches":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "padre-trenches", value: request.value });
        });
      });
      break;
    case "okx-meme":
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { message: "okx-meme", value: request.value });
        });
      });
      break;
    default:
      break;
  }
});
async function getStoredValue(key) {
  const value = await chrome.storage.local.get(key);
  return value[key];
}
const generatePreset = async () => {
  const storedPresets = (await getStoredValue("tradewiz.presets")) || [];
  const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
  const {
    "tradewiz.quickAmount": quickAmount = 0.1
  } = await chrome.storage.local.get(["tradewiz.quickAmount"]);

  if (storedPresets.length > 0) {
    const newPreset = storedPresets.map((preset, index) => {
      return {
        label: `P${index + 1}`,
        values: {
          ...preset.values,
          quickBuy: quickAmount,
        }
      }
    })
    if (newPreset.length < 3) {
      for (let i = newPreset.length; i < 3; i++) {
        newPreset.push({
          label: `P${i + 1}`,
          values: {
            ...defaultPreset.values,
            antiMev: antiMev,
            sellAntiMev: antiMev,
            quickBuy: quickAmount,
          }
        })
      }
    }
    chrome.storage.local.remove("tradewiz.presets");
    chrome.storage.local.set({ "tradewiz.newPreset": newPreset });
  } else if (!storedNewPreset.length) {
    const newPreset = [0, 1, 2].map(index => {
      return {
        label: `P${index + 1}`,
        values: {
          ...defaultPreset.values,
          isDetault: index === 0
        }
      }
    })
    chrome.storage.local.set({ "tradewiz.newPreset": newPreset });
  }
}

const generatePresetBSC = async () => {
  const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
  if (!storedNewPreset.length) {
    const newPreset = [0, 1, 2].map(index => {
      return {
        label: `P${index + 1}`,
        values: {
          ...defaultPresetBSC.values,
          isDetault: index === 0
        }
      }
    })
    chrome.storage.local.set({ "tradewiz.newPresetBSC": newPreset });
  }
}

const uploadError = async () => {
  const errors = await getStoredValue("tradewiz.error");
  const auth = await getStoredValue("tradewiz.token");
  if (!auth) return;
  if (errors && errors.length > 0) {
    const response = await fetch("https://extension.tradewiz.ai/api/v1/auth/log/stat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth}`
      },
      body: JSON.stringify({
        mark: JSON.stringify(errors)
      }),
    })
    const res = await response.json();
    if (res.code === 200) {
      chrome.storage.local.remove("tradewiz.error");
    }
  }
}

verifyLogin();
getConfig();
generatePreset()
generatePresetBSC()
setInterval(() => {
  getConfig();
  uploadError();
}, 60000);
