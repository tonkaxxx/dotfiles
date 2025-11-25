window.lastUpdateTime1s = 0;
window.lastUpdateTime10s = 0;
window.subSignalsTokens = [];
const alphaSignalKey = "tradewiz.alphaSignal";
window.signalType = "both";

const createPriceAlert = async (parentElement, tokenInfo) => {
  document.querySelector("body").addEventListener("click", (e) => {
    const alertElement = document.querySelector("#price-alert-wrapper");
    const alertButtonIcon = document.querySelector("#alert-button");
    if (
      alertButtonIcon &&
      alertElement &&
      !alertElement.contains(e.target) &&
      !alertButtonIcon.contains(e.target)
    ) {
      alertElement.remove();
    }
  });
  if (!parentElement) return;
  const tokenAddress = tokenInfo.token;
  const totalSupply = tokenInfo.total_supply;
  let isLastAlertPage = false;
  let nextPage = "";

  if (document.querySelector("#price-alert-wrapper")) return;

  const alertWrapper = createStyledDiv({});
  function addAlertInput(label, id, value, tag) {
    const inputWrapper = createStyledDiv({});
    inputWrapper.className = "alert-input-wrapper";
    inputWrapper.innerHTML = `<div>
    <div class="alert-input-label">${label}</div>
    <div class="alert-input-container">
      <input value="${value}" id="${id}" type="number" />
      <div class="input-tag">${tag}</div>
    </div>
    </div>`;
    return inputWrapper;
  }
  function addAlertItem(tokenAddress, symbol, id, direction, mc, price) {
    const alertItem = createStyledDiv({});
    alertItem.className = "alert-item-container";
    const upIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M3.57891 0.178351C3.81145 -0.0541899 4.18848 -0.0541877 4.42102 0.178356L7.02022 2.77755C7.25276 3.01009 7.25276 3.38712 7.02022 3.61966C6.78768 3.8522 6.41065 3.8522 6.17811 3.61966L4.59424 2.03584L4.59542 7.40047C4.59542 7.70404 4.36827 7.95455 4.07466 7.99129L3.99996 7.99593C3.6711 7.99593 3.4045 7.72933 3.4045 7.40047L3.40405 2.03584L1.82186 3.61963C1.62406 3.81743 1.31892 3.84847 1.08276 3.70107L1.02526 3.66049L0.979749 3.61963C0.747205 3.38709 0.747203 3.01006 0.979744 2.77752L3.57891 0.178351Z" fill="#7FFA8B"/>
            </svg>`;
    const downIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4.42109 7.82159C4.18855 8.05413 3.81152 8.05413 3.57898 7.82158L0.979784 5.22239C0.74724 4.98985 0.747238 4.61282 0.979779 4.38028C1.21232 4.14774 1.58935 4.14774 1.82189 4.38028L3.40576 5.9641L3.40458 0.599467C3.40458 0.2959 3.63173 0.0453894 3.92534 0.00864717L4.00004 0.00400832C4.3289 0.00401021 4.5955 0.270609 4.5955 0.599468L4.59595 5.9641L6.17814 4.3803C6.37594 4.18251 6.68108 4.15147 6.91724 4.29887L6.97474 4.33945L7.02025 4.38031C7.2528 4.61285 7.2528 4.98988 7.02026 5.22242L4.42109 7.82159Z" fill="#FF4D67"/>
          </svg>`;
    const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <g clip-path="url(#clip0_1986_156)">
          <path d="M7.30263 -0.000152588L7.37693 0.00544033C7.54824 0.0289161 7.70041 0.132573 7.78362 0.287483L8.5083 1.63617H11.4542C11.7554 1.63617 11.9999 1.88064 11.9999 2.18188C11.9999 2.48312 11.7554 2.72759 11.4542 2.72759H10.636V11.4541C10.636 11.7553 10.3922 11.9997 10.0911 11.9998H1.90946C1.60822 11.9998 1.36375 11.7554 1.36375 11.4541V2.72759H0.545587C0.244347 2.72759 -0.000122018 2.48312 -0.00012207 2.18188C-0.00012207 1.88064 0.244347 1.63617 0.545587 1.63617H3.49545L4.23691 0.283488C4.33266 0.108817 4.51631 -0.000152588 4.7155 -0.000152588H7.30263ZM2.45437 10.9092H9.54539V2.72759H2.45437V10.9092ZM4.36395 8.45474V4.90883C4.36409 4.6078 4.60783 4.36406 4.90886 4.36392C5.21001 4.36392 5.45442 4.60771 5.45457 4.90883V8.45474C5.45442 8.75585 5.21001 8.99965 4.90886 8.99965C4.60783 8.9995 4.36409 8.75577 4.36395 8.45474ZM6.54519 8.45474V4.90883C6.54533 4.60771 6.78974 4.36392 7.0909 4.36392C7.39205 4.36392 7.63646 4.60771 7.6366 4.90883V8.45474C7.63646 8.75585 7.39205 8.99965 7.0909 8.99965C6.78974 8.99965 6.54533 8.75585 6.54519 8.45474ZM4.73947 1.63617H7.26987L6.97664 1.09126H5.0383L4.73947 1.63617Z" fill="currentColor"/>
          </g>
          <defs>
          <clipPath id="clip0_1986_156">
          <rect width="12" height="12" fill="currentColor"/>
          </clipPath>
          </defs>
          </svg>`;
    alertItem.innerHTML = `
        <div class="name">${symbol}</div>
        <div class="direction">${direction == "gte" ? "Up" + upIcon : "Down" + downIcon
      }</div>
        <div class="mc-price">$${price}/$${mc}</div>
        <div class="delete-icon">${deleteIcon}</div>
    `;
    alertItem.querySelector(".name").addEventListener("click", async (e) => {
      if (window.platform === 0 || window.platform === 9) {
        e.preventDefault();
        navigateToToken(platformPathMap(window.platform, tokenAddress));
      }
    });
    alertItem
      .querySelector(".delete-icon")
      .addEventListener("click", async () => {
        await deleteAlert({ id: `${id}`, token: tokenAddress });
        showToast("Delete alert success!");
        await getAlertListData(true);
        await updateAlertButton();
      });
    return alertItem;
  }
  alertWrapper.id = "price-alert-wrapper";
  alertWrapper.className = "price-alert-wrapper";
  alertWrapper.innerHTML = `<div class="price-alert-container">
    <div  class="price-alert-inner-container">
      <div class="alert-title">Price / Market Cap Crossing Up</div>
      <div id="alert-input-top"></div>
      <div class="alert-title">Price / Market Cap Crossing Down</div>
      <div id="alert-input-bottom"></div>
      <div class="frequency-container">
        <div id="only-once" class="frequency-checkbox-container">
          <div class="frequency-checkbox checked">
            <div></div>
          </div>
          <div>Only Once</div>
        </div>
        <div id="perminute"  class="frequency-checkbox-container">
          <div class="frequency-checkbox">
            <div></div>
          </div>
          <div>Once Per Min</div>
        </div>
      </div>
    </div>
    <div id="alert-list">
    </div>
    <div id="alert-set-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <g clip-path="url(#clip0_1775_18660)">
          <path d="M13.0512 12.5752C13.435 12.6144 13.7346 12.9389 13.7348 13.333C13.7348 13.7273 13.4352 14.0516 13.0512 14.0908L12.9731 14.0947H2.30609C1.88537 14.0946 1.54437 13.7537 1.54437 13.333C1.54457 12.9124 1.88549 12.5714 2.30609 12.5713H12.9731L13.0512 12.5752ZM7.6391 1.57129C10.2689 1.57129 12.4006 3.70322 12.4008 6.33301V11C12.4007 11.4207 12.0598 11.7617 11.6391 11.7617H3.6391C3.21862 11.7615 2.87752 11.4205 2.87738 11V6.33301C2.87756 3.70339 5.0095 1.57156 7.6391 1.57129ZM1.1391 2.92285L1.21429 2.94433L2.21429 3.27734L2.28656 3.30566C2.63864 3.4642 2.82048 3.86699 2.69574 4.24121C2.56261 4.64016 2.13091 4.85551 1.73187 4.72265L0.73187 4.38965L0.659605 4.36133C0.3075 4.20287 0.125832 3.79998 0.250425 3.42578C0.375292 3.05167 0.762336 2.83832 1.1391 2.92285ZM1.43402 1.12793C1.71292 0.849022 2.15429 0.832206 2.45355 1.07617L2.51214 1.12793L3.51214 2.12793L3.5639 2.18652C3.80762 2.48577 3.79096 2.92724 3.51214 3.20605C3.23332 3.48479 2.79183 3.50152 2.49261 3.25781L2.43402 3.20605L1.43402 2.20605L1.38226 2.14746C1.13832 1.84823 1.1552 1.40684 1.43402 1.12793ZM3.73187 -0.0556664C4.10613 -0.180395 4.50893 0.00134411 4.66742 0.353513L4.69574 0.425779L5.02875 1.42578C5.16155 1.82486 4.94635 2.25661 4.5473 2.38965C4.17311 2.51437 3.77032 2.3325 3.61175 1.98047L3.58343 1.9082L3.25043 0.908201L3.22894 0.833005C3.14441 0.456244 3.35776 0.0692008 3.73187 -0.0556664Z" fill="white"/>
        </g>
        <defs>
          <clipPath id="clip0_1775_18660">
            <rect width="14" height="14" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      Set Alert
    </div>
  </div>`;
  const priceUpInput = addAlertInput("Price", "alert-price-up", "", "$");
  const mcUpInput = addAlertInput("Market Cap", "alert-mc-up", "", "K");
  const priceDownInput = addAlertInput("Price", "alert-price-down", "", "$");
  const mcDownput = addAlertInput("Market Cap", "alert-mc-down", "", "K");
  const alertInputTop = alertWrapper.querySelector("#alert-input-top");
  // const alertListContainer = alertWrapper.querySelector('#alert-list')

  async function getAlertListData(isFirst) {
    const el = alertWrapper.querySelector("#alert-list");
    if (isFirst) {
      nextPage = "";
    }
    const { data: alertList, next = "" } = await getAlertList(
      tokenAddress,
      nextPage
    );
    if (next == "") {
      isLastAlertPage = true;
    }
    if (isFirst) {
      el.innerHTML = "";
    }
    nextPage = next;
    for (let i = 0; i < alertList.length; i++) {
      const { id, token, symbol, op, mc, price } = alertList[i];
      el.appendChild(
        addAlertItem(
          token,
          symbol,
          id,
          op,
          formatNumber(mc),
          formatTokenPrice(price)
        )
      );
    }
  }
  attachInfiniteScroll({
    container: alertWrapper.querySelector("#alert-list"),
    loadFn: getAlertListData,
    hasMore: () => !isLastAlertPage,
  });

  alertInputTop.appendChild(priceUpInput);
  alertInputTop.appendChild(mcUpInput);

  const checkboxContainers = alertWrapper.querySelectorAll(
    ".frequency-checkbox-container"
  );

  checkboxContainers.forEach((container) => {
    container.addEventListener("click", function () {
      const selectedCheckbox = this.querySelector(".frequency-checkbox");

      checkboxContainers.forEach((c) => {
        c.querySelector(".frequency-checkbox").classList.remove("checked");
      });

      selectedCheckbox.classList.add("checked");
    });
  });

  const alertInputBottom = alertWrapper.querySelector("#alert-input-bottom");
  alertInputBottom.appendChild(priceDownInput);
  alertInputBottom.appendChild(mcDownput);

  alertWrapper
    .querySelector("#alert-price-up")
    .addEventListener("input", (e) => {
      alertWrapper.querySelector("#alert-mc-up").value =
        (+(e.target.value || 0) * +totalSupply) / 1000;
    });
  alertWrapper.querySelector("#alert-mc-up").addEventListener("input", (e) => {
    alertWrapper.querySelector("#alert-price-up").value = (
      (+(e.target.value || 0) * 1000) /
      +totalSupply
    ).toString();
  });
  alertWrapper
    .querySelector("#alert-price-down")
    .addEventListener("input", (e) => {
      alertWrapper.querySelector("#alert-mc-down").value =
        (+(e.target.value || 0) * +totalSupply) / 1000;
    });
  alertWrapper
    .querySelector("#alert-mc-down")
    .addEventListener("input", (e) => {
      alertWrapper.querySelector("#alert-price-down").value = (
        (+(e.target.value || 0) * 1000) /
        +totalSupply
      ).toString();
    });

  alertWrapper
    .querySelector("#alert-set-button")
    .addEventListener("click", async () => {
      const alertPriceUp =
        alertWrapper.querySelector("#alert-price-up").value || 0;
      const alertPriceDown =
        alertWrapper.querySelector("#alert-price-down").value || 0;
      const alertMCUp = alertWrapper.querySelector("#alert-mc-up").value || 0;
      const alertMCDown =
        alertWrapper.querySelector("#alert-mc-down").value || 0;
      const isPerMinute = alertWrapper
        .querySelector("#perminute .frequency-checkbox")
        ?.classList?.contains("checked");
      if (!alertPriceDown && !alertPriceUp && !alertMCUp && !alertMCDown) {
        return showToast("Please enter price or market cap!", {
          isError: true,
        });
      }
      if (
        (+alertPriceDown <= 0 || +alertMCDown <= 0) &&
        (+alertMCUp <= 0 || +alertPriceUp <= 0)
      ) {
        return showToast("Please enter a positive number!", { isError: true });
      }
      await setAlert({
        platform: 1,
        type: isPerMinute ? 2 : 1,
        params: [
          {
            op: "gte",
            token: tokenAddress,
            price: +alertPriceUp,
            mc: +alertMCUp * 1000,
          },
          {
            op: "lte",
            token: tokenAddress,
            price: +alertPriceDown,
            mc: +alertMCDown * 1000,
          },
        ],
      });
      showToast("Set price alert success!");
      await getAlertListData(true);
      alertWrapper.querySelector("#alert-list").scrollTop = 0;
    });
  parentElement.appendChild(alertWrapper);
  await getAlertListData(true);
};

const createMinimizeContainer = async () => {
  const minimizeContainer = await createMinimizeButton(
    "tradewiz.signalMinimize",
    "tradewiz.signalPosition",
    "tradewiz-minimize-container-signal",
    async () => {
      minimizeContainer.remove();
      chrome.storage.local.set({ "tradewiz.signalCount": 0 })
      await chrome.storage.local.remove("tradewiz.minimizeModule");
      await createSignalPanel();
    }
  );
  if (minimizeContainer) {
    document.body.appendChild(minimizeContainer);
    enableDraggablePanel(minimizeContainer, "tradewiz.signalPosition");
  }
}
const createSignalHeader = async (title = "") => {
  const header = createStyledDiv({});
  header.className = "tradewiz-signal-header";
  const logo = createIcon(
    chrome.runtime.getURL(
      `src/public/assets/images/${title ? "logo3.png" : "logo.png"}`
    ),
    {
      width: "auto",
    },
    "18px"
  );
  header.appendChild(logo);
  if (title) {
    const text = createStyledDiv({
      fontWeight: 500,
      fontSize: "14px",
      color: "#fff",
    });
    text.textContent = title;
    header.appendChild(text);
  }
  const headerRight = createStyledDiv({
    display: "flex",
    gap: "4px",
    alignItems: "center",
    marginLeft: "auto",
  });
  const settings = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.67353 0C8.10325 0 8.47402 0.290786 8.56166 0.69654L8.86481 2.1C9.15041 2.2 9.41501 2.32083 9.65862 2.4625C9.90222 2.60417 10.1416 2.76667 10.3768 2.95L11.6845 2.52838C12.096 2.39571 12.5472 2.5626 12.7613 2.92658L13.4444 4.08836C13.6544 4.44559 13.5786 4.89566 13.2621 5.17039L12.1912 6.1C12.2248 6.4 12.2416 6.7 12.2416 7C12.2416 7.3 12.2248 7.6 12.1912 7.9L13.2621 8.82961C13.5786 9.10434 13.6544 9.55441 13.4444 9.91164L12.7613 11.0734C12.5472 11.4374 12.096 11.6043 11.6845 11.4716L10.3768 11.05C10.1416 11.2333 9.90222 11.3958 9.65862 11.5375C9.41501 11.6792 9.15041 11.8 8.86481 11.9L8.56166 13.3035C8.47402 13.7092 8.10325 14 7.67353 14H6.32647C5.89675 14 5.52598 13.7092 5.43834 13.3035L5.13519 11.9C4.84959 11.8 4.58499 11.6792 4.34138 11.5375C4.09778 11.3958 3.85838 11.2333 3.62318 11.05L2.31549 11.4716C1.90402 11.6043 1.45276 11.4374 1.23873 11.0734L0.555609 9.91164C0.345553 9.55441 0.421357 9.10434 0.737852 8.82961L1.80877 7.9C1.77517 7.6 1.75837 7.3 1.75837 7C1.75837 6.7 1.77517 6.4 1.80877 6.1L0.737852 5.17039C0.421357 4.89566 0.345553 4.44559 0.555609 4.08836L1.23873 2.92658C1.45276 2.5626 1.90402 2.39571 2.31549 2.52838L3.62318 2.95C3.85838 2.76667 4.09778 2.60417 4.34138 2.4625C4.58499 2.32083 4.84959 2.2 5.13519 2.1L5.43834 0.69654C5.52598 0.290786 5.89675 0 6.32647 0H7.67353ZM7 4C6.16 4 5.44599 4.29167 4.85799 4.875C4.26998 5.45833 3.97598 6.16667 3.97598 7C3.97598 7.83333 4.26998 8.54167 4.85799 9.125C5.44599 9.70833 6.16 10 7 10C7.84 10 8.55401 9.70833 9.14201 9.125C9.73002 8.54167 10.024 7.83333 10.024 7C10.024 6.16667 9.73002 5.45833 9.14201 4.875C8.55401 4.29167 7.84 4 7 4Z" fill="currentColor"/>
    </svg>
  `,
    width: "24px",
    height: "24px",
    tips: "More Settings",
    onClick: () => {
      chrome.runtime.sendMessage({
        message: "openTab",
        url: chrome.runtime.getURL("src/public/signal/tradewiz.html"),
      });
    },
  });
  const close = createButtonIcon({
    svg: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.8334 2.91651C12.8334 1.95001 12.0499 1.1665 11.0834 1.1665H2.91669C1.95019 1.1665 1.16669 1.95001 1.16669 2.9165V11.0832C1.16669 12.0497 1.95019 12.8332 2.91669 12.8332H11.0834C12.0498 12.8332 12.8334 12.0497 12.8334 11.0832V2.91651Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M4.66669 1.1665V4.6665H1.16669" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 7V10.5H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 10.5L7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
    tips: "Minimize",
    width: "24px",
    height: "24px",
    onClick: async () => {
      const minimizeModule = await getStoredValue("tradewiz.minimizeModule") || [];
      const panel = close.closest(".tradewiz-signal-current-token-head") || close.closest(".tradewiz-signal-panel");
      if (panel) {
        panel.remove();
        minimizeModule.push(panel.getAttribute("type"));
      }
      chrome.storage.local.set(
        { "tradewiz.signalMinimize": true, "tradewiz.signalCount": 0, "tradewiz.minimizeModule": minimizeModule },
        async () => {
          await createCurrentTokenElement()
          await createMinimizeContainer();
        }
      );
    },
  });
  if (title === "Wallet Signal") {
    const stat = createButtonIcon({
      svg: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_2558_18526)">
      <path d="M0.750427 0.0825195C1.11842 0.0827504 1.41742 0.382441 1.41742 0.750488V10.5835H11.2504C11.6184 10.5837 11.9174 10.8824 11.9174 11.2505C11.9172 11.6183 11.6183 11.9172 11.2504 11.9175H0.750427C0.3824 11.9175 0.0836995 11.6185 0.0834351 11.2505V0.750488C0.0834351 0.382298 0.382237 0.0825195 0.750427 0.0825195ZM3.08344 7.0835C3.45156 7.08358 3.75043 7.38235 3.75043 7.75049V8.91748C3.75003 9.28528 3.45131 9.58342 3.08344 9.5835C2.71549 9.5835 2.41685 9.28533 2.41644 8.91748V7.75049C2.41644 7.3823 2.71525 7.0835 3.08344 7.0835ZM5.41644 4.74951C5.78454 4.74951 6.08328 5.04844 6.08344 5.4165V8.9165C6.08344 9.28469 5.78463 9.5835 5.41644 9.5835C5.04839 9.58334 4.74945 9.2846 4.74945 8.9165V5.4165C4.7496 5.04854 5.04848 4.74967 5.41644 4.74951ZM7.75043 0.0825195C8.11843 0.0827409 8.41742 0.382435 8.41742 0.750488V8.91748C8.41698 9.28516 8.11816 9.58328 7.75043 9.5835C7.38251 9.5835 7.08387 9.2853 7.08344 8.91748V0.750488C7.08344 0.382298 7.38224 0.0825195 7.75043 0.0825195ZM10.0834 2.4165C10.4515 2.4166 10.7504 2.71537 10.7504 3.0835V8.9165C10.7503 9.28454 10.4515 9.5834 10.0834 9.5835C9.71531 9.5835 9.41656 9.2846 9.41644 8.9165V3.0835C9.41644 2.71531 9.71525 2.4165 10.0834 2.4165Z" fill="currentColor" />
      </g>
      <defs>
      <clipPath id="clip0_2558_18526">
      <rect width="12" height="12" fill="currentColor"/>
      </clipPath>
      </defs>
    </svg>
  `,
      tips: "Statistics",
      width: "24px",
      height: "24px",
      onClick: async () => {
        const isDisabled = stat.getAttribute("disabled");
        if (isDisabled) return;
        stat.setAttribute("disabled", "true");
        await createStatistics()
        stat.removeAttribute("disabled");
      },
    });
    headerRight.appendChild(stat);
    const alphaSignalRing = await getStoredValue("tradewiz.alphaSignalRing");
    const ring = createButtonIcon({
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1428 11.2023C11.4472 11.2023 12.1926 9.92205 11.4114 9.01957C11.0623 8.6261 10.8447 8.1379 10.7878 7.62037L10.4725 4.90593C10.2382 3.38227 9.11984 2.12958 7.60555 1.69477V1.62481C7.57073 0.787001 6.87463 0.119973 6.01581 0.101468C5.15699 0.0829624 4.4314 0.719357 4.35874 1.55485V1.69477C2.86783 2.1492 1.77566 3.39746 1.54915 4.90593L1.23379 7.65535C1.17916 8.17347 0.961305 8.66231 0.610228 9.05455C-0.171012 9.92905 0.574391 11.2023 1.87885 11.2023H10.1428ZM8.15743 12.6575C7.78174 13.4745 6.94975 14.0001 6.03232 14.0001C5.11489 14.0001 4.2829 13.4745 3.9072 12.6575C3.84901 12.503 3.92886 12.3315 4.08639 12.2727H7.87074C7.95181 12.2708 8.03024 12.3009 8.08825 12.3563C8.14626 12.4116 8.17896 12.4874 8.17894 12.5665C8.18572 12.6012 8.18572 12.6368 8.17894 12.6715L8.15743 12.6575Z" fill="currentColor" />
    </svg>`,
      svg_: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.87074 12.2721C8.95173 12.2703 9.03053 12.3009 9.08851 12.3561C9.14628 12.4113 9.17922 12.4872 9.17933 12.5661C9.18609 12.6006 9.18605 12.637 9.17933 12.6715L9.15785 12.6569C8.78223 13.4737 7.95007 13.9995 7.03285 13.9997C6.11542 13.9997 5.28257 13.4739 4.90687 12.6569C4.84915 12.5025 4.92925 12.3308 5.08656 12.2721H8.87074ZM2.16468 2.1647C2.43835 1.89109 2.88217 1.89119 3.1559 2.1647L12.1354 11.1442C12.409 11.4179 12.409 11.8617 12.1354 12.1354C11.8617 12.4091 11.4179 12.409 11.1442 12.1354L2.16468 3.15591C1.89116 2.88217 1.89103 2.43836 2.16468 2.1647ZM8.35414 11.2018H2.87855C1.57441 11.2016 0.829123 9.92877 1.61 9.05435C1.96096 8.66214 2.1794 8.17296 2.23402 7.65493L2.49867 5.34634L8.35414 11.2018ZM7.01625 0.101223C7.87475 0.119941 8.57013 0.787154 8.60511 1.62466V1.694C10.1193 2.12878 11.238 3.3824 11.4723 4.90591L11.7877 7.61978C11.8446 8.13724 12.0627 8.62575 12.4118 9.01919C12.7016 9.35413 12.7791 9.74114 12.6979 10.0954L4.60902 2.0065C4.84476 1.87976 5.09586 1.77421 5.35902 1.694V1.55435C5.43194 0.719121 6.15761 0.082722 7.01625 0.101223Z" fill="currentColor" />
    </svg>`,
      width: "24px",
      height: "24px",
      tips: "Notification Sound",
      active: alphaSignalRing == undefined || alphaSignalRing,
      noActiveBackground: true,
      onClick: (e, button, isActive) => {
        chrome.storage.local.set({ "tradewiz.alphaSignalRing": isActive });
      },
    });
    headerRight.appendChild(ring);
  }
  headerRight.appendChild(settings);
  headerRight.appendChild(close);
  header.appendChild(headerRight);
  return header;
};
async function createLoginTip(container) {
  const loginContainer = createStyledDiv(
    {
      position: "absolute",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "42px",
      width: "100%",
      color: "#FFFFFF",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "12px",
      fontWeight: 400,
      cursor: "pointer",
    },
    null,
    "Please login first"
  );
  const panels = container.querySelectorAll(".tradewiz-signal-panel");
  panels.forEach((panel) => {
    panel.innerHTML = loginContainer.outerHTML;
  });
}
async function createSignalPanel() {
  const currentChain = await getStoredValue("tradewiz.chain");
  if (currentChain === "BSC"){
    removeSignalPanel();
    return;
  }
  if (window.platform === 5 || window.platform === 8 || window.platform === 10) {
    return;
  }
  const minimize = await getStoredValue("tradewiz.signalMinimize");
  const container = document.querySelector(".signal-container") || createStyledDiv({
    display: minimize ? "none" : "flex",
  });
  container.className = "signal-container";
  await createWalletSignal(container);
  // createTwitterSignal(container);
  setPlatformSignalStyle(window.platform, container).then(async () => {
    startStyleMonitoringSignal();
    const loginToken = await getStoredValue("tradewiz.token");
    if (!loginToken) {
      createLoginTip(container)
    }
  });
}

const setPlatformSignalStyle = async (platform, container) => {
  if (platform === 0) {
    window.platformLayout = await findContainer(".flex-row.min-h-0");
    if (!platformLayout) return;
    if (container) {
      container.style.marginLeft = "1px";
      platformLayout.insertBefore(container, platformLayout.firstChild);
    }
  } else if (platform === 1) {
    let platformLayout = null;
    if (window.location.href.includes("/lp")) {
      platformLayout = await findContainer(".u-flex-lg-row-reverse");
      if (container) {
        container.style.height = `${window.innerHeight * 0.75}px`;
      }
    } else if (
      window.location.href.includes("orders") ||
      window.location.href.includes("my_holdings") ||
      window.location.href.includes("wallets_tracking") ||
      window.location.href.includes("x_tracking")
    ) {
      platformLayout = await findContainer(".c-body");
      if (!platformLayout) return;
      Object.assign(platformLayout.style, {
        paddingLeft: "240px",
        position: "relative",
      });
      Object.assign(container.style, {
        position: "absolute",
        top: "0",
        left: "0",
      });
    } else {
      platformLayout = await findContainer(".p-show__sidebar.u-min-w-0");
      if (container) {
        container.style.height = `${window.innerHeight * 0.75}px`;
      }
    }
    if (!platformLayout) return;
    if (container) {
      platformLayout.appendChild(container);
    }
  } else if (platform === 2 || platform === 3) {
    window.platformLayout = await findContainer(".ant-layout-content");
    if (!platformLayout) return;
    Object.assign(platformLayout.style, {
      display: "flex",
    });
    const lastElement = platformLayout.lastElementChild;
    Object.assign(lastElement.style, {
      flex: "1",
    });
    if (container) {
      platformLayout.insertBefore(container, platformLayout.firstChild);
    }
  } else if (platform === 9) {
    window.platformLayout = await findContainer("#MainLayouLeftContanerId");
    if (!platformLayout) return;
    if (container) {
      platformLayout.insertBefore(container, platformLayout.firstChild);
    }
  } else if (platform === 8) {
    window.platformLayout = await findContainer(".notranslate");
    if (!platformLayout) return;
    if (container) {
      const secondElement = platformLayout.children[1];
      Object.assign(secondElement.style, {
        display: "flex",
        flexDirection: "row",
      });
      if (secondElement) {
        secondElement.insertBefore(container, secondElement.firstChild);
      }
    }
  } else if (platform === 4) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.platformLayout = await findContainer(".page-wrapper");
    if (!platformLayout) return;
    const parent = platformLayout.parentElement;
    Object.assign(parent.style, {
      display: "flex",
    });
    Object.assign(container.style, {
      marginTop: "45px",
    });
    if (container) {
      parent.insertBefore(container, parent.firstChild);
    }
  } else if (platform === 7) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    window.platformLayout = await findContainer(".layout-side");
    if (!platformLayout) return;
    if (container) {
      platformLayout.insertBefore(container, platformLayout.firstChild);
    }
  } else if (platform === 6) {
    window.platformLayout = await findContainer("main");
    if (!platformLayout) return;
    platformLayout.classList.remove("flex-col");
    if (container) {
      platformLayout.insertBefore(container, platformLayout.firstChild);
      container.style.height = `${window.innerHeight * 0.75}px`;
    }
  } else if (platform === 11) {
    window.platformLayout = await findContainer("[data-panel-group-direction='horizontal']");
    if (!platformLayout) return;
    if (container) {
      platformLayout.insertBefore(container, platformLayout.firstChild);
    }
  }
  createCurrentTokenElement();
};

function getUID(data) {
  const { channel, token_address, time_window, direction } = data;
  const { id } = channel;
  return `${direction}_${id}_${time_window}_${token_address}`;
}

let notificationSound = null;
let alertSound = null;
function initNotificationSound() {
  const audioPath = chrome.runtime.getURL("src/public/assets/audio/signal.mp3");
  const alertPath = chrome.runtime.getURL("src/public/assets/audio/alert.wav");
  notificationSound = new Audio(audioPath);
  alertSound = new Audio(alertPath);
  notificationSound.volume = 1;
  alertSound.volume = 1;
}
function playNotificationSound() {
  chrome.storage.local.get("tradewiz.alphaSignalRing", (result) => {
    if (
      result["tradewiz.alphaSignalRing"] ||
      result["tradewiz.alphaSignalRing"] == undefined
    ) {
      if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => {
          console.warn("can not play:", e);
        });
      }
    }
  });
}
function playAlertSound() {
  chrome.storage.local.get("tradewiz.alphaSignalRing", (result) => {
    if (
      result["tradewiz.alphaSignalRing"] ||
      result["tradewiz.alphaSignalRing"] == undefined
    ) {
      if (alertSound) {
        alertSound.currentTime = 0;
        alertSound.play().catch((e) => {
          console.warn("alert sound can not play:", e);
        });
      }
    }
  });
}

function prependWalletNewData(newData) {
  const signalItemContainer = document.querySelectorAll(
    ".signal-item-container"
  );
  const containerElement = signalItemContainer[0];
  if (!containerElement) return;
  const uid = getUID(newData);
  const elementWithUid = containerElement.querySelector(`[data-uid="${uid}"]`);
  if (elementWithUid) {
    elementWithUid.remove();
  }
  const item = createItemFromData(newData);
  if (containerElement.firstChild) {
    containerElement.insertBefore(item, containerElement.firstChild);
  } else {
    containerElement.appendChild(item);
  }
  highlightElement(item);
  playNotificationSound();
}
function prependTwiterNewData(newData) {
  const signalItemContainer = document.querySelectorAll(
    ".signal-item-container"
  );
  const containerElement = signalItemContainer[1];
  if (!containerElement) return;
  const uid = newData.twitter_id;
  const elementWithUid = containerElement.querySelector(`[data-uid="${uid}"]`);
  if (elementWithUid) {
    return;
  }
  const item = createSignalTweetsItem(newData);
  if (containerElement.firstChild) {
    containerElement.insertBefore(item, containerElement.firstChild);
  } else {
    containerElement.appendChild(item);
  }
}

async function getWallets() {
  const res = await getWalletList({});
  if (!res) return;
  chrome.storage.local.set({ "tradewiz.wallets": res.data });
}

const removeSignalPanel = async () => {
  const container_ = document.querySelector(".signal-container");
  if (container_) {
    container_.remove();
  }
  if (platform === 1) {
    window.platformLayout = await findContainer(".c-body");
    if (!platformLayout) return;
    Object.assign(platformLayout.style, {
      paddingLeft: "",
      position: "",
    });
  }
  stopStyleMonitoringSignal();
};

async function findContainer(selector) {
  for (let i = 0; i < 50; i++) {
    const container = document.body.querySelector(selector);
    if (container) return container;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

const createStatistics = async () => {
  const response = await getSignalStatistics()
  const date = new Date(response.date);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const statistics = createStyledDiv({})
  statistics.className = "tradewiz-signal-statistics";
  statistics.innerHTML = `<div class="tradewiz-signal-statistics-item">
    <div class="tradewiz-signal-statistics-item-header">
      <img src="${chrome.runtime.getURL("src/public/assets/images/statistics.png")}" alt="" />
      <div class="tradewiz-signal-statistics-item-header-title">TradeWiz Smart Signal Analytics</div>
      <div class="tradewiz-signal-statistics-item-header-date">${formatted}</div>
    </div>
    <div class="tradewiz-signal-statistics-item-content">
      <div class="tradewiz-signal-statistics-item-content-new-signals">${response.total_count} <span class="twiter-signal-item-ca-title-gradient">new signals</span></div>
      <div class="tradewiz-signal-statistics-item-content-gaining">
        <span>${Math.round(response.gt_1_5_ratio)}%</span>
        (${response.gt_1_5_count} out of ${response.total_count})gaining over 
        <span class="tradewiz-signal-statistics-item-content-gaining-multiplier">
          1.5x  
          <img src="${chrome.runtime.getURL("src/public/assets/images/multiplier.png")}" alt="" />
        </span>
      </div>
      <div class="tradewiz-signal-statistics-item-content-gaining">
        <span>${Math.round(response.gt_3_ratio)}%</span>
        (${response.gt_3_count} out of ${response.total_count})gaining over
        <span class="tradewiz-signal-statistics-item-content-gaining-multiplier">
          3x
          <img src="${chrome.runtime.getURL("src/public/assets/images/multiplier.png")}" alt="" />
        </span>
      </div>
      <div class="tradewiz-signal-statistics-item-content-gaining">
        <span>${Math.round(response.gt_10_ratio)}%</span>
        (${response.gt_10_count} out of ${response.total_count})gaining over
        <span class="tradewiz-signal-statistics-item-content-gaining-multiplier">
          10x
          <img src="${chrome.runtime.getURL("src/public/assets/images/multiplier.png")}" alt="" />
        </span>
      </div>
    </div>
  </div>`;
  const overlay = createStyledDiv({
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: "8888",
  });
  overlay.addEventListener("click", () => {
    statistics.remove();
    overlay.remove();
  });
  document.body.appendChild(overlay);
  document.body.appendChild(statistics);
};
let styleSignalMonitorInterval = null;
let signalPanelObserver = null;
let signalPanelExists = false;

const startStyleMonitoringSignal = () => {
  if (styleSignalMonitorInterval) {
    clearInterval(styleSignalMonitorInterval);
    styleSignalMonitorInterval = null;
  }

  if (signalPanelObserver) {
    signalPanelObserver.disconnect();
    signalPanelObserver = null;
  }

  const signalContainer = document.body.querySelector(".signal-container");
  signalPanelExists = !!signalContainer;
  signalPanelObserver = new MutationObserver((mutations) => {
    let shouldRecreate = false;

    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (
          node.className === "signal-container" ||
          (node.querySelector && node.querySelector(".signal-container"))
        ) {
          shouldRecreate = true;
        }
      });

      mutation.addedNodes.forEach((node) => {
        if (
          node.className === "signal-container" ||
          (node.querySelector && node.querySelector(".signal-container"))
        ) {
          signalPanelExists = true;
        }
      });
    });

    if (shouldRecreate && !document.body.querySelector(".signal-container")) {
      signalPanelExists = false;

      if (styleSignalMonitorInterval) {
        clearTimeout(styleSignalMonitorInterval);
      }

      styleSignalMonitorInterval = setTimeout(() => {
        if (!document.body.querySelector(".signal-container")) {
          createSignalPanel();
        }
        styleSignalMonitorInterval = null;
      }, 500);
    }
  });

  signalPanelObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const stopStyleMonitoringSignal = () => {
  if (styleSignalMonitorInterval) {
    clearInterval(styleSignalMonitorInterval);
    styleSignalMonitorInterval = null;
  }

  if (signalPanelObserver) {
    signalPanelObserver.disconnect();
    signalPanelObserver = null;
  }

  signalPanelExists = false;
};

function updateCountdownText() {
  const countdownElements = Array.from(
    document.querySelectorAll(".triggered_time")
  );
  const now = new Date();
  const tokens = [];
  countdownElements.forEach((el) => {
    const isInViewport = isElementInViewport(el);
    if (!isInViewport) return;
    const createdAt = el.getAttribute("data-createdAt");
    if (!createdAt) return;
    const triggeredAgo = formatTimestamp(
      Math.floor((now - new Date(createdAt)) / 1000)
    );
    if (el.textContent !== triggeredAgo) {
      el.textContent = triggeredAgo;
    }
    const token = el.getAttribute("data-token");
    if (token && !tokens.includes(token)) {
      tokens.push(token);
    }
  });
  if (JSON.stringify(tokens) === JSON.stringify(window.subSignalsTokens))
    return;
  window.subSignalsTokens = tokens;
  subTokens({
    tokens: window.subSignalsTokens,
  });
}

function loop(timestamp) {
  if (timestamp - window.lastUpdateTime1s >= 1000) {
    updateCountdownText();
    window.lastUpdateTime1s = timestamp;
  }
  if (timestamp - window.lastUpdateTime10s >= 10000) {
    window.lastUpdateTime10s = timestamp;
    createCurrentTokenElement();
  }
  requestAnimationFrame(loop);
}
function updateCaInfo(caData) {
  const { Token, Mcp, Vol1h } = caData;
  const mcPrice = +Mcp;
  const formattedMc = formatTokenPrice(mcPrice);
  const formattedVol = formatTokenPrice(+Vol1h);

  function updateElement(el) {
    if (!isElementInViewport(el)) return;
    const token = el.getAttribute("data-token");
    if (!token || token !== Token) return;

    const mcElement = el.querySelector(".tradewiz-mc");
    if (!mcElement) return;

    const triggerMc = mcElement.getAttribute("data-trigger-mc");
    if (triggerMc !== null) {
      const triggerValue = +triggerMc;
      if (triggerValue === mcPrice) return;
      mcElement.textContent = `$${formattedMc}`;
      if (triggerValue > mcPrice) {
        mcElement.classList.add("mc-fall");
        mcElement.classList.remove("mc-rose");
      } else {
        mcElement.classList.add("mc-rose");
        mcElement.classList.remove("mc-fall");
      }
      const maxChangeValueElement = el.querySelector(".tradewiz-max-change");
      const multiple = Number(
        maxChangeValueElement.getAttribute("data-multiple")
      );
      if (!multiple || isNaN(multiple) || multiple <= 0) {
        return;
      }
      const maxMc = triggerValue * multiple;
      if (mcPrice > maxMc) {
        const newMultiple = Math.round(mcPrice / triggerValue);
        maxChangeValueElement.setAttribute("data-multiple", newMultiple);
        maxChangeValueElement.textContent = `${newMultiple}x`;
      }
    } else {
      mcElement.textContent = `$${formattedMc}`;
    }
    const volElement = el.querySelector(".tradewiz-vol");
    if (volElement) {
      volElement.textContent = `$${formattedVol}`;
    }
  }

  const allItems = document.querySelectorAll(
    ".signal-item, .tradewiz-signal-current-token-related-ca-item"
  );
  allItems.forEach(updateElement);
}

(function () {
  chrome.storage.local
    .get("tradewiz.config")
    .then((config) => {
      if (!config || !config["tradewiz.config"]) {
        return;
      }
      const getConfig = config["tradewiz.config"];
      const hostname = window.location.hostname.replace(/www\./, '');
      if (!getConfig || !getConfig[hostname]) {
        return;
      }
      initNotificationSound();
      getWallets();
      createSignalPanel();
      chrome.runtime.onMessage.addListener(async (request) => {
        if (request.message === "alphaSignal") {
          createWalletSignal();
          createCurrentTokenElement();
          if (!request.value) {
            stopStyleMonitoringSignal();
          }
        } else if (request.message === "signal-result") {
          if (window.signalType == "both") {
            prependWalletNewData(request.data);
          } else if (window.signalType == "public") {
            if (
              request.data?.channel?.is_system ||
              request.data?.channel?.type == 0
            ) {
              prependWalletNewData(request.data);
            }
          } else if (window.signalType == "custom") {
            if (
              !request.data?.channel?.is_system &&
              request.data?.channel?.type == 1
            ) {
              prependWalletNewData(request.data);
            }
          }
        } else if (request.message === "signal_tweet") {
          prependTwiterNewData(request.data);
        } else if (request.message == "loginSuccess") {
          document.querySelector("#tradewiz-login-tip")?.remove();
          loadWalletSignal();
        } else if (request.message === "token-mc-vol") {
          updateCaInfo(request.data);
        } else if (request.message === "token-alert") {
          const {
            symbol,
            token: tokenAddress,
            op,
            price,
            mcp: mc,
            id,
            avatar,
          } = request.data;
          createAlertToast(avatar, id, op, symbol, price, mc, tokenAddress);
          playAlertSound();
        } else if (request.message === "showCurrentToken") {
          createCurrentTokenElement();
        }
        // else if (request.message === "showTwitter") {
        //   createTwitterSignal();
        //   createCurrentTokenElement();
        // }
      });
      getStoredValue("tradewiz.minimizeModule").then(async (minimizeModule) => {
        if (minimizeModule && minimizeModule.length > 0) {
          await createMinimizeContainer()
        }
      });
      requestAnimationFrame(loop);
    })
    .catch((error) => {
      console.error("Error loading config:", error);
    });
})();
