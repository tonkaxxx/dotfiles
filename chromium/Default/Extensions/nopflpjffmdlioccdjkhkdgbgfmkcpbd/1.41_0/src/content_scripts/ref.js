chrome.storage.local.get("tradewiz.config").then((config) => {
    if (!config || !config["tradewiz.config"]) {
        return;
    }
    const getConfig = config["tradewiz.config"];
    if (!getConfig || !getConfig[window.location.hostname]) {
        return;
    }
    if (window.location.hostname !== "fastradewiz.com") {
        return;
    }
    (async () => {
        const ref = localStorage.getItem("ref");
        if (ref) {
            await chrome.storage.local.set({ ["tradewiz.ref"]: ref })
        }
    })()
}).catch((error) => {
    console.error("Error loading config:", error);
});