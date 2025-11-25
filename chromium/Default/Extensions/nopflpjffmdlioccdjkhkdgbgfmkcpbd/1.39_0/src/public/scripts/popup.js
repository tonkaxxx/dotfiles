const quickBuyInput = document.getElementById("quickBuy");
const walletInfoPublicKey = document.querySelector(".main-header-right-public-key");
const copyIcon = document.querySelector(".main-header-right");
const logoutBtn = document.querySelector(".logout-btn");
const discordBtn = document.querySelector(".discord-btn");
const twiterBtn = document.querySelector(".twiter-btn");
const presetMore = document.querySelector(".main-preset-more");
const mainHeaderPosItemBalance = document.querySelector(".main-header-pos-item-balance");
const mainHeaderPosItemTokenBalance = document.querySelector(".main-header-pos-item-token-balance");
const mainPresetSelect = document.querySelector(".main-preset-select");
const buyAmountsInput = document.getElementById("buyAmounts");
const sellPercentsInput = document.getElementById("sellPercents");
const positionCheckbox = document.getElementById("positionCheckbox");
const panelCheckbox = document.getElementById("panelCheckbox");
const alphaSignal = document.getElementById("alphaSignal");
const addressLab = document.getElementById("addressLab");
const twitterCheckbox = document.getElementById("twitterCheckbox");
const currentTokenCheckbox = document.getElementById("currentTokenCheckbox");

const setPosition = (response) => {
  const balance = response.balance / 10 ** 9
  const solPrice = response.solPrice
  const tokens = response.tokens
  let tokenBalance = 0
  tokens.forEach(({ token }) => {
    const amount = token.amount / 10 ** token.decimals
    const priceInSol = token.priceInSol * 10 ** token.decimals / 10 ** 9
    tokenBalance += amount * priceInSol
  })
  mainHeaderPosItemBalance.innerText = `${balance.toFixed(3)}/$${(balance * solPrice).toFixed(2)}`
  mainHeaderPosItemTokenBalance.innerText = `$${(tokenBalance * solPrice).toFixed(2)}`
}
const loadPositionInfo = async () => {
  const cachedPosition = await getStoredValue("tradewiz.position")
  if (cachedPosition) {
    setPosition(cachedPosition)
  }
  const response = await getPosition()
  if (!response || !response.tokens) {
    return
  }
  chrome.storage.local.set({
    "tradewiz.position": response
  })
  setPosition(response)
}
const loadSolBalance = async () => {
  const response = await getSolBalance()
  walletInfoPublicKey.innerText = formatAddress(response.publicKey);
  copyIcon.addEventListener("mouseenter", () => {
    copyIcon.style.color = "white";
  });
  copyIcon.addEventListener("mouseleave", () => {
    copyIcon.style.color = "";
  });
  copyIcon.addEventListener("click", () => {
    navigator.clipboard.writeText(response.publicKey);
    const svgs = copyIcon.querySelectorAll("svg");
    svgs[0].style.display = "none";
    svgs[1].style.display = "block";
    setTimeout(() => {
      svgs[0].style.display = "block";
      svgs[1].style.display = "none";
    }, 1000);

    chrome.runtime.sendMessage({
      message: "showError",
      text: "SOL address copied to clipboard",
      isError: false
    });
  });
}
const loadPresetsInfo = async (preset) => {
  mainPresetSelect.value = preset.label
  buyAmountsInput.value = preset.values["buyAmounts"].join(", ")
  quickBuyInput.value = preset.values["quickBuy"]
  sellPercentsInput.value = preset.values["sellPercents"].join(", ")
}
const setDefaultPreset = async (preset) => {
  const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
  chrome.storage.local.set({
    "tradewiz.newPreset": storedNewPreset.map(item => ({
      ...item,
      isDetault: item.label === preset.label
    }))
  }, () => {
    chrome.runtime.sendMessage({ message: "switchPreset" });
  });
}
const buyAmountsChange = async () => {
  buyAmountsInput.addEventListener("change", async (e) => {
    const value = e.target.value.trim()
    let buyAmountsArr = [];
    if (value) {
      buyAmountsArr = value.split(",").map((val) => {
        try {
          const num = parseFloat(val.trim());
          if (isNaN(num)) {
            throw new Error("Invalid number");
          }
          return num;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    }
    if (buyAmountsArr.length === 0) {
      showToast("Please enter a valid buy amount", { isError: true });
      return;
    }
    if (buyAmountsArr.length > 10) {
      showToast("Buy Amount supports up to 10 values", { isError: true });
      return;
    }
    const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
    const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
    preset.values["buyAmounts"] = buyAmountsArr
    chrome.storage.local.set({ "tradewiz.newPreset": storedNewPreset });
  })
}
const sellPercentsChange = async () => {
  sellPercentsInput.addEventListener("change", async (e) => {
    const value = e.target.value.trim()
    let sellPercentsArr = [];
    if (value) {
      sellPercentsArr = value.split(",").map((val) => {
        try {
          const num = parseFloat(val.trim());
          if (isNaN(num)) {
            throw new Error("Invalid number");
          }
          return num;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    }
    if (sellPercentsArr.length === 0) {
      showToast("Please enter a valid sell percent", { isError: true });
      return
    }
    if (sellPercentsArr.length > 10) {
      showToast("Sell Percent supports up to 10 values", { isError: true });
      return;
    }
    const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
    const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
    preset.values["sellPercents"] = sellPercentsArr
    chrome.storage.local.set({ "tradewiz.newPreset": storedNewPreset });
  })
}
const quickBuyChange = async () => {
  quickBuyInput.addEventListener("input", async (e) => {
    const value = e.target.value.trim()
    const quickBuy = parseFloat(value)
    if (!isNaN(quickBuy) && quickBuy > 0) {
      const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
      const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
      preset.values["quickBuy"] = quickBuy
      chrome.storage.local.set({ "tradewiz.newPreset": storedNewPreset });
      chrome.runtime.sendMessage({
        message: "quickAmount",
      });
    }
  })
}
const loadPreset = async () => {
  const defaultPreset = await getPresetValue()
  const storedNewPreset = (await getStoredValue("tradewiz.newPreset")) || [];
  const options = storedNewPreset.map(item => {
    return `<option value="${item.label}">${item.label}</option>`
  })
  mainPresetSelect.innerHTML = options.join("")
  loadPresetsInfo(defaultPreset)
  mainPresetSelect.addEventListener("change", (e) => {
    const preset = storedNewPreset.find(item => item.label === e.target.value)
    setDefaultPreset(preset)
    loadPresetsInfo(preset)
  })
  buyAmountsChange()
  sellPercentsChange()
  quickBuyChange()
}

document.addEventListener("DOMContentLoaded", () => {
  // chrome.runtime.sendMessage({ message: "checkAuth" });
  loadPreset()
  loadSolBalance()
  loadPositionInfo()
  chrome.storage.local.get(["tradewiz.config", "tradewiz.showPosition", "tradewiz.showPanel", "tradewiz.alphaSignal", "tradewiz.showAddressLab", "tradewiz.showCurrentToken", "tradewiz.showTwitter"], async function (result) {
    if (result["tradewiz.config"]) {
      const config = result["tradewiz.config"];
      const support = config.support;
      const twitter = config.twitter;
      if (!support) {
        discordBtn.style.display = "none";
      }
      if (!twitter) {
        twiterBtn.style.display = "none";
      }
      discordBtn.addEventListener("click", async () => {
        const config = await getStoredValue("tradewiz.config")
        chrome.runtime.sendMessage({ message: "openTab", url: config.support });
      });
      twiterBtn.addEventListener("click", async () => {
        const config = await getStoredValue("tradewiz.config")
        chrome.runtime.sendMessage({ message: "openTab", url: config.twitter });
      });
    }
    if (result["tradewiz.showPosition"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="position"]`).checked = false;
    }
    if (result["tradewiz.showPanel"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="panel"]`).checked = false;
    }
    if (result["tradewiz.showAddressLab"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="address"]`).checked = false;
    }
    if (result["tradewiz.showCurrentToken"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="currentToken"]`).checked = false;
    }
    if (result["tradewiz.showTwitter"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="twitter"]`).checked = false;
    }
    if (result["tradewiz.alphaSignal"] === false) {
      document.querySelector(`label.custom-checkbox input[name="trade"][value="signal"]`).checked = false;
    }
  });

  presetMore.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ message: "openTab", url: chrome.runtime.getURL("/src/public/settings.html") });
  });

  logoutBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ message: "logout" }, async () => {
      await chrome.storage.local.remove("tradewiz.token");
      await chrome.storage.local.remove("tradewiz.balance");
      await chrome.storage.local.remove("tradewiz.solPrice");
      smoothRedirect("/src/public/landing.html");
    });
  })
  positionCheckbox.addEventListener("change", (e) => {
    chrome.storage.local.set({ "tradewiz.showPosition": e.target.checked }, () => {
      chrome.runtime.sendMessage({ message: "showPosition", value: e.target.checked });
    });
  });
  alphaSignal.addEventListener("change", (e) => {
    chrome.storage.local.set({ "tradewiz.alphaSignal": e.target.checked }, async () => {
      chrome.runtime.sendMessage({ message: "alphaSignal", value: e.target.checked });
      let event_value = '0'
      if (e.target.checked) {
        event_value = '1'
      } else {
        event_value = '0'
      }
      await signalEvent({ event_type: 'alpha_signal', event_value })
    });
  })
  panelCheckbox.addEventListener("change", (e) => {
    chrome.storage.local.set({ "tradewiz.showPanel": e.target.checked }, () => {
      chrome.runtime.sendMessage({ message: "showPanel" });
    });
  });
  addressLab.addEventListener("change", (e) => {
    chrome.storage.local.set({ "tradewiz.showAddressLab": e.target.checked }, () => {
      chrome.runtime.sendMessage({ message: "showAddressLab", value: e.target.checked });
    });
  });
  currentTokenCheckbox.addEventListener("change", (e) => {
    chrome.storage.local.set({ "tradewiz.showCurrentToken": e.target.checked }, () => {
      chrome.runtime.sendMessage({ message: "showCurrentToken", value: e.target.checked });
    });
  });
  // twitterCheckbox.addEventListener("change", (e) => {
  //   chrome.storage.local.set({ "tradewiz.showTwitter": e.target.checked }, () => {
  //     chrome.runtime.sendMessage({ message: "showTwitter", value: e.target.checked });
  //   });
  // });
  settingsBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ message: "openTab", url: chrome.runtime.getURL("src/public/signal/tradewiz.html") });
  });
});