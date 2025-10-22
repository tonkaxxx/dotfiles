const tgBots = [
  "https://t.me/TradeWiz_Solbot",
  "https://t.me/WizGandalfBot",
  "https://t.me/WizSarumanBot",
  "https://t.me/WizVoldemortBot",
  "https://t.me/WizLoki_bot",
  "https://t.me/WizMedivhBot",
]
const discordBtn = document.querySelector(".discord-btn");
const twiterBtn = document.querySelector(".twiter-btn");
document.addEventListener("DOMContentLoaded", async () => {
  chrome.runtime.sendMessage({ message: "checkAuth" });
  initEventListeners();
  chrome.storage.local.get(["tradewiz.config"], function (result) {
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
  });
});

function handleCodeVerification() {
  const errorMessage = document.querySelector(".error");
  const verifyButton = document.getElementById("verify");
  const codeInput = document.getElementById("code");
  const getCodeButton = document.getElementById("getCode");
  if (verifyButton && codeInput) {
    codeInput.addEventListener("input", () => {
      if (codeInput.value.trim()) {
        getCodeButton.disabled = true;
        verifyButton.disabled = false;
      } else {
        getCodeButton.disabled = false;
        verifyButton.disabled = true;
      }
    });
    verifyButton.addEventListener("click", () => {
      if (!codeInput.value.trim()) {
        errorMessage.innerHTML = "Click the Get Code button to get a code.";
        return;
      }
      fetch(`https://extension.tradewiz.ai/api/v1/access-token/${codeInput.value.trim()}`, { method: "GET", }).then((response) => response.json())
        .then((data) => {
          if (data.data?.access_token) {
            chrome.storage.local.set(
              { "tradewiz.token": data.data.access_token },
              function () {
                chrome.action.setPopup({ popup: "popup.html" });
                smoothRedirect("popup.html");
                chrome.tabs.query({}, function (tabs) {
                  tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, { message: "loginSuccess" });
                  });
                });
              },
            );
          } else {
            codeInput.classList.add("input-error");
            codeInput.style.borderColor = "#FF4D67";
            errorMessage.innerHTML = "code verification failed";
          }
        })
        .catch((error) => {
          errorMessage.innerHTML = error.message || "code verification failed";
        });
    });
  }
}

function handleGetCode() {
  const getCodeButton = document.getElementById("getCode");
  if (getCodeButton) {
    getCodeButton.addEventListener("click", async () => {
      let loginBot = await getStoredValue("tradewiz.loginBot");
      const ref = await getStoredValue("tradewiz.ref");
      if (!loginBot) {
        const randomBot = tgBots[Math.floor(Math.random() * tgBots.length)];
        chrome.storage.local.set({ "tradewiz.loginBot": randomBot });
        loginBot = randomBot;
      }
      if (ref) {
        window.open(`${loginBot}?start=login-extension-${ref}`, "_blank");
      } else {
        window.open(`${loginBot}?start=login-extension`, "_blank");
      }
    });
  }
}

function initEventListeners() {
  handleCodeVerification();
  handleGetCode();
}
