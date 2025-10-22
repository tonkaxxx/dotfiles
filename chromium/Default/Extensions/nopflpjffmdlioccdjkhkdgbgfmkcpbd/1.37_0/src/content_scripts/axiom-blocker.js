chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  if (!getConfig || !getConfig[window.location.hostname]) {
    return;
  }
  if (window.location.hostname !== "axiom.trade") {
    return;
  }
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('src/overrides/axiom.js')
  script.defer = true;
  (document.head || document.documentElement).appendChild(script);
  script.remove()
}).catch((error) => {
  console.error("Error loading config:", error);
});