const tgBots = [
  "https://t.me/TradeWiz_Solbot",
  "https://t.me/WizGandalfBot",
  "https://t.me/WizSarumanBot",
  "https://t.me/WizVoldemortBot",
  "https://t.me/WizLoki_bot",
  "https://t.me/WizMedivhBot",
]
const bscBots = [
  "https://t.me/TradeWiz_Evmbot",
]
// chrome.runtime.onMessage.addListener(async (request) => {
//   if (request.message === "gmgn-meme" || request.message === "new-pair" || request.message === "gmgn-token-bsc" || request.message === "gmgn-token" || "gmgn-bsc") {
//     window.location.reload()
//   }
// })
const discordBtn = document.querySelector(".discord-btn");
const twiterBtn = document.querySelector(".twiter-btn");
document.addEventListener("DOMContentLoaded", async () => {
  chrome.runtime.sendMessage({ message: "checkAuth" });
  const bscToken = await getStoredValue("tradewiz.tokenBSC");
  const solToken = await getStoredValue("tradewiz.token");
  const loginTip = document.querySelector(".login-tip");
  const landingBG = document.querySelector(".landing-bg");
  const logo = document.querySelector(".main-header-left")
  const chainSelector = document.getElementById("chainDropdown");
  if (!bscToken && solToken) {
    landingBG.style.display = "none";
    loginTip.style.display = "block";
    logo.style.display = "block";
    chainSelector.style.display = "block";
    loginTip.innerHTML = "You're not logged in to the BSC network yet.Verify below to unlock full trading features.";
  } else if (bscToken && !solToken) {
    landingBG.style.display = "none";
    loginTip.style.display = "block";
    logo.style.display = "block";
    chainSelector.style.display = "block";
    loginTip.innerHTML = "You're not logged in to the SOL network yet.Verify below to unlock full trading features.";
  } else {
    loginTip.style.display = "none";
    landingBG.style.display = "block";
    logo.style.display = "none";
    chainSelector.style.display = "none";
  }


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
      chrome.storage.local.get(["tradewiz.config", "tradewiz.selectedChain"], function (result) {
        const selectedChain = result["tradewiz.selectedChain"]
        if (selectedChain == 'BSC') {
          fetch(`https://bscext.tradewiz.ai/api/v1/access-token/${codeInput.value.trim()}`, { method: "GET", }).then((response) => response.json())
            .then((data) => {
              if (data.data?.access_token) {
                chrome.storage.local.set(
                  { "tradewiz.tokenBSC": data.data.access_token },
                  function () {
                    chrome.action.setPopup({ popup: "src/public/popupBSC.html" });
                    smoothRedirect("/src/public/popupBSC.html");
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
        } else {
          fetch(`https://extension.tradewiz.ai/api/v1/access-token/${codeInput.value.trim()}`, { method: "GET", }).then((response) => response.json())
            .then((data) => {
              if (data.data?.access_token) {
                chrome.storage.local.set(
                  { "tradewiz.token": data.data.access_token },
                  function () {
                    chrome.action.setPopup({ popup: "src/public/popup.html" });
                    smoothRedirect("/src/public/popup.html");
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

        }
      })

    });
  }
}

function handleGetCode() {
  const getCodeButton = document.getElementById("getCode");
  if (getCodeButton) {

    getCodeButton.addEventListener("click", async () => {
      const selectedChain = await getStoredValue("tradewiz.selectedChain");
      const tokenBSC = await getStoredValue("tradewiz.tokenBSC");
      const token = await getStoredValue("tradewiz.token");
      if (selectedChain == 'SOL' && !token && tokenBSC) {
        openBot('SOL');
        closePopup();
      } else if (selectedChain == 'BSC' && !tokenBSC && token) {
        openBot('BSC');
        closePopup();
      } else {
        createNetworkPopup()
      }

    });
  }
}

function initEventListeners() {
  handleCodeVerification();
  handleGetCode();
}
// select network modal
function createNetworkPopup() {
  if (document.getElementById('net-popup-overlay')) return;

  // ---------- create overlay ----------
  const overlay = document.createElement('div');
  overlay.id = 'net-popup-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.25)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
  });
  document.body.appendChild(overlay);

  // ---------- create modal ----------
  const popupBorder = document.createElement('div');
  Object.assign(popupBorder.style, {
    background: "linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)",
    padding: '1px',
    width: '172px',
    height: '72px',
    position: 'relative',
    right: '-57px',
    top: '230px',
    borderRadius: '6px',
    boxShadow: 'none',
    outline: 'none'
  })
  const popup = document.createElement('div');
  Object.assign(popup.style, {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'flex-start',
    width: '100%',
    height: "100%",
    background: 'rgba(22, 22, 28, 1)',
    borderRadius: '6px',
    padding: '7px 12px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    color: '#ADADCC',
    userSelect: 'none',
    boxShadow: 'none',
    outline: 'none'
  });

  popupBorder.appendChild(popup);
  overlay.appendChild(popupBorder);

  // ---------- general make item ----------
  function makeItem(contentNode) {
    const item = document.createElement('div');
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '7px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(173, 173, 204, 0.2)',
      cursor: "pointer",
      height: '28px',
      width: '71px',
      color: 'white',
      fontSize: '14px'
      // color: 'rgba(173, 173, 204, 0.05)'
    });
    item.addEventListener('mouseenter', () => {
      item.style.background = '#03102aff';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    item.appendChild(contentNode);
    return item;
  }

  // ---------- title ----------
  const titleNode = document.createElement('div');
  titleNode.textContent = 'Select Network:';
  Object.assign(titleNode.style, {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
    textAlign: 'start'
  });
  popup.appendChild(titleNode);

  const buttonsList = document.createElement('div');
  Object.assign(buttonsList.style, {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
    width: '100%',
    display: 'flex',
    gap: '6px',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px'
  });
  popup.appendChild(buttonsList);

  // ---------- Solana ----------
  const solNode = document.createElement('div');
  solNode.style.display = 'flex';
  solNode.style.alignItems = 'center';
  solNode.style.gap = '4px';

  const solImg = document.createElement('img');
  solImg.src = 'assets/images/solana.png';
  Object.assign(solImg.style, {
    width: '18px',
    height: '18px',
  });
  solNode.appendChild(solImg);

  const solText = document.createElement('div');
  solText.textContent = 'SOL';
  Object.assign(solText.style, { fontWeight: 400 });
  solNode.appendChild(solText);

  const solItem = makeItem(solNode);
  solItem.addEventListener('click', () => {
    console.log('Selected SOL');
    openBot('SOL');
    closePopup();
  });
  buttonsList.appendChild(solItem);

  // ---------- BSC ----------
  const bscNode = document.createElement('div');
  bscNode.style.display = 'flex';
  bscNode.style.alignItems = 'center';
  bscNode.style.gap = '4px';

  const bscImg = document.createElement('img');
  bscImg.src = 'assets/images/BSC.png';
  Object.assign(bscImg.style, {
    width: '18px',
    height: '18px',
  });
  bscNode.appendChild(bscImg);

  const bscText = document.createElement('div');
  bscText.textContent = 'BSC';
  Object.assign(bscText.style, { fontWeight: 400 });
  bscNode.appendChild(bscText);

  const bscItem = makeItem(bscNode);
  bscItem.addEventListener('click', () => {
    openBot('BSC');
    closePopup();
  });
  buttonsList.appendChild(bscItem);

  // ---------- close logic ----------
  function closePopup() {
    document.removeEventListener('keydown', onKeyDown);
    overlay.remove();
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
  function onKeyDown(e) {
    if (e.key === 'Escape') closePopup();
  }
  document.addEventListener('keydown', onKeyDown);

  // popup.setAttribute('role', 'dialog');
  // popup.setAttribute('aria-modal', 'true');
  popup.tabIndex = -1;
  popup.focus();
}

async function openBot(chain) {
  if (chain == 'SOL') {
    chrome.storage.local.set({ "tradewiz.selectedChain": "SOL" });
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
  } else if (chain == 'BSC') {
    chrome.storage.local.set({ "tradewiz.selectedChain": "BSC" });
    let loginBotBSC = await getStoredValue("tradewiz.loginBotBSC");
    const ref = await getStoredValue("tradewiz.refBSC");
    if (!loginBotBSC) {
      const randomBot = bscBots[Math.floor(Math.random() * bscBots.length)];
      chrome.storage.local.set({ "tradewiz.loginBotBSC": randomBot });
      loginBotBSC = randomBot;
    }
    if (ref) {
      window.open(`${loginBotBSC}?start=login-extension-${ref}`, "_blank");
    } else {
      window.open(`${loginBotBSC}?start=login-extension`, "_blank");
    }
  }
}