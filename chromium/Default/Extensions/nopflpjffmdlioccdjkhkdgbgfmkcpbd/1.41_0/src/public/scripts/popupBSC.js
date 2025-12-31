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
const openBot = document.getElementById("openBot");
const bscBots = [
    "https://t.me/TradeWiz_Evmbot",
]
const setPosition = (response) => {
    const balance = response.balance / 10 ** 18
    const bnbPrice = response.bnbPrice
    const tokens = response.tokens
    let tokenBalance = 0
    tokens.forEach(({ token }) => {
        const amount = token.tokenBalance / 10 ** token.decimals
        const priceInBNB = token.priceInBnb * 10 ** token.decimals / 10 ** 18
        tokenBalance += amount * priceInBNB
    })
    mainHeaderPosItemBalance.innerText = `${balance.toFixed(3)}/$${(balance * bnbPrice).toFixed(2)}`
    mainHeaderPosItemTokenBalance.innerText = `$${(tokenBalance * bnbPrice).toFixed(2)}`
}
const loadPositionBSC = async () => {
    const cachedPosition = await getStoredValue("tradewiz.positionBSC")
    if (cachedPosition) {
        setPosition(cachedPosition)
    }
    const response = await getPositionBSC()
    const response_ = await getBNBBalance()
    const { bnbPrice = 0 } = await getBNBPrice()
    if (!response || !response.tokens) {
        return
    }
    chrome.storage.local.set({
        "tradewiz.positionBSC": { ...response, balance: response_.balance, bnbPrice }
    })
    setPosition({ ...response, balance: response_.balance, bnbPrice })
}
const loadBNBBalance = async () => {
    const response = await getBNBBalance()
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
            text: "BSC address copied to clipboard",
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
    const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
    chrome.storage.local.set({
        "tradewiz.newPresetBSC": storedNewPreset.map(item => ({
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
        const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
        const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
        preset.values["buyAmounts"] = buyAmountsArr
        chrome.storage.local.set({ "tradewiz.newPresetBSC": storedNewPreset });
    })
}
const quickBuyChange = async () => {
    quickBuyInput.addEventListener("input", async (e) => {
        const value = e.target.value.trim()
        const quickBuy = parseFloat(value)
        if (!isNaN(quickBuy) && quickBuy > 0) {
            const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
            const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
            preset.values["quickBuy"] = quickBuy
            chrome.storage.local.set({ "tradewiz.newPresetBSC": storedNewPreset });
            chrome.runtime.sendMessage({
                message: "quickAmount",
            });
        }
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
        const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
        const preset = storedNewPreset.find(item => item.label === mainPresetSelect.value)
        preset.values["sellPercents"] = sellPercentsArr
        chrome.storage.local.set({ "tradewiz.newPresetBSC": storedNewPreset });
    })
}

const loadPresetBSC = async () => {
    const defaultPreset = await getPresetValueBSC()
    const storedNewPreset = (await getStoredValue("tradewiz.newPresetBSC")) || [];
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
    loadPresetBSC()
    loadBNBBalance()
    loadPositionBSC()
    chrome.storage.local.get(["tradewiz.config", "tradewiz.showPanel"], async function (result) {
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
        if (result["tradewiz.showPanel"] === false) {
            document.querySelector(`label.custom-checkbox input[name="trade"][value="panel"]`).checked = false;
        }
    });

    presetMore.addEventListener("click", () => {
        chrome.runtime.sendMessage({ message: "openTab", url: chrome.runtime.getURL("/src/public/evm/settingsBSC.html") });
    });

    logoutBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ message: "logout" }, async () => {
            await chrome.storage.local.remove("tradewiz.tokenBSC");
            await chrome.storage.local.remove("tradewiz.balanceBNB");
            await chrome.storage.local.remove("tradewiz.bnbPrice");
            await chrome.storage.local.remove("tradewiz.position.sorted");
            smoothRedirect("/src/public/landing.html");
        });
    })
    panelCheckbox.addEventListener("change", (e) => {
        chrome.storage.local.set({ "tradewiz.showPanel": e.target.checked }, () => {
            chrome.runtime.sendMessage({ message: "showPanel" });
        });
    });
    openBot.addEventListener("click", async () => {
        let loginBotBSC = await getStoredValue("tradewiz.loginBotBSC");
        if (!loginBotBSC) {
            const randomBot = bscBots[Math.floor(Math.random() * bscBots.length)];
            loginBotBSC = randomBot;
        }
        window.open(`${loginBotBSC}`, "_blank");
    });
});