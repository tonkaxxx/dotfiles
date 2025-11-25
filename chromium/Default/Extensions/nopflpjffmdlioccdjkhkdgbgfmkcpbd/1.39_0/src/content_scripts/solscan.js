chrome.storage.local.get("tradewiz.config").then(async (config) => {
  if (!config || !config["tradewiz.config"]) {
    return;
  }
  const getConfig = config["tradewiz.config"];
  const hostname = window.location.hostname.replace(/www\./, '');
  if (!getConfig || !getConfig[hostname]) {
    return;
  }
  if (hostname !== "solscan.io") {
    return;
  }
  window.platform = 10;
  window.observers = {};
  window.isAddressLab = await getStoredValue("tradewiz.showAddressLab") ?? true;
  async function findAddressContainers(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const a = "/account/"
      const containers = o = document.querySelectorAll(`a[href^="${a}"].text-current`);
      if (containers.length > 2) return containers;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  async function findAccountAddress(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const account = document.querySelector(".break-words.mr-3")
      if (account) return account;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  async function findInspectButton(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const button = document.querySelector("button.bg-primarySolana-800")
      if (button) return button;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  async function findViewport(timeout = 5000) {
    for (let i = 0; i < timeout / 500; i++) {
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) return viewport;
      await new Promise((r) => setTimeout(r, 500));
    }
    return null;
  }
  const createAddressTagInput = (target, address, { note = {}, icon = {} } = {}) => {
    if (!address) return;
    const targetClose = target.closest("div[data-state]") || target;
    if (!targetClose) return;
    if (targetClose.querySelector(".tradewiz-address-tag-wrapper")) {
      const addressTag = targetClose.querySelectorAll(".tradewiz-address-tag-content")[0];
      const noteText = addressTag.getAttribute("data-note");
      if (note?.note && noteText !== note?.note) {
        addressTag.setAttribute("data-note", note?.note || "");
        addressTag.innerText = note?.note || "";
      }
      return;
    };
    const container = createAddressHtml(note, icon, address);
    container.classList.add(document.documentElement.className.includes("light") ? "light" : "dark");
    Object.assign(container.style, {
      position: "initial",
    })
    targetClose.setAttribute("data-inserted-address", address);
    targetClose.appendChild(container);
    Object.assign(targetClose.style, {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    });
    Object.assign(targetClose.parentElement.style, {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    });
  }
  async function createAddressTag() {
    cleanupAddressTagObservers();
    if (!window.isAddressLab) return;
    await createAddressContainer();
    const viewport = await findViewport();
    if (viewport) {
      const observer = new MutationObserver(async () => {
        await createAddressContainer();
      });
      observer.observe(viewport, {
        childList: true,
        subtree: true,
      });
      window.observers["addressTag"] = observer;
    }
  }
  const createAddressContainer = async () => {
    cleanupAddressTagObservers();
    if (!window.isAddressLab) return;
    const addressesSet = new Set();
    const addressMap = {};

    const extractAddress = (str) => {
      if (!str) return null;
      const match = str.trim().match(/\b[1-9A-HJ-NP-Za-km-z]{43,44}\b/);
      return match ? match[0] : null;
    };
    let account = null
    let accountAddress = null;
    if (!window.location.href.includes("/tx/")) {
      account = await findAccountAddress();
      if (account) {
        accountAddress = extractAddress(account?.childNodes?.[0]?.nodeValue);
        if (accountAddress) {
          addressesSet.add(accountAddress);
        }
      }
    } else {
      await findInspectButton();
    }

    const containers = await findAddressContainers();
    if (containers && containers.length > 0) {
      containers.forEach(item => {
        const address = extractAddress(item.href.split("/").pop());
        if (address) addressesSet.add(address);
      });
    }
    signalUseSet(window.platform, 9)
    const addresses = Array.from(addressesSet);
    const response = await addressNotes({ addresses });
    response?.forEach(item => {
      if (item?.address) {
        addressMap[item.address] = item;
      }
    });

    if (containers && containers.length > 0) {
      containers.forEach(item => {
        const address = extractAddress(item.href.split("/").pop());
        if (address) {
          createAddressTagInput(item, address, addressMap[address]);
        }
      });
    }

    if (account && accountAddress) {
      createAddressTagInput(account, accountAddress, addressMap[accountAddress]);
    }
  };
  const cleanupAddressTagObservers = () => {
    const observerKeys = ["addressTag"];
    observerKeys.forEach(key => {
      if (window.observers[key]) {
        window.observers[key].disconnect();
        delete window.observers[key];
      }
    });
  };

  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.message === "solscan-account") {
      createAddressTag();
    } else if (request.message === "solscan-tx") {
      createAddressContainer()
    } else if (request.message === "showAddressLab") {
      window.isAddressLab = request.value;
      if (window.isAddressLab) {
        createAddressTag();
        createAddressContainer()
      } else {
        cleanupAddressTagObservers();
        document.querySelectorAll(".tradewiz-address-tag-wrapper").forEach((item) => {
          item.remove();
        });
      }
    }
  })
}).catch((error) => {
  console.error("Error loading config:", error);
});