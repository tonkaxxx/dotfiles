function createStyledDiv(styles, tag = "div", text = "") {
  const div = document.createElement("div");
  applyStyles(div, styles);
  div.innerText = text;
  return div;
}


function applyStyles(element, styles) {
  Object.assign(element.style, styles);
}

function styleButton(button, text, type, cmd = "", className = "") {
  button.innerText = text;
  if (type === "confirm") {
    Object.assign(button.style, {
      height: '32px',
      flex: '0 0 57px',
      background: cmd === "Buy" ? '#7FFA8B' : "#FF4D67",
      fontWeight: "600",
      color: '#000',
      fontSize: "14px",
      borderRadius: "8px",
      border: "none",
      textAlign: "center",
    });
    button.addEventListener("mouseover", () => {
      button.style.background = cmd === "Buy" ? '#7FFA8B' : "#FF4D67";
      button.style.color = "#000";
    });
    button.addEventListener("mouseout", () => {
      button.style.background = cmd === "Buy" ? '#7FFA8B' : "#FF4D67";
      button.style.color = "#000";
    });
  } else if (type === "select") {
    let color = "rgba(173,173,204,0.1)";
    if (cmd && cmd === 'Buy') {
      color = "#7FFA8B"
    } else if (cmd && cmd === 'Sell') {
      color = "#FF4D67"
    }
    Object.assign(button.style, {
      height: "32px",
      borderRadius: "8px",
      border: `1px solid ${color}`,
      background: "rgba(0, 0, 0, 0.2)",
      color: "white",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "500",
      display: 'flex',
      alignItems: 'center',
      justifyContent: "center",
      minWidth: "45px",
      maxWidth: "70px",
      boxSizing: "border-box",
      justifyContent: "center"
    });
    button.addEventListener("mouseover", () => {
      button.style.background = color;
      button.style.color = cmd ? "#000" : "white";
    });
    button.addEventListener("mouseout", () => {
      button.style.background = "rgba(0, 0, 0, 0.2)"
      button.style.color = "white";
    });
  } else if (type === "confirm_buy") {
    icon = createIcon(
      chrome.runtime.getURL("src/public/assets/images/small-logo.png"),
      {
        height: "auto",
        marginRight: "6px",
        borderRadius: "50%",
      },
      "16px"
    );
    button.prepend(icon);
    Object.assign(button.style, {
      minWidth: "55px",
      height: "30px",
      borderRadius: "8px",
      border: "1px solid #AC8AFF",
      background: "rgba(173,173,204,0.05)",
      color: "inherit",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "500",
      display: 'flex',
      alignItems: 'center',
      justifyContent: "center",
      marginLeft: "4px",
      padding: "0 4px",
    });
    button.addEventListener("mouseover", () => {
      button.style.background = "rgba(255,255,255,0.1)";
    });
    button.addEventListener("mouseout", () => {
      button.style.background = "rgba(173,173,204,0.05)";
    });
    button.className = className;
  }
}

function createButton(text, type, cmd) {
  const button = document.createElement("button");
  styleButton(button, text, type, cmd);
  return button;
}

/**
 * create icon
 * @param {*} iconUrl 
 * @param {*} styles 
 * @param {*} size 
 * @returns 
 */
function createIcon(iconUrl, styles, size = "14px",) {
  const icon = document.createElement("img");
  icon.src = iconUrl;
  Object.assign(icon.style, {
    width: size,
    height: size,
    cursor: "pointer",
    ...styles,
  });
  return icon;
}


/**
 * style input 
 * @param {*} input 
 * @param {*} text 
 */
function styleInput(input, text) {
  Object.assign(input.style, {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    border: "1px solid rgba(173, 173, 204, 0.1)",
    color: "white",
    padding: "0 16px",
    height: "32px",
    flex: "1",
    outline: "none",
    fontSize: "14px",
    width: 0
  });

  input.addEventListener("focus", () => {
    input.style.borderColor = "#AC8AFF";
  });
  input.addEventListener("blur", () => {
    input.style.borderColor = "rgba(173, 173, 204, 0.1)";
  });
}


/**
 * create select
 * @param {*} lists 
 * @returns 
 */
function createSelect(lists) {
  const selectContainer = createStyledDiv({
    height: "26px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(173, 173, 204, 0.1)",
    borderRadius: "8px",
    color: "rgba(255, 255, 255, 0.8)",
    padding: "0 8px",
  });
  const select = document.createElement("select");
  const selectOptions = lists.map((list) => {
    const option = document.createElement("option");
    option.value = list.value;
    option.text = list.text;
    return option;
  });
  Object.assign(select.style, {
    outline: "none",
    fontSize: "12px",
    background: "transparent",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "white",
    border: "none",
  });
  selectOptions.forEach((option) => select.appendChild(option));
  selectContainer.appendChild(select);
  return selectContainer;
}



function createButtonIcon({
  svg,
  tips = "",
  active = undefined,
  onClick = () => { },
  svg_ = null,
  noActiveBackground = false,
  width = "26px",
  height = "26px",
  styles = {}
}) {
  const button = document.createElement("div");
  Object.assign(button.style, {
    width,
    height,
    background: active && !noActiveBackground ? "#AC8AFF" : "rgba(173, 173, 204, 0.1)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    outline: "none",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.8)",
    ...styles
  });
  button.setAttribute("data-tip", tips)
  button.setAttribute("data-active", active);
  button.addEventListener("mouseenter", () => {
    button.style.color = "white";
  });
  button.addEventListener("mouseleave", () => {
    button.style.color = "rgba(255, 255, 255, 0.8)";
  });
  if (svg_) {
    button.innerHTML = active ? svg : svg_;
  } else {
    button.innerHTML = svg
  }
  button.setAttribute("tabindex", "-1");
  button.setAttribute("data-active", active);
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const isActive = button.getAttribute("data-active") === "true";
    if (svg_) {
      button.innerHTML = isActive ? svg_ : svg
    }
    if (active !== undefined && !noActiveBackground) {
      button.style.background = !isActive ? "#AC8AFF" : "rgba(173, 173, 204, 0.1)";
    }
    button.setAttribute("data-active", !isActive);
    onClick(e, button, !isActive);
    e.target.blur();
  });
  return button;
}



function enableDraggablePanel(panelRoot, storageKey) {
  let panelDragOffsetX = 0;
  let panelDragOffsetY = 0;
  let panelDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  let panelDragAnimationId;
  let dragOverlay = null;

  const handleMousedown = (evt) => {
    const headerEl = (storageKey === keys.minimizePosition || storageKey === "tradewiz.signalPosition") ? panelRoot.firstChild : panelRoot.firstChild.firstChild;
    if (evt.target === headerEl || headerEl?.contains(evt.target)) {
      panelDragging = true;

      const rect = panelRoot.getBoundingClientRect();
      const computedStyle = getComputedStyle(panelRoot);
      const transformOrigin = computedStyle.transformOrigin || "0px 0px";

      let offsetX = evt.clientX - rect.left;
      let offsetY = evt.clientY - rect.top;

      if (transformOrigin.trim() === "center" || transformOrigin.trim() === "50% 50%") {
        offsetX -= panelRoot.offsetWidth / 2;
        offsetY -= panelRoot.offsetHeight / 2;
      }

      panelDragOffsetX = offsetX;
      panelDragOffsetY = offsetY;
      lastMouseX = evt.clientX;
      lastMouseY = evt.clientY;
      panelRoot.style.userSelect = "none";

      createDragOverlay();
      initiatePanelDragAnimation();

      document.addEventListener("mousemove", handleMousemove);
      document.addEventListener("mouseup", handleMouseup);
    }
  };


  const handleMousemove = (evt) => {
    if (!panelDragging) return;
    lastMouseX = evt.clientX;
    lastMouseY = evt.clientY;
  };

  const initiatePanelDragAnimation = () => {
    const updatePosition = () => {
      if (!panelDragging) return;

      const { x: scaleX = 1, y: scaleY = 1 } = JSON.parse(panelRoot.dataset.scaleFactors || '{"x":1,"y":1}');
      let left = lastMouseX - panelDragOffsetX;
      let top = lastMouseY - panelDragOffsetY;

      const scaledWidth = panelRoot.offsetWidth * scaleX;
      const scaledHeight = panelRoot.offsetHeight * scaleY;

      const maxLeft = window.innerWidth - scaledWidth;
      const maxTop = window.innerHeight - scaledHeight;

      left = Math.min(Math.max(left, 0), maxLeft);
      top = Math.min(Math.max(top, 0), maxTop);

      panelRoot.style.left = `${left}px`;
      panelRoot.style.top = `${top}px`;

      panelDragAnimationId = requestAnimationFrame(updatePosition);
    };

    stopPanelDragAnimation();
    panelDragAnimationId = requestAnimationFrame(updatePosition);
  };

  const stopPanelDragAnimation = () => {
    if (panelDragAnimationId) {
      cancelAnimationFrame(panelDragAnimationId);
      panelDragAnimationId = null;
    }
  };

  const handleMouseup = async () => {
    panelDragging = false;
    panelRoot.style.userSelect = "";

    document.removeEventListener("mousemove", handleMousemove);
    document.removeEventListener("mouseup", handleMouseup);

    stopPanelDragAnimation();
    removeDragOverlay();

    let { left, top } = panelRoot.style;
    if (!left || left === "auto") {
      left = panelRoot.getBoundingClientRect().left + "px";
    }
    if (!top || top === "auto") {
      top = panelRoot.getBoundingClientRect().top + "px";
    }

    await chrome.storage.local.set({ [storageKey]: { left, top } });
  };

  function createDragOverlay() {
    dragOverlay = document.createElement("div");
    Object.assign(dragOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 999999,
      cursor: "move",
      background: "transparent"
    });
    document.body.appendChild(dragOverlay);
  }

  function removeDragOverlay() {
    if (dragOverlay && dragOverlay.parentNode) {
      dragOverlay.parentNode.removeChild(dragOverlay);
      dragOverlay = null;
    }
  }

  panelRoot.bloomDragHandler = handleMousedown;
  panelRoot.addEventListener("mousedown", panelRoot.bloomDragHandler);
}


function createCopyButton(address) {
  const button = document.createElement("button");
  button.className = "tradewiz-copy-button";
  Object.assign(button.style, {
    width: "132px",
    height: "36px",
    background: "#AC8AFF",
    borderRadius: "100px",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  });
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("src/public/assets/images/logo1.png");
  img.style.width = "32px";
  img.style.height = "17px";
  Object.assign(img.style, {
    position: "absolute",
    right: 0,
    bottom: 0,
  });
  button.innerText = "Copy Trade";
  button.appendChild(img);
  button.addEventListener("click", async () => {
    let loginBot = await getStoredValue("tradewiz.loginBot");
    if (!loginBot) {
      const tgBots = [
        "https://t.me/TradeWiz_Solbot",
        "https://t.me/WizGandalfBot",
        "https://t.me/WizSarumanBot",
        "https://t.me/WizVoldemortBot",
        "https://t.me/WizLoki_bot",
        "https://t.me/WizMedivhBot",
      ]
      const randomBot = tgBots[Math.floor(Math.random() * tgBots.length)];
      chrome.storage.local.set({ "tradewiz.loginBot": randomBot });
      loginBot = randomBot;
    }
    window.open(`${loginBot}?start=r-Extension-${address}`, "_blank");
  });
  return button;
}
function createQuickButton(text, cmd = "Buy", isHover = true, styles = {}) {
  const button = document.createElement("button");
  button.setAttribute("data-action", cmd);
  button.setAttribute("data-value", text);
  const loadingSvg = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:none;position:absolute;" class="loading">
    <path d="M7 0C10.8659 0 14 3.13413 14 7C14 8.6926 13.3961 10.2937 12.3172 11.5528C12.2383 11.6486 12.1411 11.7278 12.0313 11.7856C11.9215 11.8434 11.8012 11.8787 11.6775 11.8895C11.5539 11.9002 11.4293 11.8862 11.3112 11.8483C11.193 11.8103 11.0836 11.7492 10.9893 11.6684C10.8951 11.5877 10.8179 11.4889 10.7623 11.378C10.7066 11.267 10.6737 11.1461 10.6654 11.0223C10.657 10.8984 10.6735 10.7742 10.7138 10.6568C10.754 10.5394 10.8173 10.4312 10.8999 10.3385C11.698 9.40951 12.1357 8.22471 12.1333 7C12.1333 4.165 9.835 1.86667 7 1.86667C4.165 1.86667 1.86667 4.165 1.86667 7C1.86667 9.835 4.165 12.1333 7 12.1333C7.24752 12.1334 7.48488 12.2317 7.65989 12.4067C7.8349 12.5818 7.93322 12.8192 7.93322 13.0667C7.93322 13.3142 7.8349 13.5516 7.65989 13.7266C7.48488 13.9016 7.24752 14 7 14C3.13413 14 0 10.8659 0 7C0 3.13413 3.13413 0 7 0Z" fill="${cmd === "Buy" ? '#7FFA8B' : '#FF4D67'}"/>
    </svg>
  `
  const successSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:none;position:absolute;" class="success">
    <path d="M7 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0ZM10.5075 4.61813C10.0967 4.2321 9.44832 4.24771 9.057 4.65319L6.06638 7.75192L4.943 6.58739C4.55168 6.18192 3.90326 6.16631 3.49253 6.55234C3.07932 6.94069 3.06332 7.58801 3.457 7.99593L5.32367 9.93014C5.72855 10.3497 6.40479 10.3497 6.80967 9.93014L10.543 6.06172C10.9367 5.6538 10.9207 5.00648 10.5075 4.61813Z" fill="${cmd === "Buy" ? '#7FFA8B' : '#FF4D67'}" fill-opacity="0.6" />
    </svg>
  `
  button.innerHTML = `${loadingSvg} ${successSvg} <span>${isNumeric(text) ? formatTokenPrice(Number(text)) : text}</span>`;
  Object.assign(button.style, {
    height: "32px",
    borderRadius: "8px",
    border: `1px solid ${cmd === "Buy" ? "#7FFA8B" : "#FF4D67"}`,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
    minWidth: "45px",
    maxWidth: "68px",
    boxSizing: "border-box",
    background: "#101114",
    justifyContent: "center",
    position: "relative",
    zIndex: "10000",
    opacity: "1",
    transform: "translateY(0)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    ...styles,
  })
  if (isHover) {
    button.addEventListener("mouseover", () => {
      button.style.background = "rgba(173, 173, 204, 0.1)";
    });
    button.addEventListener("mouseout", () => {
      button.style.background = "#101114"
    });
  }
  return button;
}

function createPlatformButton(targetClassName, className, text) {
  const button = document.createElement("button");
  button.className = `${targetClassName} ${className}`;
  const icon = createIcon(
    chrome.runtime.getURL("src/public/assets/images/small-logo.png"),
    {
      height: "auto",
      marginRight: "6px",
      borderRadius: "50%",
    },
    "16px"
  );
  button.innerHTML = text;
  button.prepend(icon);
  Object.assign(button.style, {
    marginLeft: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  return button;
}

function createInput(text) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.setAttribute('inputmode', 'decimal');
  input.setAttribute('pattern', '[0-9]*[.,]?[0-9]*');
  Object.assign(input.style, {
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #AC8AFF",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    minWidth: "45px",
    maxWidth: "68px",
    boxSizing: "border-box",
    background: "transparent",
    textAlign: "center",
    appearance: "none",
    MozAppearance: "textfield",
    WebkitAppearance: "none",
    outline: "none",
  })

  input.addEventListener('input', (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      e.target.value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      e.target.value = cleanValue;
    }
  });

  input.addEventListener('keypress', (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[0-9.,]/.test(char)) {
      e.preventDefault();
    }
  });

  return input;
}
function createTag(text, size = "small") {
  const tag = document.createElement("div");
  const sizeStyle = {
    small: {
      height: "16px",
      fontSize: "10px",
      padding: "0 2px",
      bottom: "-21px",
      borderRadius: "4px",
    },
    large: {
      height: "32px",
      fontSize: "16px",
      padding: "0 8px",
      bottom: "-35px",
      borderRadius: "8px",
    }
  }
  tag.classList.add("tradewiz-tag")
  Object.assign(tag.style, {
    cursor: "pointer",
    background: "linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)",
    padding: "1px",
    height: sizeStyle[size].height,
    display: "flex",
    alignItems: "center",
    fontSize: sizeStyle[size].fontSize,
    fontWeight: "600",
    color: "#fff",
    borderRadius: sizeStyle[size].borderRadius,
    whiteSpace: "nowrap",
    position: "absolute",
    left: "0",
    bottom: sizeStyle[size].bottom,
  })
  const tagContent = createStyledDiv({
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    lineHeight: "1",
    padding: sizeStyle[size].padding,
    flexWrap: "nowrap",
    borderRadius: sizeStyle[size].borderRadius,
    scrollbarWidth: "none",
    background: "#16161C",
  })
  tagContent.innerText = text;
  tag.appendChild(tagContent);
  return tag;
}

function highlightElement(element) {
  let startTime = null;
  const duration = 300;
  const startColor = [100, 200, 255]
  const endColor = [0, 128, 0]

  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const currentColor = startColor.map((start, i) => {
      return Math.round(start + (endColor[i] - start) * progress);
    });

    element.style.backgroundColor = `rgb(${currentColor.join(',')})`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.style.backgroundColor = '';
    }
  }
  requestAnimationFrame(animate);
}

function createRadientBorderContainer(wrapperStyles, containerStyles, text = "") {
  const wrapper = createStyledDiv({
    padding: '1px',
    background: 'linear-gradient(85.02deg, #9448F8 21.95%, #2A3CFD 75.08%, #09D79E 120.24%)',
    ...wrapperStyles
  });
  const container = createStyledDiv(containerStyles, null, text);
  wrapper.appendChild(container)
  return [wrapper, container]
}

function setNativeInputValue(input, value) {
  const prototype = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor.set.call(input, value);
  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
}

async function createAddressTagHover(target, address) {
  const dataNote = target.getAttribute("data-note");
  if (!dataNote) return ""
  const response = await addressInfo(address)
  let remark = response.note?.note || "";
  const tags = []
  const pnls = response.tags?.pnls || []
  const topHolders = response.tags?.top_holders || []
  const profits = response.tags?.profits || []
  pnls.forEach((item) => {
    if (item.day === 3 && item.pnl > 1000) {
      tags.push(`${item.day}D High PNL`)
    } else if (item.day === 7 && item.pnl > 5000) {
      tags.push(`${item.day}D High PNL`)
    } else if (item.day === 30 && item.pnl > 10000) {
      tags.push(`${item.day}D High PNL`)
    }
  })
  topHolders.forEach((item) => {
    tags.push(`${item.token_item.symbol} Top ${mapToRange(item.rank)} Holder`)
  })
  profits.forEach((item) => {
    if (item.profit < 50000) return;
    tags.push(`${item.token_item.symbol} ${mapToProfitRange(item.profit)} profits`)
  })
  if (!remark && tags.length > 0) {
    remark = `${tags[0]} [${address.slice(-6)}]`;
  }
  const container = createAddressHtml(response.note, {}, address, false);
  Object.assign(container.style, {
    position: "initial",
  })
  const itemHovover = document.createElement('div');
  itemHovover.className = 'tradewiz-address-hover';
  itemHovover.innerHTML = `
    <div class="tradewiz-address-hover-content">
      <div class="tradewiz-address-hover-content-header">
        <img src=${chrome.runtime.getURL("src/public/assets/images/logo3.png")} alt="" />
      </div> 
      <div class="tradewiz-address-hover-content-body">
        <div class="tradewiz-address-hover-content-body-item">
          <div class="tradewiz-address-hover-content-body-item-title">
            Address
          </div>
          <div class="tradewiz-address-hover-content-body-item-value">
            <span style="color:#FFF">${formatAddress(address)}</span>
            <span class="tradewiz-address-hover-copy" data-clipboard-text="${address}">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_4292_917)">
                  <path
                    d="M12.2227 0C13.2043 0 14 0.795744 14 1.77734V9.59766C14 10.5793 13.2043 11.375 12.2227 11.375H11.375V12.2227C11.375 13.2043 10.5793 14 9.59766 14H1.77734C0.795744 14 0 13.2043 0 12.2227V4.40234C0 3.42074 0.795744 2.625 1.77734 2.625H2.625V1.77734C2.625 0.795744 3.42074 0 4.40234 0H12.2227ZM9.59766 4.375H1.77734C1.76224 4.375 1.75 4.38724 1.75 4.40234V12.2227C1.75 12.2378 1.76224 12.25 1.77734 12.25H9.59766C9.61276 12.25 9.625 12.2378 9.625 12.2227V4.40234C9.625 4.38724 9.61276 4.375 9.59766 4.375ZM12.2227 1.75H4.40234C4.38724 1.75 4.375 1.76224 4.375 1.77734V2.625H9.59766C10.5793 2.625 11.375 3.42074 11.375 4.40234V9.625H12.2227C12.2378 9.625 12.25 9.61276 12.25 9.59766V1.77734C12.25 1.76224 12.2378 1.75 12.2227 1.75Z"
                    fill="currentColor" />
                </g>
                <defs>
                  <clipPath id="clip0_4292_917">
                    <rect width="14" height="14" fill="currentColor" />
                  </clipPath>
                </defs>
              </svg>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
                style="display:none;">
                <path
                  d="M7 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0ZM10.5075 4.61813C10.0967 4.2321 9.44832 4.24771 9.057 4.65319L6.06638 7.75192L4.943 6.58739C4.55168 6.18192 3.90326 6.16631 3.49253 6.55234C3.07932 6.94069 3.06332 7.58801 3.457 7.99593L5.32367 9.93014C5.72855 10.3497 6.40479 10.3497 6.80967 9.93014L10.543 6.06172C10.9367 5.6538 10.9207 5.00648 10.5075 4.61813Z"
                  fill="#7FFA8B" />
              </svg>
            </span>
            <a href="https://solscan.io/account/${address}" target="_blank" rel="noopener noreferrer">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.99996 0.346191L9.58073 3.84722L8.69496 4.7194L6.62817 2.69249V8.58281H5.37176V2.69249L3.29868 4.7194L2.41291 3.84722L5.99996 0.346191ZM11.6538 7.9686L11.6412 10.1245C11.6412 10.9721 10.9377 11.6539 10.0707 11.6539H1.91663C1.04342 11.6539 0.346115 10.966 0.346115 10.1183V7.9686H1.60253V10.1183C1.60253 10.2903 1.74073 10.4255 1.91663 10.4255H10.0707C10.2466 10.4255 10.3848 10.2903 10.3848 10.1183L10.3974 7.9686H11.6538Z" fill="white" fill-opacity="0.4"/>
            </svg>
            </a>
          </div>
        </div>
        ${response.tweet_info ? `<div class="tradewiz-address-hover-content-body-item">
          <div class="tradewiz-address-hover-content-body-item-title">
            X Profile
          </div>
          <div class="tradewiz-address-hover-content-body-item-value">
            <span style="color:#FFF">@${response.tweet_info.name}</span>
            <a href="https://twitter.com/${response.tweet_info.screen_name}" target="_blank" rel="noopener noreferrer">
              <img src=${chrome.runtime.getURL("src/public/assets/images/share.png")} alt="" />
            </a>
          </div>
        </div>
        `: ""}
         <div class="tradewiz-address-hover-content-body-item">
          <div class="tradewiz-address-hover-content-body-item-title">
            Tags
          </div>
          <div class="tradewiz-address-hover-content-body-item-value">
            <div class="tradewiz-address-hover-content-body-item-value-tag">
            ${tags.map(tag => `<div class="tradewiz-address-hover-content-body-item-value-tag-item">
                <img src=${chrome.runtime.getURL("src/public/assets/images/tag.png")} alt="" />
                ${tag}
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  const addressHeader = itemHovover.querySelector(".tradewiz-address-hover-content-header")
  addressHeader.appendChild(container);
  const copyIcon = itemHovover.querySelector(".tradewiz-address-hover-copy");
  copyIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const svg = copyIcon.querySelector("svg:first-child");
    const successSvg = copyIcon.querySelector("svg:last-child");
    svg.style.display = "none";
    successSvg.style.display = "block";
    navigator.clipboard.writeText(address).then(() => {
      setTimeout(() => {
        svg.style.display = "block";
        successSvg.style.display = "none";
      }, 2000);
    }).catch((err) => {
      console.error("Failed to copy address: ", err);
      svg.style.display = "block";
      successSvg.style.display = "none";
    });
  });
  return itemHovover;
}

function mapToRange(value) {
  if (value <= 10) return 10;
  if (value <= 20) return 20;
  if (value <= 50) return 50;
  return 100;
}
function mapToProfitRange(value) {
  const ranges = [50_000, 100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000];

  for (const r of ranges) {
    if (value <= r) {
      return r >= 1_000_000 ? '1M' : `${r / 1000}K`;
    }
  }

  return '>1M';
}
function createAddressHtml(note = {}, icon = {}, address = "", isPopup = true) {
  const container = document.createElement("div");
  container.className = "tradewiz-address-tag-wrapper";
  const tag = note ? note.tag : {}
  const tags = []
  const pnls = tag?.pnls || []
  const topHolders = tag?.top_holders || []
  const profits = tag?.profits || []
  let remark = note?.note || "";

  pnls.forEach((item) => {
    if (item.day === 3 && item.pnl > 1000) {
      tags.push(`${item.day}D High PNL`)
    } else if (item.day === 7 && item.pnl > 5000) {
      tags.push(`${item.day}D High PNL`)
    } else if (item.day === 30 && item.pnl > 10000) {
      tags.push(`${item.day}D High PNL`)
    }
  })
  topHolders.forEach((item) => {
    tags.push(`${item.token_item.symbol} Top ${mapToRange(item.rank)} Holder`)
  })
  profits.forEach((item) => {
    if (item.profit < 50000) return;
    tags.push(`${item.token_item.symbol} ${mapToProfitRange(item.profit)} profits`)
  })
  if (!remark && tags.length > 0) {
    remark = `${tags[0]} [${address.slice(-6)}]`;
  }
  const platform = icon.Platforms ? icon.Platforms[0] : null
  let platformIcon = null
  if (platform && ["gmgn", "photon", "bullx", "trojan", "axiom"].includes(platform.platform.toLocaleLowerCase())) {
    platformIcon = chrome.runtime.getURL(`src/public/assets/images/${platform.platform.toLocaleLowerCase()}_sm.png`);
  }
  container.innerHTML = `
    <div class="tradewiz-address-tag">
      <div class="tradewiz-address-tag-container" style="display: ${remark ? "flex" : "none"}">
        <div class="tradewiz-address-tag-content show" data-note="${remark || ''}">
        ${remark ? `<div>${remark}</div>` : ""}
        </div>
        <div class="tradewiz-address-tag-content">
          <div class="tradewiz-address-tag-text">
            <input type="text" value="${remark || ''}" />
            <img class="tradewiz-address-tick-icon" src="${chrome.runtime.getURL("src/public/assets/images/tick.png")}" alt="" />
          </div>
        </div>
      </div>
      <div class="tradewiz-address-edit-icon">
        <span class="tradewiz-address-edit-icon-svg show">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_2237_32581)">
            <path d="M4.82014 2.4891L6.88589 4.55485L2.06577 9.375H0V7.30924L4.82014 2.4891ZM10 8.125V9.375H3.75L5 8.125H10ZM7.23018 0.767611L8.6074 2.1448C8.79753 2.33494 8.79753 2.64324 8.6074 2.83339L7.57447 3.86628L5.50872 1.8005L6.5416 0.767611C6.73178 0.577463 7.04004 0.577463 7.23018 0.767611Z" fill="#AC8AFF"/>
            </g>
            <defs>
            <clipPath id="clip0_2237_32581">
            <rect width="10" height="10" fill="currentColor"/>
            </clipPath>
            </defs>
          </svg>
        </span>
        <span class="tradewiz-address-close-icon-svg">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.63592 1.53108L4.99958 3.89475L7.36408 1.53108C7.64883 1.24632 8.09872 1.22733 8.40549 1.47411L8.46893 1.53106C8.77403 1.83615 8.77404 2.33081 8.46894 2.63592L6.10458 4.99975L8.4691 7.36441C8.75385 7.64917 8.77283 8.09906 8.52604 8.40583L8.46908 8.46926C8.16398 8.77436 7.66932 8.77435 7.36423 8.46925L4.99958 6.10475L2.63576 8.46925C2.35101 8.75401 1.90112 8.773 1.59435 8.52622L1.53091 8.46926C1.22581 8.16417 1.2258 7.66951 1.53088 7.36442L3.89521 4.99975L1.53105 2.63592C1.2463 2.35116 1.22732 1.90127 1.47411 1.5945L1.53106 1.53106C1.83617 1.22597 2.33083 1.22598 2.63592 1.53108Z" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>
    <div class="tradewiz-address-tag-container-icon">
      ${icon.IsFreshWallet ? window.addressIcon.freshWallet : ""}
      ${icon.IsSmartMoney ? window.addressIcon.smartMoney : ""}
      ${icon.IsKol ? window.addressIcon.kol : ""}
      ${icon.IsInsider ? window.addressIcon.insider : ""}
      ${icon.IsBundler ? window.addressIcon.bundler : ""}
      ${icon.IsDev ? window.addressIcon.dev : ""}
      ${icon.IsTop50Holder ? window.addressIcon.top50Holder : ""}
      ${icon.IsSniper ? window.addressIcon.sniper : ""}
    </div>
    `;
  const tagIcon = container.querySelector(".tradewiz-address-tag-container-icon");
  if (platformIcon) {
    const platformImg = document.createElement("img");
    platformImg.src = platformIcon;
    platformImg.alt = platform.platform;
    platformImg.style.width = "12px";
    platformImg.style.height = "12px";
    platformImg.setAttribute("data-tip", platform.platform);
    tagIcon.appendChild(platformImg);
  }
  const tagContainer = container.querySelector(".tradewiz-address-tag-container");
  const tagContents = container.querySelectorAll(".tradewiz-address-tag-content");
  const tagEditIcon = container.querySelector(".tradewiz-address-edit-icon-svg");
  const tagTextInput = container.querySelector(".tradewiz-address-tag-text input");
  const closeIcon = container.querySelector(".tradewiz-address-close-icon-svg");
  const tagTickIcon = container.querySelector(".tradewiz-address-tick-icon");
  tagEditIcon.addEventListener("click", (e) => {
    tagContents.forEach((content) => {
      content.classList.toggle("show");
    });
    tagTextInput.focus();
    closeIcon.classList.toggle("show");
    tagEditIcon.classList.toggle("show");
    Object.assign(tagContainer.style, {
      display: "flex"
    })
  });
  closeIcon.addEventListener("click", (e) => {
    tagContents.forEach((content) => {
      content.classList.toggle("show");
    });
    closeIcon.classList.toggle("show");
    tagEditIcon.classList.toggle("show");
    Object.assign(tagContainer.style, {
      display: tagTextInput.value ? "flex" : "none"
    })
  });
  const handleConfirm = async (e) => {
    const newNote = tagTextInput.value.trim();
    closeIcon.click();
    const elements = document.querySelectorAll(`[data-inserted-address="${address}"]`);
    elements.forEach((el) => {
      const addressTag = el.querySelectorAll(".tradewiz-address-tag-content")[0];
      const container = el.querySelector(".tradewiz-address-tag-container");
      addressTag.setAttribute("data-note", newNote);
      addressTag.innerText = newNote;
      container.style.display = newNote ? "flex" : "none";
    })

    const newAddressMap = JSON.parse(localStorage.getItem('tradewiz.addressList')) || {};
    if (!newAddressMap[address]) {
      newAddressMap[address] = {
        note: {
          note: newNote,
          tag: {}
        }
      };
    } else {
      newAddressMap[address].note.note = newNote;
    }
    localStorage.setItem('tradewiz.addressList', JSON.stringify(newAddressMap));
    signalUseSet(window.platform, 11)
    await addressEdit({
      "address": address,
      "note": newNote
    })
  }
  tagTickIcon.addEventListener("click", async (e) => {
    handleConfirm()
  });
  if (isPopup) {
    attachHoverPopup({
      target: tagContents[0],
      createPopupContent: () => createAddressTagHover(tagContents[0], address),
      popupClassName: "tradewiz-address-hover-warpper",
    });
    attachHoverPopup({
      target: tagEditIcon,
      createPopupContent: () => createAddressTagHover(tagContents[0], address),
      popupClassName: "tradewiz-address-hover-warpper"
    });
  }
  return container;
}
async function updateAlertButton() {
  const { data: alertList = [] } = await getAlertList('', '') || {}
  const alertButton = document.querySelector('#alert-button')
  if (alertButton) {
    let color = 'white'
    if (alertList.length) {
      color = '#FFC300'
    } else {
      color = 'white'
    }
    alertButton.style.color = color
  }
}
function createAlertToast(avatar, id, op, symbol, price, mc, tokenAddress) {
  let existingContainer = document.querySelector('#alert-toast-container')
  if (!existingContainer) {
    existingContainer = createStyledDiv({
      position: 'fixed',
      top: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "460px",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      zIndex: 99999,
    })
    existingContainer.id = 'alert-toast-container'




    document.querySelector('body').appendChild(existingContainer)
  }
  const alertToastItem = createStyledDiv({
    width: '100%',
    padding: '8px',
    background: '#2B2B33',
    borderRadius: '8px',
    outline: '1px rgba(173, 173, 204, 0.10) solid', outlineOffset: '-1px',
    justifyContent: "flex-start", alignItems: 'center', gap: "10px", display: "inline-flex"
  })
  const upIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M3.57891 0.178351C3.81145 -0.0541899 4.18848 -0.0541877 4.42102 0.178356L7.02022 2.77755C7.25276 3.01009 7.25276 3.38712 7.02022 3.61966C6.78768 3.8522 6.41065 3.8522 6.17811 3.61966L4.59424 2.03584L4.59542 7.40047C4.59542 7.70404 4.36827 7.95455 4.07466 7.99129L3.99996 7.99593C3.6711 7.99593 3.4045 7.72933 3.4045 7.40047L3.40405 2.03584L1.82186 3.61963C1.62406 3.81743 1.31892 3.84847 1.08276 3.70107L1.02526 3.66049L0.979749 3.61963C0.747205 3.38709 0.747203 3.01006 0.979744 2.77752L3.57891 0.178351Z" fill="#7FFA8B"/>
            </svg>`
  const downIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4.42109 7.82159C4.18855 8.05413 3.81152 8.05413 3.57898 7.82158L0.979784 5.22239C0.74724 4.98985 0.747238 4.61282 0.979779 4.38028C1.21232 4.14774 1.58935 4.14774 1.82189 4.38028L3.40576 5.9641L3.40458 0.599467C3.40458 0.2959 3.63173 0.0453894 3.92534 0.00864717L4.00004 0.00400832C4.3289 0.00401021 4.5955 0.270609 4.5955 0.599468L4.59595 5.9641L6.17814 4.3803C6.37594 4.18251 6.68108 4.15147 6.91724 4.29887L6.97474 4.33945L7.02025 4.38031C7.2528 4.61285 7.2528 4.98988 7.02026 5.22242L4.42109 7.82159Z" fill="#FF4D67"/>
          </svg>`
  alertToastItem.innerHTML = `
        <div style="justify-content: flex-start; align-items: center; gap: 8px; display: flex">
          <div style="width: 24px; height: 24px; position: relative;cursor:pointer;" id="tradewiz-price-alert-${id}">
            <img style="width: 24.75px; height: 24.38px; left: -0.38px; top: -0.14px; position: absolute" src="${avatar}" />
          </div>
          <div style="height: 21px; justify-content: flex-start; align-items: center; gap: 8px; display: flex">
            <div style="color: white; font-size: 14px;  font-weight: 400; text-decoration: underline; word-wrap: break-word;cursor:pointer;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width:100px;" id="tradewiz-price-alert-symbol-${id}">${symbol}</div>
            <div style="justify-content: flex-start; align-items: center; gap: 2px; display: flex;color: rgba(255, 255, 255, 0.60); font-size: 12px; font-weight: 400; word-wrap: break-word">Price/Market Crossing ${op == 'lte' ? 'Down' + downIcon : 'Up' + upIcon}</div>
            <div style="color: white; font-size: 12px;  font-weight: 500; word-wrap: break-word">$${formatTokenPrice(price)}/${formatTokenPrice(mc)}</div>
          </div>
        </div>
        <div style="justify-content: flex-start; align-items: center; gap: 20px; display: flex;cursor:pointer;margin-left:auto;" id="tradewiz-price-alert-close-${id}">
          <div style="width: 20px; height: 20px; background: rgba(173, 173, 204, 0.10); border-radius: 9999px;display:flex;justify-content:center;align-items:center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.63592 0.531565L3.99958 2.89523L6.36407 0.531565C6.64883 0.246804 7.09871 0.227814 7.40549 0.474599L7.46893 0.53155C7.77403 0.836643 7.77404 1.3313 7.46894 1.63641L5.10458 4.00023L7.4691 6.3649C7.75385 6.64966 7.77283 7.09955 7.52603 7.40632L7.46908 7.46975C7.16398 7.77484 6.66932 7.77484 6.36423 7.46974L3.99958 5.10523L1.63576 7.46974C1.35101 7.7545 0.901123 7.77349 0.594345 7.5267L0.53091 7.46975C0.225809 7.16466 0.225802 6.67 0.530881 6.36491L2.8952 4.00023L0.53105 1.6364C0.246297 1.35164 0.227319 0.901755 0.474112 0.594984L0.531065 0.53155C0.836166 0.226457 1.33083 0.226463 1.63592 0.531565Z" fill="white" fill-opacity="0.8"/>
              </svg>
          </div>
        </div>
      `
  const navigateToPage = async (e) => {
    if (window.platform === 0 || window.platform === 9) {
      e.preventDefault();
      await deleteAlert({ id: `${id}`, token: tokenAddress })
      alertToastItem.remove()
      await updateAlertButton()
      navigateToToken(platformPathMap(window.platform, tokenAddress))
    }
  }
  alertToastItem.querySelector(`#tradewiz-price-alert-${id}`).addEventListener("click", async (e) => {
    await navigateToPage(e)
  })
  alertToastItem.querySelector(`#tradewiz-price-alert-symbol-${id}`).addEventListener("click", async (e) => {
    await navigateToPage(e)
  })
  alertToastItem.querySelector(`#tradewiz-price-alert-close-${id}`).addEventListener("click", async (e) => {
    e.preventDefault();
    alertToastItem.remove()
    await deleteAlert({ id: `${id}`, token: tokenAddress })
    await updateAlertButton()
  })


  let timeoutId;
  let isHovering = false;

  const removeAlertToast = () => {
    if (!isHovering) {
      setTimeout(() => {
        alertToastItem.remove();
      }, 300);
    }
  };

  const startTimer = () => {
    if (!isHovering) {
      timeoutId = setTimeout(removeAlertToast, 5000);
    }
  };

  const stopTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  alertToastItem.addEventListener("mouseenter", () => {
    isHovering = true;
    stopTimer();
  });

  alertToastItem.addEventListener("mouseleave", () => {
    isHovering = false;
    startTimer();
  });
  startTimer();

  existingContainer.prepend(alertToastItem)

}
