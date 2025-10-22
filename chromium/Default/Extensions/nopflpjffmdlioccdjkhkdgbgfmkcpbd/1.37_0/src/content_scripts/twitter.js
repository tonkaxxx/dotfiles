chrome.storage.local.get("tradewiz.config").then((config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "x.com") {
    return;
  }
  window.quickPanelMap = new Map();
  window.observers = {};
  window.toastId = Math.random().toString(36).substring(2, 10);
  window.platform = 5;
  window.quickBuyButtonClassName = "quick-buy-button";
  window.platformMarketFloatingQuickBuyLog = "twitter-market-floating-quickbuy"
  window.platformMarketFloatingBuyLog = "twitter-market-floating-buy"
  window.platformPositionSellLog = "twitter-position-sell"
  window.keys = {
    "quickPanelPosition": "tradewiz.quickPanelPosition",
    "minimize": "tradewiz.minimize",
    "minimizePosition": "tradewiz.minimizePosition",
    "scale": "tradewiz.scale",
  }
  function formatTimeString(str) {
    const date = new Date(str);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  function getTwitterUsername(url) {
    const match = url.match(/(?:x\.com|twitter\.com)\/([^/?]+)/);
    return match ? match[1] : null;
  }

  function getColorScheme() {
    return document.documentElement.style.getPropertyValue('color-scheme');
  }
  const fontColor = () => getColorScheme() == "light" ? "black" : 'white'
  const backgroundColor = () => getColorScheme() == "light" ? "linear-gradient(rgba(172, 138, 255, 0.20), rgba(172, 138, 255, 0.20)),white" : 'linear-gradient(rgba(172, 138, 255, 0.2), rgba(172, 138, 255, 0.2)),black'
  const popupBackground = () => getColorScheme() == "light" ? "white" : 'black'
  async function findHomeContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const container = document.querySelector('main');
      if (container) return container;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function findUserNameContainer(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const container = document.querySelector('div[data-testid="UserName"]');
      if (container) return container;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }

  async function createTokenButton() {
    const containers = document.querySelectorAll(".tradewiz-container");
    containers.forEach((container) => {
      container.remove();
    });

    const container = await findHomeContainer();
    if (!container) return;
    const allTweets = container.querySelectorAll('article');
    for (const tweet of allTweets) {
      addPulseButtons(tweet, "tweet");
    }
    const allBios = container.querySelectorAll('div[data-testid="UserDescription"]');
    for (const bio of allBios) {
      addPulseButtons(bio, "bio");
    }
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          const addedTweets = Array.from(m.addedNodes).map((n) => Array.from(n.childNodes).find((c) => c.nodeName.toLowerCase() === 'div' && c.innerHTML.includes('data-testid="tweetText"'))).filter((t) => t !== undefined);
          addedTweets.forEach((tweet) => {
            addPulseButtons(tweet, "tweet");
          });
          const addedBio = Array.from(m.addedNodes).map((n) => Array.from(n.childNodes).find((c) => c.nodeName.toLowerCase() === 'div' && c.innerHTML.includes('data-testid="UserDescription"'))).filter((t) => t !== undefined);
          addedBio.forEach((bio) => {
            addPulseButtons(bio, "bio");
          });
          const XUserNameContainer = Array.from(m.addedNodes).map((n) => Array.from(n.childNodes).find((c) => c.nodeName.toLowerCase() === 'div' && c.innerHTML.includes('data-testid="UserName"'))).filter((t) => t !== undefined);
          if (XUserNameContainer) {
            addFollowers()
          }
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });
  }

  async function addPulseButtons(card, type) {
    try {
      const existingButtonContainer = card.querySelector(".tradewiz-container");
      if (existingButtonContainer) return;
      let parentNode;
      if (type === "tweet") {
        parentNode = card.querySelector('div[data-testid="tweetText"]');
        if (!parentNode) return;
      } else {
        parentNode = card;
      }
      async function transformNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const regex = /\b[1-9A-HJ-NP-Za-km-z]{43,44}\b/g;
          let match;
          let lastIndex = 0;
          const fragment = document.createDocumentFragment();

          while ((match = regex.exec(text)) !== null) {
            const address = match[0];
            const start = match.index;
            const end = start + address.length;

            if (start > lastIndex) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
            }

            const addressSpan = document.createElement("span");
            addressSpan.textContent = address;
            const button = await addPulseButton(address, async (arg) => {
              const presets = await chrome.storage.local.get("tradewiz.newPreset");
              const presetValue = presets["tradewiz.newPreset"];
              const selectedPreset = presetValue?.find(item => item.isDetault)
                || (presetValue?.length ? presetValue[0] : defaultPreset);
              return tradeCallback({
                ...arg,
                selectedPreset,
                tokenAddress: address
              })
            });
            addressSpan.appendChild(button);
            fragment.appendChild(addressSpan);
            lastIndex = end;
          }

          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
          }

          if (fragment.childNodes.length > 0) {
            node.replaceWith(fragment);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.nodeName.toLowerCase() === "a") {
            const anchorText = node.textContent;
            const anchorHref = node.getAttribute("href") || "";
            const addressRegex = /\b[1-9A-HJ-NP-Za-km-z]{43,44}\b/;

            const match = anchorText.match(addressRegex) || anchorHref.match(addressRegex);
            if (match) {
              const address = match[0];
              const button = await addPulseButton(address, async (arg) => {
                const presets = await chrome.storage.local.get("tradewiz.newPreset");
                const presetValue = presets["tradewiz.newPreset"];
                const selectedPreset = presetValue?.find(item => item.isDetault)
                  || (presetValue?.length ? presetValue[0] : defaultPreset);
                return tradeCallback({
                  ...arg,
                  selectedPreset,
                  tokenAddress: address
                })
              });
              node.insertAdjacentElement("afterend", button);
              return;
            }
          }

          const children = Array.from(node.childNodes);
          for (const child of children) {
            transformNode(child);
          }
        }
      }

      for (const child of Array.from(parentNode.childNodes)) {
        transformNode(child);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function addPulseButton(address, callback = async () => { }) {
    const selectedPreset = await getPresetValue();
    const quickBuyAmount = selectedPreset.values.quickBuy || 0.1;
    const container = createStyledDiv({
      display: "inline-flex",
      gap: "4px",
      alignItems: "center",
      justifyContent: "center",
    });
    container.className = "tradewiz-container";
    container.setAttribute("data-token", address);

    const tokenInfo = createStyledDiv({
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#ADADCC",
    });

    const buyButton = createButton(
      quickBuyAmount,
      "confirm_buy"
    );

    const buyIcon = createButton(
      "",
      "confirm_buy"
    );
    Object.assign(buyIcon.style, {
      minWidth: "30px",
      margin: "0",
      height: '26px',
      borderRadius: '8px',
    });
    Object.assign(buyButton.style, {
      height: '26px',
      borderRadius: '8px',
    });
    const buyIconImg = buyIcon.querySelector("img");
    buyIconImg.style.marginRight = "0";


    buyButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isNaN(parseFloat(quickBuyAmount)) || parseFloat(quickBuyAmount) <= 0) {
        showToast("Please enter a valid number", { isError: true });
        return;
      }
      await callback({
        "in_amount": parseFloat(quickBuyAmount),
        "is_buy": true,
      });
    });

    buyIcon.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      removeQuickPanel();
      createQuickPanel(address);
    });

    container.appendChild(tokenInfo);
    container.appendChild(buyButton);
    container.appendChild(buyIcon);
    return container;
  }
  function addSummay(summaryText) {
    //summary
    function addPopup(parentContainer) {
      const summaryPopupWrapper = createStyledDiv({
        width: '240px',
        borderRadius: '8px',
        padding: '1px',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
        position: 'absolute',
        left: '-250px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 99
      });
      summaryPopupWrapper.id = "summary-popup"
      const summaryTitle = createStyledDiv({
        height: '30px',
        width: '238px',
        display: 'flex',
        color: 'white',
        fontWeight: 600,
        fontSize: '14px',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        paddingRight: '12px',
      }, null, "TradeWiz Summary")
      const logoWhite = document.createElement('img')
      logoWhite.src = chrome.runtime.getURL("src/public/assets/images/logo4.png")
      applyStyles(logoWhite, {
        width: '28px',
        height: '18px',
        marginLeft: 'auto'
      })
      summaryTitle.appendChild(logoWhite)
      const summaryPopupContaner = createStyledDiv({
        height: '118px',
        width: '238px',
        borderRadius: '8px',
        background: popupBackground(),
        fontSize: '12px',
        fontWeight: 400,
        color: fontColor(),
        lineHeight: '16px',
        flex: "1",
        padding: '10px 12px 12px 12px'
      }, null, summaryText);
      summaryPopupWrapper.appendChild(summaryTitle)
      summaryPopupWrapper.appendChild(summaryPopupContaner)
      parentContainer.appendChild(summaryPopupWrapper)
    }
    const summaryContainer = createStyledDiv({
      display: 'flex',
      alignItems: 'center',
      color: "inherit",
      fontSize: "13px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "24px",
      textDecoration: 'underline',
      cursor: 'pointer',
      marginLeft: 'auto',
      position: 'relative',
    }, null, 'View Summary')
    const logo = document.createElement('img')
    logo.src = chrome.runtime.getURL("src/public/assets/images/logo3.png")
    applyStyles(logo, {
      width: '22px',
      height: '14px',
      marginLeft: '4px'
    })
    summaryContainer.appendChild(logo)
    summaryContainer.onmouseenter = () => {
      addPopup(summaryContainer)
    }
    summaryContainer.onmouseleave = () => {
      const summaryPopup = document.querySelector('#summary-popup')
      if (summaryPopup) {
        summaryPopup.remove()
      }
    }
    return summaryContainer
  }
  function getWalletItem(walletData) {
    const walletItemWrapper = createStyledDiv({
      padding: '1px',
      background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
      width: '140px',
      height: '26px',
      marginRight: '4px',
      marginLeft: '4px',
      borderRadius: '100px'
    });
    const walletItemContainer = createStyledDiv({
      width: '138px',
      height: '24px',
      borderRadius: '100px',
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '2px',
      paddingRight: '2px',
      background: backgroundColor(),
      alignItems: 'center'
    });
    const walletAvatar = document.createElement('img')
    walletAvatar.src = chrome.runtime.getURL("src/public/assets/images/solana.png")
    applyStyles(walletAvatar, {
      width: '18px',
      height: '18px',
      borderRadius: '18px'
    })
    const walletAddress = createStyledDiv({
      color: fontColor(),
      fontSize: '12px',
      fontWeight: 700,
      height: '20px',
      lineHeight: '20px'
    }, null, formatAddress(walletData.address))


    const copyButton = createButtonIcon({
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd"  d="M12.2227 0C13.2043 0 14 0.795744 14 1.77734V9.59766C14 10.5793 13.2043 11.375 12.2227 11.375H11.375V12.2227C11.375 13.2043 10.5793 14 9.59766 14H1.77734C0.795744 14 0 13.2043 0 12.2227V4.40234C0 3.42074 0.795744 2.625 1.77734 2.625H2.625V1.77734C2.625 0.795744 3.42074 0 4.40234 0H12.2227ZM9.59766 4.375H1.77734C1.76224 4.375 1.75 4.38724 1.75 4.40234V12.2227C1.75 12.2378 1.76224 12.25 1.77734 12.25H9.59766C9.61276 12.25 9.625 12.2378 9.625 12.2227V4.40234C9.625 4.38724 9.61276 4.375 9.59766 4.375ZM12.2227 1.75H4.40234C4.38724 1.75 4.375 1.76224 4.375 1.77734V2.625H9.59766C10.5793 2.625 11.375 3.42074 11.375 4.40234V9.625H12.2227C12.2378 9.625 12.25 9.61276 12.25 9.59766V1.77734C12.25 1.76224 12.2378 1.75 12.2227 1.75Z" fill="${getColorScheme() == "light" ? "#AC8AFF" : "white"}"/>
    </svg>`,
      width: '20px',
      height: '20px',
      styles: { background: getColorScheme() == "light" ? "white" : "rgba(173, 173, 204, 0.10)" },
      onClick: () => {
        navigator.clipboard.writeText(walletData.address).then(function () {
          showToast("Copy success", { isError: false });
        })
      }
    })
    walletItemContainer.appendChild(walletAvatar)
    walletItemContainer.appendChild(walletAddress)
    walletItemContainer.appendChild(copyButton)
    walletItemWrapper.appendChild(walletItemContainer)
    return walletItemWrapper
  }
  function addWalletsContainer(wallets) {
    const [firstWallet] = wallets
    function addWalletsPopup(parentContainer) {
      const walletsPopupWrapper = createStyledDiv({
        width: '320px',
        borderRadius: '8px',
        padding: '1px',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
        position: 'absolute',
        right: '-320px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 99
      });
      walletsPopupWrapper.id = "wallets-popup"
      const walletsTitle = createStyledDiv({
        height: '30px',
        width: '320px',
        display: 'flex',
        color: 'white',
        fontWeight: 600,
        fontSize: '14px',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        paddingRight: '12px',
      }, null, "Linked Wallets")
      const logoWhite = document.createElement('img')
      logoWhite.src = chrome.runtime.getURL("src/public/assets/images/logo4.png")
      applyStyles(logoWhite, {
        width: '28px',
        height: '18px',
        marginLeft: 'auto'
      })
      walletsTitle.appendChild(logoWhite)
      const walletsPopupContaner = createStyledDiv({
        width: '318px',
        borderRadius: '8px',
        background: popupBackground(),
        fontSize: '12px',
        fontWeight: 400,
        color: fontColor(),
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '10px 8px',
        alignContent: 'flex-start',
        flex: 1
      })
      for (let i = 0; i < wallets.length; i++) {
        walletsPopupContaner.appendChild(getWalletItem(wallets[i]))
      }
      const copyAll = createStyledDiv({
        width: '100%',
        height: '20px',
        fontSize: '12px',
        fontWeight: 700,
        color: getColorScheme() == "light" ? "#AC8AFF" : "white",
        display: 'flex',
        gap: "4px",
        justifyContent: 'center',
        alignItems: 'center',
        textDecoration: 'underline'
      })
      copyAll.innerHTML = `Copy All<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 14 14" fill="none">
  <path d="M12.2227 0C13.2043 0 14 0.795744 14 1.77734V9.59766C14 10.5793 13.2043 11.375 12.2227 11.375H11.375V12.2227C11.375 13.2043 10.5793 14 9.59766 14H1.77734C0.795744 14 0 13.2043 0 12.2227V4.40234C0 3.42074 0.795744 2.625 1.77734 2.625H2.625V1.77734C2.625 0.795744 3.42074 0 4.40234 0H12.2227ZM9.59766 4.375H1.77734C1.76224 4.375 1.75 4.38724 1.75 4.40234V12.2227C1.75 12.2378 1.76224 12.25 1.77734 12.25H9.59766C9.61276 12.25 9.625 12.2378 9.625 12.2227V4.40234C9.625 4.38724 9.61276 4.375 9.59766 4.375ZM12.2227 1.75H4.40234C4.38724 1.75 4.375 1.76224 4.375 1.77734V2.625H9.59766C10.5793 2.625 11.375 3.42074 11.375 4.40234V9.625H12.2227C12.2378 9.625 12.25 9.61276 12.25 9.59766V1.77734C12.25 1.76224 12.2378 1.75 12.2227 1.75Z" fill="${getColorScheme() == "light" ? "#AC8AFF" : "white"}"/>
</svg>`

      copyAll.onclick = () => {
        navigator.clipboard.writeText(wallets.map(wallet => wallet.address).join(', ')).then(function () {
          showToast("Copy success", { isError: false });
        })
      }
      walletsPopupContaner.appendChild(copyAll)
      walletsPopupWrapper.appendChild(walletsTitle)
      walletsPopupWrapper.appendChild(walletsPopupContaner)
      parentContainer.appendChild(walletsPopupWrapper)
    }
    //wallets
    const walletsContainer = createStyledDiv({
      display: 'flex',
      alignItems: 'center',
      color: "#71767B",
      fontSize: "14px",
      fontWeight: 700,
      cursor: 'pointer',
    }, null, 'Wallets')
    const walletItem = getWalletItem(firstWallet)
    walletsContainer.appendChild(walletItem)

    const walletCountWrapper = createStyledDiv({
      padding: '1px',
      background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
      width: '26px',
      height: '26px',
      borderRadius: '13px',
      position: 'relative'
    })
    walletCountWrapper.onmouseenter = () => {
      const popup = document.querySelector("#wallets-popup")
      if (popup) return
      addWalletsPopup(walletCountWrapper)
    }
    walletCountWrapper.onmouseleave = () => {
      const popup = document.querySelector("#wallets-popup")
      if (popup) {
        popup.remove()
      }
    }
    const walletCountContainer = createStyledDiv({
      width: '24px',
      height: '24px',
      borderRadius: '13px',
      background: backgroundColor(),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      position: 'relative',
      color: fontColor(),
      fontWeight: 600,
    }, null, `+${wallets.length}`)
    walletCountWrapper.appendChild(walletCountContainer)
    if (wallets.length > 1) {
      walletsContainer.appendChild(walletCountWrapper)
    }
    return walletsContainer
  }
  function addNameContainer(usernameHistory, flexStyle) {
    function addNamePopup(parentContainer) {
      const namePopupWrapper = createStyledDiv({
        width: '280px',
        borderRadius: '8px',
        padding: '1px',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
        position: 'absolute',
        left: '0px',
        top: '100%',
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column'
      });
      namePopupWrapper.id = "name-popup"
      const namePopupTitle = createStyledDiv({
        height: '30px',
        width: '280px',
        display: 'flex',
        color: 'white',
        fontWeight: 600,
        fontSize: '14px',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        paddingRight: '12px',
      }, null, "Username History")
      const logoWhite = document.createElement('img')
      logoWhite.src = chrome.runtime.getURL("src/public/assets/images/logo4.png")
      applyStyles(logoWhite, {
        width: '28px',
        height: '18px',
        marginLeft: 'auto'
      })
      namePopupTitle.appendChild(logoWhite)
      const namePopupContainer = createStyledDiv({
        width: '278px',
        borderRadius: '8px',
        background: popupBackground(),
        fontSize: '12px',
        fontWeight: 400,
        color: fontColor(),
        lineHeight: '16px',
        padding: '10px 12px 12px 12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })

      for (let i = 0; i < usernameHistory.length; i++) {
        const { oldTwitterUsername, updatedAt } = usernameHistory[i]
        const nameItem = createStyledDiv({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 12px',
          width: '100%'
        })
        const nameLeft = createStyledDiv({
          color: fontColor(),
          fontSize: '12px',
          fontWeight: 500,
        }, null, oldTwitterUsername)
        const formatted = formatTimeString(updatedAt);
        const nameRight = createStyledDiv({
          color: getColorScheme() == "light" ? 'black' : "rgba(255, 255, 255, 0.60)",
          fontSize: '12px',
          fontWeight: 400,
        }, null, formatted)

        nameItem.appendChild(nameLeft)
        nameItem.appendChild(nameRight)
        namePopupContainer.appendChild(nameItem)
      }
      namePopupWrapper.appendChild(namePopupTitle)
      namePopupWrapper.appendChild(namePopupContainer)
      parentContainer.appendChild(namePopupWrapper)
    }
    const nameContainer = createStyledDiv({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '130px',
      color: "inherit",
      fontSize: '14px',
      position: 'relative',
      marginLeft: flexStyle,
      fontWeight: 600,
    }, null, usernameHistory.length)
    const nameTitle = createStyledDiv({
      color: '#71767B',
      fontSize: '14px',
      marginLeft: '2px',
      fontWeight: 600,
    }, null, "Name change")
    nameContainer.appendChild(nameTitle)
    nameContainer.onmouseenter = () => {
      if (usernameHistory.length) {
        addNamePopup(nameContainer)
      }
    }
    nameContainer.onmouseleave = () => {
      const namePopup = document.querySelector('#name-popup')
      if (namePopup) {
        namePopup.remove()
      }
    }
    return nameContainer
  }


  // function handleClickOutside(event) {
  //   const popup = document.querySelector("#tradewiz-ca-popup")
  //   if (popup && !popup.contains(event.target)) {
  //     console.log(event)
  //     popup.remove();
  //     document.removeEventListener('click', handleClickOutside);
  //   }
  // }

  // setTimeout(() => {
  //   document.addEventListener('click', handleClickOutside);
  // }, 0);

  function addCAHistory(caInfo, username, flexStyle) {
    function addCAPopup(parentContainer) {
      const caPopupWrapper = createStyledDiv({
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
        padding: '1px',
        width: "640px",
        height: "560px",
        borderRadius: '8px',
        position: 'fixed',
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 99,
      })
      caPopupWrapper.id = "tradewiz-ca-popup"
      const caPopupContainer = createStyledDiv({
        width: "638px",
        borderRadius: '8px',
        height: "558px",
        background: popupBackground(),
        display: 'flex',
        flexDirection: 'column',
        color: fontColor(),
        alignItems: 'center',
        padding: '0px 16px',
        overflowY: 'scroll',
      })
      const caPopupHeader = createStyledDiv({
        width: "638px",
        padding: '0px 16px',
      })
      const caPopupBody = createStyledDiv({
        width: "638px",
        padding: '0px 16px',
        overflowY: 'scroll',
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        overflowX: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      })


      const caContainerTop = createStyledDiv({
        width: "100%",
        height: "56px",
        padding: '13px 0px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // background: 'black'
      })
      const caTopLeft = createStyledDiv({ display: 'flex', alignItems: 'center' })
      caTopLeft.innerHTML = `<div style="color:${fontColor()};font-size:16px;font-weight:600;margin-right:4px;">CA mentioned by</div><div style="color:#AC8AFF;font-size:14px;font-weight:400;">@${username}</div>`

      const caTopRight = createStyledDiv({ display: 'flex', alignItems: 'center' })
      const logoLink = chrome.runtime.getURL("src/public/assets/images/logo3.png")
      caTopRight.innerHTML = `<div style="font-size:14px;font-weight:700;color:#71767B;">Powered By</div><img src="${logoLink}" style="width:22px;height:14px;padding:0px 4px;" /><div style="font-size:14px;font-weight:700;color:${getColorScheme() == "light" ? 'black' : '#E7E9EA'};margin-right:4px;">Tradewiz Extension</div>`
      const closeButton = createButtonIcon(
        {
          svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.69031 2.1436L6.99944 5.45274L10.3097 2.1436C10.7084 1.74494 11.3382 1.71835 11.7677 2.06385L11.8565 2.14358C12.2837 2.57071 12.2837 3.26324 11.8565 3.69039L8.54644 6.99974L11.8568 10.3103C12.2554 10.7089 12.282 11.3388 11.9365 11.7683L11.8567 11.8571C11.4296 12.2842 10.7371 12.2842 10.3099 11.857L6.99944 8.54674L3.6901 11.857C3.29144 12.2557 2.6616 12.2823 2.23211 11.9368L2.1433 11.8571C1.71616 11.4299 1.71615 10.7374 2.14326 10.3103L5.45331 6.99974L2.1435 3.69038C1.74484 3.29171 1.71827 2.66187 2.06378 2.23239L2.14352 2.14358C2.57066 1.71645 3.26318 1.71646 3.69031 2.1436Z" fill="${getColorScheme() == "light" ? 'black' : 'currentColor'}"/>
        </svg>`,
          width: '14px',
          height: '14px',
          tips: "",
          onClick: () => {
            const closeTweetElement = document.querySelector('#tradewiz-ca-popup')
            if (closeTweetElement) {
              closeTweetElement.remove()
            }
          }
        })
      caTopRight.appendChild(closeButton)
      caContainerTop.appendChild(caTopLeft)
      caContainerTop.appendChild(caTopRight)


      const caStatistics = createStyledDiv({
        display: 'flex',
        justifyContent: 'flex-start',
        height: '32px',
        alignItems: 'center'
      })
      function getRedIcon() {
        return createStyledDiv({ background: "#FF4D67", width: '8px', height: '8px', borderRadius: '4px' })
      }
      function getGreenIcon() {
        return createStyledDiv({ background: "#7FFA8B", width: '8px', height: '8px', borderRadius: '4px' })
      }
      const deletedCount = createStyledDiv({ fontSize: '14px', fontWeight: 700, color: fontColor(), marginRight: '6px', gap: '8px', display: 'flex', alignItems: 'center' }, null, `${caInfo?.deletedCACount} Deleted`)
      const undeletedCount = createStyledDiv({ fontSize: '14px', fontWeight: 700, color: fontColor(), gap: '8px', display: 'flex', alignItems: 'center' }, null, `${caInfo?.undeletedCACount} Active`)
      deletedCount.prepend(getRedIcon())
      undeletedCount.prepend(getGreenIcon())
      caStatistics.appendChild(deletedCount)
      caStatistics.appendChild(undeletedCount)

      caPopupHeader.appendChild(caContainerTop)
      caPopupHeader.appendChild(caStatistics)
      caPopupContainer.appendChild(caPopupHeader)

      const deletedTitle = createStyledDiv({ fontSize: '14px', fontWeight: 700, color: fontColor(), marginRight: '6px', gap: '8px', display: 'flex', alignItems: 'center' }, null, `${caInfo?.deletedCACount} Deleted tweets`)
      const undeletedTitle = createStyledDiv({ fontSize: '14px', fontWeight: 700, color: fontColor(), marginRight: '6px', gap: '8px', display: 'flex', alignItems: 'center' }, null, `${caInfo?.undeletedCACount} Active tweets`)
      const tweetContainer1 = createStyledDiv({ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' })
      const tweetContainer2 = createStyledDiv({ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' })
      deletedTitle.prepend(getRedIcon())
      undeletedTitle.prepend(getGreenIcon())

      const addTweetItem = (tweet, type) => {

        let color = "#FF4D67"
        let backgroundColor = "rgba(255, 77, 103, 0.20)"
        if (type == 1) {
          color = "#FF4D67"
          backgroundColor = "rgba(255, 77, 103, 0.20)"
        } else {
          color = getColorScheme() == "light" ? "black" : "rgba(255, 255, 255, 0.80)"
          backgroundColor = getColorScheme() == "light" ? "rgba(173, 173, 204, 0.15)" : "rgba(173, 173, 204, 0.15)"
        }
        const tweetItemDeleted = createStyledDiv({
          width: "608px",
          // height: "122px",
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${color}`
        })
        const tweetTitle = createStyledDiv({ display: 'flex', justifyContent: 'space-between', height: '20px' })

        tweetTitle.innerHTML = `
        <div style="display:flex;align-items:center;">
          ${type == 1 ? `<div style="color:${color};font-family: Kanit;font-size: 12px;display:flex;
          font-weight: 400;line-height: 12px;height:20px;padding: 2px 6px;background:${backgroundColor};
          justify-content:center;align-items:center;border-radius:4px;">${username}</div>` : ''}
          <div style="color:#ADADCC;font-family: Kanit;font-size: 14px;font-weight: 300;margin-left:4px;">${formatTimeString(tweet.updatedAt)}</div>
        </div>
        <div  style="display:flex;align-items:center;">
          <div style="color: ${color};font-family: Kanit;font-size: 12px;font-weight: 400;
          height:20px;padding: 2px 6px;background:${backgroundColor};
          justify-content:center;align-items:center;border-radius:4px;">${formatAddress(tweet.ca)}</div>
          <div style="height:20px;width:20px;border-radius:4px;background:rgba(173, 173, 204, 0.15);margin-left:4px;cursor:pointer;
          display:flex;justify-content:center;align-items:center;" id="twiter-id-${tweet.id}" >
          <img src="${chrome.runtime.getURL("src/public/assets/images/copy.png")}" style="width:12px;height:12px" />
          </div>
        </div>`
        tweetTitle.querySelector(`#twiter-id-${tweet.id}`).addEventListener('click', () => {
          navigator.clipboard.writeText(tweet.ca).then(function () {
            showToast("Copy success", { isError: false });
          })
        })
        const textColor = getColorScheme() == "light" ? "rgba(0, 0, 0, 0.60)" : "rgba(255, 255, 255, 0.60)";
        const tweetText = createStyledDiv({
          flex: 1,
          width: '100%',
          color: textColor,
          fontSize: '14px',
          fontWeight: 400,
          marginTop: '7px',
          padding: '0px',
          overflow: 'hidden'
        }, null, tweet?.content?.replace(/\n+/g, '\n'))

        const tweetFooter = createStyledDiv({
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '24px',
          marginTop: '12px',
        })
        const likes = createStyledDiv({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          fontSize: '14px',
          fontWeight: 400,
          gap: '4px',
          height: '16px'
        })
        likes.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
<path d="M8.73995 1.20834C8.02712 1.17334 7.1772 1.50584 6.47078 2.46834L6.0012 3.10417L5.53103 2.46834C4.82403 1.50584 3.97353 1.17334 3.2607 1.20834C2.53562 1.24917 1.89045 1.66334 1.5632 2.32251C1.2412 2.97584 1.19395 3.94417 1.84262 5.13417C2.46912 6.28334 3.74253 7.62501 6.0012 8.99001C8.2587 7.62501 9.53153 6.28334 10.158 5.13417C10.8061 3.94417 10.7589 2.97584 10.4363 2.32251C10.109 1.66334 9.46445 1.24917 8.73995 1.20834ZM11.1824 5.69417C10.3943 7.14084 8.84845 8.68084 6.29462 10.1683L6.0012 10.3433L5.7072 10.1683C3.15278 8.68084 1.60695 7.14084 0.817699 5.69417C0.024366 4.23584 -0.00480059 2.85917 0.517866 1.80334C1.03528 0.759172 2.06195 0.105839 3.20178 0.0475056C4.16487 -0.00499438 5.16645 0.374172 6.00062 1.22001C6.8342 0.374172 7.83578 -0.00499438 8.79828 0.0475056C9.93812 0.105839 10.9648 0.759172 11.4822 1.80334C12.0049 2.85917 11.9757 4.23584 11.1824 5.69417Z" fill="${textColor}"/>
</svg>${tweet.quoteCount}`
        const retweets = createStyledDiv({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          fontSize: '14px',
          fontWeight: 400,
          gap: '4px',
          height: '16px'
        }, null, tweet.retweetCount)
        retweets.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
<path d="M2.62498 2.26331L5.21031 4.67831L4.41464 5.52997L3.20831 4.40414V9.33331C3.20831 9.97497 3.73098 10.5 4.37498 10.5H7.58331V11.6666H4.37498C3.08639 11.6666 2.04164 10.6225 2.04164 9.33331V4.40414L0.835309 5.52997L0.0396423 4.67831L2.62498 2.26331ZM9.62498 3.49997H6.41664V2.33331H9.62498C10.9136 2.33331 11.9583 3.37747 11.9583 4.66664V9.59581L13.1646 8.46997L13.9603 9.32164L11.375 11.7366L8.78964 9.32164L9.58531 8.46997L10.7916 9.59581V4.66664C10.7916 4.02497 10.269 3.49997 9.62498 3.49997Z" fill="${textColor}"/>
</svg>${tweet.retweetCount}`
        const replies = createStyledDiv({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          fontSize: '14px',
          fontWeight: 400,
          gap: '4px',
          height: '16px'
        })
        replies.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.02145 5.83366C1.02145 3.25533 3.11212 1.16699 5.69104 1.16699H8.23787C10.857 1.16699 12.9798 3.29033 12.9798 5.90949C12.9798 7.63616 12.0424 9.22283 10.5321 10.057L5.83395 12.6587V10.5062H5.79487C3.1757 10.5645 1.02145 8.45866 1.02145 5.83366ZM5.69104 2.33366C3.75612 2.33366 2.18812 3.90283 2.18812 5.83366C2.18812 7.79949 3.80395 9.38033 5.76862 9.33949L5.97337 9.33366H7.00062V10.6753L9.96804 9.03616C11.1061 8.40616 11.8131 7.21033 11.8131 5.90949C11.8131 3.93199 10.2125 2.33366 8.23787 2.33366H5.69104Z" fill="${textColor}"/>
            </svg>${tweet.replyCount}`
        tweetFooter.appendChild(likes)
        tweetFooter.appendChild(retweets)
        tweetFooter.appendChild(replies)
        tweetItemDeleted.appendChild(tweetTitle)
        tweetItemDeleted.appendChild(tweetText)
        tweetItemDeleted.appendChild(tweetFooter)
        return tweetItemDeleted
      }
      const { topDeletedTweets = [], topUndeletedTweets = [] } = caInfo
      if (topDeletedTweets && topDeletedTweets.length) {
        for (let i = 0; i < topDeletedTweets.length; i++) {
          tweetContainer1.appendChild(addTweetItem(topDeletedTweets[i], 1))
        }
      }
      if (topUndeletedTweets && topUndeletedTweets.length) {
        for (let i = 0; i < topUndeletedTweets.length; i++) {
          tweetContainer2.appendChild(addTweetItem(topUndeletedTweets[i], 2))
        }
      }

      caPopupBody.appendChild(deletedTitle)
      caPopupBody.appendChild(tweetContainer1)
      caPopupBody.appendChild(undeletedTitle)
      caPopupBody.appendChild(tweetContainer2)
      caPopupContainer.appendChild(caPopupBody)
      caPopupWrapper.appendChild(caPopupContainer)
      parentContainer.appendChild(caPopupWrapper)
    }
    const caWrapper = createStyledDiv({
      // width: "160px",
      height: "24px",
      borderRadius: "100px",
      marginLeft: flexStyle,
      background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
      padding: '1px',
    })
    const caContainer = createStyledDiv({
      minWidth: "158px",
      height: "22px",
      borderRadius: "100px",
      display: 'flex',
      fontSize: '13px',
      color: fontColor(),
      justifyContent: 'space-betweeen',
      padding: '0px 16px',
      fontWeight: 700,
      background: backgroundColor(),
      alignItems: 'center',
      cursor: 'pointer',
    }, null, 'CA History:')
    const historyCount = createStyledDiv({ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' })
    const countGreen = createStyledDiv({ color: '#7FFA8B', fontSize: "13px", fontWeight: 700 }, null, caInfo?.undeletedCACount)
    const countLine = createStyledDiv({ color: getColorScheme() == "light" ? "black" : 'white', fontSize: "13px", fontWeight: 700 }, null, '/')
    const countRed = createStyledDiv({ color: '#FF4D67', fontSize: "13px", fontWeight: 700 }, null, caInfo?.deletedCACount)
    historyCount.appendChild(countGreen)
    historyCount.appendChild(countLine)
    historyCount.appendChild(countRed)

    const arrowRight = document.createElement('img')
    arrowRight.src = getColorScheme() == "light" ? chrome.runtime.getURL("src/public/assets/images/arrow-black.png") : chrome.runtime.getURL("src/public/assets/images/arrow-white.png")
    applyStyles(arrowRight, {
      transform: getColorScheme() == "light" ? "rotate(360deg)" : "rotate(90deg)",
      width: '12px',
      height: '12px',
      marginLeft: 'auto'
    })
    caContainer.appendChild(historyCount)
    caContainer.appendChild(arrowRight)
    caWrapper.appendChild(caContainer)
    caWrapper.onclick = () => {
      addCAPopup(document.querySelector('body'))
    }
    return caWrapper
  }
  function addBioCard(parentContainer, info) {
    const bioWrapper = createStyledDiv({
      width: '280px',
      borderRadius: '8px',
      padding: '1px',
      background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
      position: 'absolute',
      right: '-280px',
      left: '50%',
      transform: 'translatex(-50%)',
      bottom: '28px',
      zIndex: 100
    })
    bioWrapper.id = 'tradewiz-bio-wrapper'
    const bioContainer = createStyledDiv({
      background: popupBackground(),
      borderRadius: '8px',
      alignItems: 'center',
      display: 'flex',
      padding: '12px',
      flexDirection: 'column',
      alignItems: 'flex-start'
    })
    const bioAvatar = document.createElement('img')
    bioAvatar.src = info.photo
    applyStyles(bioAvatar, {
      width: '56px',
      height: '56px',
      borderRadius: '56px',
    })
    const name = createStyledDiv({
      color: fontColor(),
      fontSize: "16px",
      fontWeight: 700,
      marginTop: '6px',
    }, null, info.name)
    const username = createStyledDiv({
      color: "#71767B",
      fontSize: "12px",
      fontWeight: 400,
      marginTop: '2px',
    }, null, `@${info.twitter}`)

    const bio = createStyledDiv({
      color: fontColor(),
      fontSize: "12px",
      fontWeight: 400,
      marginTop: '12px',
      lineHeight: '20px'
    }, null, info.bio)

    const bioFooter = createStyledDiv({ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '18px' })

    function getFooterItem(value, text) {
      const footerItemContainer = createStyledDiv({ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginRight: '20px' })
      const fKey = createStyledDiv({
        color: getColorScheme() == "light" ? "black" : "#E7E9EA",
        fontSize: '12px',
        paddingRight: '4px',
        fontWeight: 700,
      }, null, formatNumber(value))
      const fText = createStyledDiv({
        color: getColorScheme() == "light" ? "#71767B" : "#71767B",
        fontSize: '12px',
        fontWeight: 700,
      }, null, text)
      footerItemContainer.appendChild(fKey)
      footerItemContainer.appendChild(fText)
      return footerItemContainer
    }
    bioFooter.appendChild(getFooterItem(info.followingsCount, 'Following'))
    bioFooter.appendChild(getFooterItem(info.followersCount, 'Followers'))

    bioContainer.appendChild(bioAvatar)
    bioContainer.appendChild(name)
    bioContainer.appendChild(username)
    bioContainer.appendChild(bio)
    bioContainer.appendChild(bioFooter)
    bioWrapper.appendChild(bioContainer)
    parentContainer.appendChild(bioWrapper)
  }
  async function addFollowers() {
    const container = await findHomeContainer();
    if (!container) return;
    const userNameContainer = await findUserNameContainer()
    if (!userNameContainer) return;
    const username = getTwitterUsername(window.location.href)
    if (document.querySelector('#follower-outer-container')) return
    function followerItem(follower) {
      const followerWrapper = createStyledDiv({
        height: '26px',
        borderRadius: '100px',
        display: 'flex',
        padding: '1px',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
        cursor: 'pointer',
        position: 'relative'
      })
      followerWrapper.onmouseenter = () => {
        if (!document.querySelector("#tradewiz-bio-wrapper")) {
          addBioCard(followerWrapper, follower)
        }
      }
      followerWrapper.onmouseleave = () => {
        const bioCard = document.querySelector("#tradewiz-bio-wrapper")
        if (bioCard) {
          bioCard.remove()
        }
      }
      const followerContainer = createStyledDiv({
        background: backgroundColor(),
        height: '24px',
        display: 'flex',
        borderRadius: '100px',
        alignItems: 'center',
        padding: '2px',
        paddingRight: '8px',
        flex: 1
      })
      const followerAvatar = document.createElement('img')
      followerAvatar.src = follower?.photo
      applyStyles(followerAvatar, {
        height: '20px',
        width: '20px',
        borderRadius: '20px',
        marginRight: '4px',
      })

      const followerText = createStyledDiv({
        flex: 1,
        fontSize: '12px',
        color: fontColor(),
        fontWeight: 700
      }, null, follower?.position ? `${follower?.name}-${follower?.position}` : follower?.name)
      followerContainer.appendChild(followerAvatar)
      followerContainer.appendChild(followerText)
      followerWrapper.appendChild(followerContainer)
      followerWrapper.onclick = () => {
        window.open(`https://x.com/${follower?.twitter}`, '_blank');
      }
      return followerWrapper
    }

    const followerTopRight = createStyledDiv({ display: 'flex', alignItems: 'center' })
    const logoLink = chrome.runtime.getURL("src/public/assets/images/logo3.png")
    followerTopRight.innerHTML = `<div style="font-size:14px;font-weight:700;color:#71767B;">Powered By</div><img src="${logoLink}" style="width:22px;height:14px;margin:0px 4px;" /><div style="font-size:14px;font-weight:700;color:inherit;margin-right:4px;">Tradewiz Extension</div>`

    const followerTopLeft = createStyledDiv({ display: 'flex', alignItems: 'center' })
    followerTopLeft.innerHTML = `
    <div style="color:inherit;font-size:14px;font-weight:700;margin-right:4px;" id="tradewiz-followers-count"></div>
    <div style="color:inherit;font-size:14px;font-weight:700;margin-right:4px;">KOL followers</div>
  `
    const followerTop = createStyledDiv({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: '16px', paddingRight: '16px'
    })
    followerTop.appendChild(followerTopLeft)
    followerTop.appendChild(followerTopRight)
    const followerOuterContainer = createStyledDiv({})
    followerOuterContainer.id = "follower-outer-container"
    followerOuterContainer.appendChild(followerTop)
    getTwitterFollowers(username).then((followers = { followers: [], total: 0 }) => {
      const { followers: followersList, total } = followers
      followerTop.querySelector("#tradewiz-followers-count").innerHTML = total
      const followerItemsContainer = createStyledDiv({
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '16px', paddingRight: '16px',
        marginTop: '16px',
        gap: '8px',
        alignContent: 'flex-start',
      })
      for (let i = 0; i < followersList.length; i++) {
        followerItemsContainer.appendChild(followerItem(followersList[i]))
      }
      followerOuterContainer.appendChild(followerItemsContainer)
    })



    userNameContainer.parentNode.insertAdjacentElement("afterend", followerOuterContainer)
  }
  function addThirdPartyLabel(label) {
    const labelWrapper = createStyledDiv({
      height: '26px',
      borderRadius: '100px',
      padding: '1px',
      background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
      marginLeft: '8px'
    });
    const labelContainer = createStyledDiv({
      height: '24px',
      display: 'flex',
      borderRadius: '100px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: 600,
      color: fontColor(),
      padding: '0px 6px',
      justifyContent: 'center',
      background: backgroundColor(),
    }, null, label)
    labelWrapper.appendChild(labelContainer)
    return labelWrapper
  }
  async function addLabelContainer() {
    const container = await findHomeContainer();
    if (!container) return;
    const userNameContainer = await findUserNameContainer()
    if (!userNameContainer) return;
    const username = getTwitterUsername(window.location.href)
    const [userInfo = {}, labelList = [], caInfo = {}] = await Promise.all([
      getTwitterUserInfo(username),
      getTwitterLabelList(),
      getTwitterCAInfo(username)
    ]);

    const { summary: summaryText = "", wallets = [], usernameHistory = [], position = "" } = userInfo;
    const { label: currentLabel } = labelList.find((item) => { return item.twitter == username }) || { label: '' }
    const topContainer = createStyledDiv({
      display: "flex",
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '32px',
      width: '100%'
    });
    const bottomContainer = createStyledDiv({
      display: "flex",
      alignItems: 'center',
      justifyContent: wallets?.length ? 'space-between' : 'flex-end',
      height: '32px',
      width: '100%'
    });
    const labelContainer = createStyledDiv({
      gap: "4px",
      height: '65px',
    });
    labelContainer.className = "label-container"
    labelContainer.id = "label-container"
    function addLabel(myLabel) {

      const labelEditorWrapper = createStyledDiv({
        height: '26px',
        borderRadius: '100px',
        padding: '1px',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)'
      });
      labelEditorWrapper.id = "tradewiz-label-wrapper"
      const labelEditor = createStyledDiv({
        height: '24px',
        width: '94px',
        display: 'flex',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        background: backgroundColor(),
        paddingLeft: '7px',
        whiteSpace: 'nowrap',
        color: fontColor(),
        fontSize: "13px",
        fontStyle: "normal",
        fontWeight: 600,
        lineHeight: "24px",
        paddingRight: '2px',
        position: 'relative'
      }, null, myLabel || "Add Label");
      labelEditor.id = "label-editor"
      const save = createStyledDiv({
        width: '20px',
        height: '20px',
        display: 'flex',
        borderRadius: '100%',
        justifyContent: 'center',
        marginLeft: 'auto',
        alignItems: 'center',
        background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)'
      })
      save.innerHTML = `<img src="${chrome.runtime.getURL("src/public/assets/images/save.png")}" style="width:11px;height:11px;cursor:pointer;" />`
      save.onclick = async () => {
        const inputValue = document.querySelector("#label-input").value
        await setTwitterLabel({ username, label: inputValue })
        const lEditor = document.querySelector('label-editor')
        if (lEditor) {
          lEditor.innerText = inputValue
        }
        const labelWrapper = document.querySelector("#tradewiz-label-wrapper")
        if (labelWrapper) {
          labelWrapper.parentNode.replaceChild(addLabel(inputValue), labelWrapper)
        }
      }
      // const close = document.createElement('img')
      // close.src = chrome.runtime.getURL("src/public/assets/images/close.png")
      // applyStyles(close, {
      //   width: '11px',
      //   height: '11px',
      //   position: 'absolute',
      //   right: '-20px',
      //   top: '50%',
      //   transform: 'translateY(-50%)',
      //   cursor: 'pointer'
      // })
      const close = createButtonIcon({
        svg: `<svg filter="invert(100%)" width="11" height="11" viewBox="0 0 11 11"  xmlns="http://www.w3.org/2000/svg">
        <path d="M3.06947 1.64878L5.61495 4.19427L8.16133 1.64878C8.46799 1.34211 8.95248 1.32166 9.28286 1.58743L9.35117 1.64876C9.67974 1.97732 9.67975 2.51003 9.35118 2.83861L6.80495 5.38427L9.35136 7.93083C9.65801 8.23749 9.67845 8.72199 9.41267 9.05236L9.35134 9.12067C9.02277 9.44923 8.49006 9.44923 8.16149 9.12065L5.61495 6.57427L3.0693 9.12066C2.76265 9.42732 2.27815 9.44777 1.94778 9.182L1.87946 9.12067C1.55089 8.79211 1.55088 8.2594 1.87943 7.93084L4.42562 5.38427L1.87961 2.8386C1.57295 2.53194 1.55252 2.04744 1.81829 1.71707L1.87963 1.64876C2.2082 1.3202 2.74091 1.32021 3.06947 1.64878Z" fill="${getColorScheme() == "light" ? "black" : "white"}" fill-opacity="0.8"/>
        </svg>`,
        width: '12px',
        height: '12px',
        onClick: () => {
          labelEditorWrapper.style.marginRight = "0px"
          const labelWrapper = document.querySelector("#tradewiz-label-wrapper")
          if (labelWrapper) {
            labelWrapper.parentNode.replaceChild(addLabel(myLabel), labelWrapper)
          }
        }
      })
      applyStyles(close, {
        width: '11px',
        height: '11px',
        position: 'absolute',
        right: '-20px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        filter: "invert(100%)"
      })
      // close.onclick = () => {
      //   const labelWrapper = document.querySelector("#tradewiz-label-wrapper")
      //   if (labelWrapper) {
      //     labelWrapper.parentNode.replaceChild(addLabel(myLabel), labelWrapper)
      //   }
      // }
      const pen = createButtonIcon({
        svg: `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.19092 2.68034L7.41557 4.905L2.22468 10.0959H0V7.87127L5.19092 2.68034ZM10.7692 8.74977V10.0959H4.03846L5.38462 8.74977H10.7692ZM7.78635 0.826432L9.2695 2.30956C9.47427 2.51433 9.47427 2.84634 9.2695 3.05112L8.15712 4.16346L5.93247 1.93877L7.0448 0.826432C7.24961 0.621658 7.58158 0.621658 7.78635 0.826432Z" fill="${getColorScheme() == "light" ? "#AC8AFF" : "white"}" />
            </svg>
        `,
        width: '20px',
        height: '20px',
        tips: "",
        styles: { background: getColorScheme() == "light" ? "white" : "rgba(173, 173, 204, 0.10)" },
        onClick: () => {
          labelEditorWrapper.style.marginRight = "30px"
          labelEditor.innerText = ""
          labelEditor.style.width = '160px'
          const input = document.createElement('input')
          input.value = myLabel || ""
          input.id = 'label-input'
          applyStyles(input, {
            background: 'transparent',
            width: '125px',
            border: 'none',
            outline: 'none',
          });
          labelEditor.appendChild(input)
          labelEditor.appendChild(save)
          labelEditor.appendChild(close)
        }
      })
      applyStyles(pen, {
        marginLeft: 'auto',
      })
      labelEditorWrapper.appendChild(labelEditor)
      labelEditor.appendChild(pen)
      return labelEditorWrapper
    }

    const labelWrapper = document.querySelector("#tradewiz-label-wrapper")
    if (labelWrapper) {
      labelWrapper.parentNode.replaceChild(labelWrapper, addLabel(currentLabel))
    } else {
      topContainer.appendChild(addLabel(currentLabel))
      if (position) {
        topContainer.appendChild(addThirdPartyLabel(position))
      }
    }
    labelContainer.appendChild(topContainer)
    labelContainer.appendChild(bottomContainer)
    userNameContainer.insertAdjacentElement("afterend", labelContainer)

    if (summaryText) {
      topContainer.appendChild(addSummay(summaryText))
    }
    if (wallets && wallets.length) {
      bottomContainer.appendChild(addWalletsContainer(wallets))
    }
    const flexStyle = wallets && wallets.length ? "auto" : "initial"
    if (usernameHistory && usernameHistory.length) {
      bottomContainer.appendChild(addNameContainer(usernameHistory, flexStyle))
    }
    if (caInfo && (caInfo?.undeletedCACount || caInfo?.deletedCACount)) {
      bottomContainer.appendChild(addCAHistory(caInfo, username, flexStyle))
    }
    // bottomContainer.appendChild(addCAHistory(caInfo, username))
  }


  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "hidePanel") {
      removeQuickPanel();
    } else if (request.message === "twitter-home") {
      initialConnection();
      const discoverObservers = observers["twitter-home"] || [];
      discoverObservers.forEach((observer) => observer.disconnect());
      createTokenButton();
      addLabelContainer()
      addFollowers()
      if (request.message !== "quickAmount") {
        removeQuickPanel()
      }
    } else if (["showPosition", "switchKeyboard", "alphaSignal", "loginSuccess", "signal-result", "price", "trade", "transfer", "showError", "limit-order", "token-mc-vol", "signal_tweet", "showAddressLab", "showCurrentToken", "showTwitter", "token-alert"].includes(request.message)) {
      return
    } else {
      removeQuickPanel()
    }
  });
}).catch((error) => {
  console.error("Error loading config:", error);
});