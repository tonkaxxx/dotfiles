
chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "kolscan.io") {
    return;
  }
  const tgBots = [
    "https://t.me/TradeWiz_Solbot",
    "https://t.me/WizGandalfBot",
    "https://t.me/WizSarumanBot",
    "https://t.me/WizVoldemortBot",
    "https://t.me/WizLoki_bot",
    "https://t.me/WizMedivhBot",
  ]
  const findAlertContainer = async (timeout = 20000) => {
    for (let i = 0; i < timeout / 500; i++) {
      const links = Array.from(document.querySelectorAll("a"));
      const alertContainer = links.find(link => link.className.includes("account_alertsContainer"));
      if (alertContainer) {
        return alertContainer;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  const extractAddress = () => {
    const url = window.location.href.split("/").pop();
    return url;
  }
  const createTradeButton = async () => {
    const alertContainer = await findAlertContainer();
    if (alertContainer) {
      if (alertContainer.querySelector(".trade-button")) return;
      const copyButton = document.createElement("a");
      const icon = createIcon(
        chrome.runtime.getURL("src/public/assets/images/small-logo.png"),
        {
          height: "auto",
          marginRight: "6px",
          borderRadius: "50%",
        },
        "16px"
      );
      copyButton.textContent = "Copy Trade";
      copyButton.prepend(icon);
      copyButton.className = alertContainer.className;
      let loginBot = await getStoredValue("tradewiz.loginBot");
      if (!loginBot) {
        const randomBot = tgBots[Math.floor(Math.random() * tgBots.length)];
        chrome.storage.local.set({ "tradewiz.loginBot": randomBot });
        loginBot = randomBot;
      }
      copyButton.href = `${loginBot}?start=r-Kolscan-${extractAddress()}`;
      copyButton.target = "_blank";
      Object.assign(copyButton.style, {
        background: "#AC8AFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "transparent",
      });
      copyButton.classList.add("trade-button");
      alertContainer.parentElement.insertBefore(copyButton, alertContainer.nextSibling);
    }
  }

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "kolscan-account") {
      createTradeButton();
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});