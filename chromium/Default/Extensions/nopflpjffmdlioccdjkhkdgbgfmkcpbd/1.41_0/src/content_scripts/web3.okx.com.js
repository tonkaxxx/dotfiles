chrome.storage.local.get("tradewiz.config").then((config) => {
    if (!config || !config["tradewiz.config"]) {
        return;
    }
    const getConfig = config["tradewiz.config"];
    const hostname = window.location.hostname.replace(/www\./, '');
    if (!getConfig || !getConfig[hostname]) {
        return;
    }
    if (hostname !== "web3.okx.com") {
        return;
    }
    let firstQuickBuy = true
    window.quickPanelMap = new Map();
    window.observers = {};
    window.toastId = Math.random().toString(36).substring(2, 10);
    window.platform = 13;
    window.quickBuyButtonClassName = "quick-buy-button";
    window.platformMarketFloatingQuickBuyLog = "okx-market-floating-quickbuy"
    window.platformMarketFloatingBuyLog = "okx-market-floating-buy"
    window.platformPositionSellLog = "okx-position-sell"
    window.keys = {
        "quickPanelPosition": "tradewiz.quickPanelPosition",
        "minimize": "tradewiz.minimize",
        "minimizePosition": "tradewiz.minimizePosition",
        "scale": "tradewiz.scale",
    }
    async function getTokenAddress(card) {
        const bscMatch = card?.innerHTML?.match(/0x[a-fA-F0-9]{40}/);
        if (bscMatch && bscMatch[0]) {
            return bscMatch[0];
        }
        const solMatch = card?.innerHTML?.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
        if (solMatch && solMatch[0]) {
            return solMatch[0];
        }
        return null;
    }
    async function addPulseButtons(card) {
        console.log(card)
        const currentChain = await getStoredValue("tradewiz.chain")
        const selectedPreset = await getPresetValueFnMap[currentChain]();
        const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
        const quickBtn = card.querySelector('button i.dex-okx-defi-dex-quick-filled').closest('button')
        if(!quickBtn){
            return null
        }
        if (quickBtn) {
            addPulseButton(quickBtn, quickBuyAmount, async (arg) => {
                const tokenAddress = await getTokenAddress(card);
                if (!tokenAddress) {
                    showToast('Token get failed', {
                        isError: true
                    })
                    await uploadLog({
                        source: "5",
                        button: "okx-meme-quickbuy",
                        err_message: "Token get failed",
                        is_buy: true,
                        platform: window.platform,
                        mark: card.innerHTML
                    })
                    return;
                }
                const currentChain = await getStoredValue("tradewiz.chain")
                const presetValue = await getStoredValue(presetNameMap[currentChain]);
                const selectedPreset = presetValue?.find(item => item.isDetault)
                    || (presetValue?.length ? presetValue[0] : getDefaultPreset(currentChain));

                return callbackMap[currentChain]({
                    ...arg,
                    selectedPreset,
                    tokenAddress: tokenAddress,
                    "log": "okx-meme-quickbuy"
                })
            });
        }
    }
    function addPulseButton(card, quickBuyAmount, callback = async () => { }) {

        const buyButton = createPlatformButton(
            card.className,
            quickBuyButtonClassName,
            quickBuyAmount,
        );
        // card.remove()
        buyButton.addEventListener("click", async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isNaN(parseFloat(quickBuyAmount)) || parseFloat(quickBuyAmount) <= 0) {
                showToast("Please enter a valid number", { isError: true });
                return;
            }
            buyButton.disabled = true;
            buyButton.style.cursor = "not-allowed";
            await callback({
                "in_amount": parseFloat(quickBuyAmount),
                "is_buy": true,
            });
            buyButton.disabled = false;
            buyButton.style.cursor = "pointer";
        })
        const cardChildren = card.parentElement;
        cardChildren.querySelector(`.${quickBuyButtonClassName}`)?.remove();
        Object.assign(cardChildren.style, {
            display: "flex",
        });
        card.parentElement.appendChild(buyButton);
    }
    async function findOkxTokenContainer(timeout = 10000) {
        await new Promise((r) => setTimeout(r, 500));
        for (let i = 0; i < timeout / 500; i++) {
            const tables = Array.from(document.querySelectorAll('div.dex-virtual-list-holder-inner[role="listbox"]'))
            if (tables.length) {
                return tables;
            }
            await new Promise((r) => setTimeout(r, 500));
        }
        return null;
    }
    let lastExists = null;
    async function setOkxMemeChain() {
        await new Promise((r) => setTimeout(r, 1000));
        const okxBuyInput = document.querySelector('.dex-overflow_scroll-scroll-children')
        if (!okxBuyInput) return
        const observer = new MutationObserver(async (mutations) => {
            let relevantChangeFound = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    if (
                        mutation.target.matches('.dex-picture > img') ||
                        mutation.target.querySelector('.dex-picture > img') ||
                        [...mutation.addedNodes].some(node => node.nodeType === 1 && node.matches('.dex-picture > img')) ||
                        [...mutation.removedNodes].some(node => node.nodeType === 1 && node.matches('.dex-picture > img'))
                    ) {
                        relevantChangeFound = true;
                        break;
                    }
                } else if (mutation.type === 'attributes') {
                    if (mutation.target.matches('.dex-picture > img')) {
                        relevantChangeFound = true;
                        break;
                    }
                } else if (mutation.type === 'characterData') {
                    if (mutation.target.parentElement && mutation.target.parentElement.matches('.dex-picture > img')) {
                        relevantChangeFound = true;
                        break;
                    }
                }
            }
            if (relevantChangeFound) {
                const exists = !!okxBuyInput.querySelector('img[alt="BNB chain"]');
                if (exists !== lastExists) {
                    lastExists = exists;
                    chrome.runtime.sendMessage({ message: "okx-meme" });
                }
            }
        });
        observer.observe(okxBuyInput, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
        });
        observers["okx-meme"] = observers["okx-meme"] || [];
        observers["okx-meme"].push(observer);
    }
    async function watchOkxMeme() {
        await setOkxMemeChain()
        const tables = await findOkxTokenContainer();
        if (!tables || tables.length === 0) return;
        if (tables && tables.length > 0) {
            for (const table of tables) {
                const rows = Array.from(table.querySelectorAll(':scope > div'));
                rows.forEach((r) => addPulseButtons(r));
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "DIV" && node.attributes.length === 0) {
                                addPulseButtons(node);
                                continue;
                            }
                        }
                    }
                });
                observer.observe(table, {
                    childList: true,
                    subtree: true,
                });
                observers["okx-meme"] = observers["okx-meme"] || [];
                observers["okx-meme"].push(observer);
            }
        }
    }

    chrome.runtime.onMessage.addListener(async (request) => {
        if (request.message === "okx-token") {
            await setChain('SOL');
            removeQuickPanel();
            createQuickPanel(undefined, 'SOL');
        } else if (request.message === "okx-token-bsc") {
            await setChain('BSC');
            removeQuickPanel();
            createQuickPanel(undefined, 'BSC');
        } else if (request.message === "hidePanel") {
            removeQuickPanel();
        } else if (request.message === "okx-meme") {
            if (firstQuickBuy) {
                await new Promise((r) => setTimeout(r, 1500));
                firstQuickBuy = false
            }
            const okxBuyInput = document.querySelector('.dex-overflow_scroll-scroll-children')
            const exists = !!okxBuyInput.querySelector('img[alt="BNB chain"]');
            await setChain(exists ? "BSC" : 'SOL');
            initialConnection();
            const discoverObservers = observers["okx-meme"] || [];
            discoverObservers.forEach((observer) => observer.disconnect());
            watchOkxMeme();
            if (request.message !== "quickAmount") {
                removeQuickPanel()
            }
        } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert", "user_trade"].includes(request.message)) {
            return
        } else {
            removeQuickPanel()
        }
    });
}).catch((error) => {
    console.error("Error loading config:", error);
});
