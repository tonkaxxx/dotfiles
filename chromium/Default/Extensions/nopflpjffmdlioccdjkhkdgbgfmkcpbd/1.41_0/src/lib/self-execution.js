let solPrice = 0;
const defaultPreset = {
  label: "Default",
  values: {
    buyAmounts: [0.1, 1, 2, 5, 10],
    sellPercents: [10, 20, 50, 100],
    buyFee: 0.002,
    buyTip: 0.002,
    buySlippage: 20,
    sellFee: 0.002,
    sellTip: 0.002,
    sellSlippage: 20,
    quickBuy: 0.1,
    antiMev: true,
    sellAntiMev: true,
  }
}
function enableTips(attributeName = 'data-tip') {
  const createTip = () => {
    const tip = document.createElement('div');
    tip.className = 'tradewiz-tip';
    Object.assign(tip.style, {
      position: "fixed",
      background: "#2B2B33",
      color: "rgba(255, 255, 255, 0.6)",
      padding: "5px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      pointerEvents: "none",
      zIndex: "9999",
      whiteSpace: "nowrap",
      opacity: "0",
      transform: "translateY(6px)",
      transition: "opacity 0.2s ease, transform 0.2s ease",
      display: "none",
      border: "1px solid rgba(173, 173, 204, 0.1)",
      alignItems: "center",
    });
    document.body.appendChild(tip);
    return tip;
  };

  let tip = document.querySelector('.tradewiz-tip');
  if (!tip) {
    tip = createTip();
  }

  let showTimer = null;
  let hideTimer = null;
  let activeEl = null;

  const showTip = (el) => {
    if (!tip || !document.body.contains(tip)) {
      tip = document.querySelector('.tradewiz-tip');
      if (!tip) {
        tip = createTip();
      }
    }
    const content = el.getAttribute(attributeName);
    if (!content) return;

    tip.innerHTML = content;
    tip.style.display = 'flex';
    clearTimeout(hideTimer);

    const updatePosition = () => {
      if (!el.isConnected) {
        hideTip();
        return;
      }

      const padding = 4;
      const { offsetWidth, offsetHeight } = tip;
      const rect = el.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - offsetWidth / 2;
      let top;

      const spaceAbove = rect.top - padding;
      if (spaceAbove < offsetHeight) {
        top = rect.bottom + padding;
      } else {
        top = rect.top - offsetHeight - padding;
      }

      left = Math.max(8, Math.min(left, window.innerWidth - offsetWidth - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - offsetHeight - 8));
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;

      tip.style.opacity = '1';
      tip.style.transform = 'translateY(0)';

      requestAnimationFrame(updatePosition);
    };

    requestAnimationFrame(updatePosition);
  };

  const hideTip = () => {
    tip.style.opacity = '0';
    tip.style.transform = 'translateY(6px)';
    hideTimer = setTimeout(() => {
      tip.style.display = 'none';
      activeEl = null;
    }, 200);
  };

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(`[${attributeName}]`);
    if (el && el !== activeEl) {
      activeEl = el;
      showTip(el);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest(`[${attributeName}]`);
    const related = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(`[${attributeName}]`);
    if (el && !related) {
      hideTip();
    }
  });
}

const buyKeyBoard = ["Q", "W", "E", "R"]
const sellKeyBoard = ["A", "S", "D", "F"]
const createKeyBoard = (button, text) => {
  const newButton = document.createElement('div');
  newButton.innerText = text;
  newButton.className = 'quick-keyboard-hint';
  Object.assign(newButton.style, {
    width: "42px",
    height: "28px",
    borderRadius: "6px",
    background: "#2B2B33",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    border: "1px solid rgba(173, 173, 204, 0.1)",
    zIndex: 10000,
    opacity: '0',
    transform: 'translateY(6px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: 'none',
  });

  const rect = button.getBoundingClientRect();
  newButton.style.left = `${rect.left + (rect.width - 42) / 2}px`;
  newButton.style.top = `${rect.bottom + 8}px`;

  document.body.appendChild(newButton);

  requestAnimationFrame(() => {
    newButton.style.opacity = '1';
    newButton.style.transform = 'translateY(0)';
  });
}

function removeAllKeyBoardHints() {
  document.querySelectorAll('.quick-keyboard-hint').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  });
}
/**
 * Toggle the quick panel keyboard hints
 * @param {boolean} [value] - If provided, will set the keyboard visibility directly
 * @description If no value is provided, it will check the stored value for "tradewiz.showKeyboard".
 * If the value is true, it will show the keyboard hints; if false, it will remove them.
 * It also sets up event listeners for keydown and keyup events
 * to handle keyboard interactions for buying and selling actions.
 * @param {*} value 
 * @returns 
 */
async function quickPanelKeyBoard(value) {
  const showKeyboard = value === undefined ? await getStoredValue("tradewiz.showKeyboard") : value;

  // Remove existing listeners if any
  if (window._keyboardListeners) {
    window._keyboardListeners.forEach(listener => {
      document.removeEventListener('keydown', listener.keydown);
      document.removeEventListener('keyup', listener.keyup);
    });
  }

  if (!showKeyboard) {
    // Remove any existing keyboard hints
    removeAllKeyBoardHints();
    return;
  }

  let isKeyBoardShown = false;
  let isSpacePressed = false;
  let buyButtons = [];
  let sellButtons = [];

  const keydownHandler = (e) => {
    if (e.code === 'Space' && !isKeyBoardShown) {
      isKeyBoardShown = true;
      isSpacePressed = true;
      const tradePanel = document.querySelector('.tradewiz-panel');
      buyButtons = Array.from(tradePanel.querySelectorAll('button[data-action="Buy"]'));
      sellButtons = Array.from(tradePanel.querySelectorAll('button[data-action="Sell"]'));
      buyButtons.forEach((button, index) => {
        if (buyKeyBoard[index]) createKeyBoard(button, buyKeyBoard[index])
      })
      sellButtons.forEach((button, index) => {
        if (sellKeyBoard[index]) createKeyBoard(button, sellKeyBoard[index])
      })
    }
    if (e.code === 'Space') {
      isSpacePressed = true;
    }
    const keyUpper = e.key.toUpperCase();
    if (isSpacePressed && (buyKeyBoard.includes(keyUpper) || sellKeyBoard.includes(keyUpper))) {
      let idx = buyKeyBoard.indexOf(keyUpper);
      if (idx !== -1 && buyButtons[idx]) {
        buyButtons[idx].click();
        e.preventDefault();
        return;
      }
      idx = sellKeyBoard.indexOf(keyUpper);
      if (idx !== -1 && sellButtons[idx]) {
        sellButtons[idx].click();
        e.preventDefault();
        return;
      }
    }
  };

  const keyupHandler = (e) => {
    if (e.code === 'Space') {
      removeAllKeyBoardHints();
      isKeyBoardShown = false;
      isSpacePressed = false;
    }
  };

  document.addEventListener('keydown', keydownHandler);
  document.addEventListener('keyup', keyupHandler);

  // Store listeners for cleanup
  window._keyboardListeners = [{
    keydown: keydownHandler,
    keyup: keyupHandler
  }];
}
const injectPageScript = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/lib/injected.js');
  script.onload = () => {
    script.remove();
  }
  document.head.appendChild(script);
}
const navigateToToken = (path) => {
  window.dispatchEvent(new CustomEvent('from-plugin', {
    detail: { path: path }
  }));
}
/**
 * Attach a hover popup to elements matching a selector
 * @param {Object} param0 - The parameters
 * @param {Element} [param0.target=document] - The target element to attach the popup to
 * @param {string} param0.selector - The CSS selector for the elements to attach the popup to
 * @param {function} param0.createPopupContent - Function to create the content of the popup
 * @param {string} [param0.popupClassName='hover-popup'] - The class name for the popup element
 * @param {number} [param0.delay=100] - Delay in milliseconds before hiding the popup
 * @param {string} [param0.loadingContent='<div>Loading...</div>'] - HTML content shown during loading
 * @param {number} [param0.hoverDelay=200] - Delay before showing popup on hover
 * @returns {void}
 */
function attachHoverPopup({
  target = document,
  selector,
  createPopupContent,
  popupClassName = 'hover-popup',
  delay = 100,
  loadingContent = '<div class="sk-chase"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>',
  hoverDelay = 100,
}) {
  const targets = selector ? target.querySelectorAll(selector) : [target];
  let hoverTimeout = null;
  let currentTarget = null;
  let currentRequestId = 0;
  const enterTimeoutMap = new WeakMap();

  function onPosition(popupEl, target) {
    const rect = target.getBoundingClientRect();
    if (!popupEl || !rect) return;
    const popupRect = popupEl.getBoundingClientRect();
    const padding = 8;

    let left = rect.right;
    let top = rect.top;

    if (left + popupRect.width > window.innerWidth - padding) {
      left = rect.left - popupRect.width;
    }

    if (top + popupRect.height > window.innerHeight - padding) {
      top = window.innerHeight - popupRect.height - padding;
    }

    if (top < padding) top = padding;

    popupEl.style.position = 'fixed';
    popupEl.style.left = `${Math.max(left, padding)}px`;
    popupEl.style.top = `${Math.max(top, padding)}px`;
  }


  async function showHover(target) {
    clearTimeout(hoverTimeout);
    if (currentTarget === target) return;

    const requestId = ++currentRequestId;
    currentTarget = target;

    document.querySelector(`.${popupClassName}`)?.remove();

    const popupEl = Object.assign(document.createElement('div'), {
      innerHTML: loadingContent,
      className: popupClassName
    });
    document.body.appendChild(popupEl);
    onPosition(popupEl, target);
    requestAnimationFrame(() => popupEl.classList.add('show'));

    popupEl.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
    popupEl.addEventListener('mouseleave', (e) => {
      if (!currentTarget || !currentTarget.contains(e.relatedTarget)) scheduleHide();
    });

    const content = await createPopupContent(target);

    if (requestId !== currentRequestId) return;

    if (typeof content === 'string') {
      popupEl.innerHTML = content;
      onPosition(popupEl, target);
    } else {
      popupEl.innerHTML = '';
      popupEl.appendChild(content);
      onPosition(popupEl, target);
      requestAnimationFrame(() => popupEl.classList.add('show'));

      popupEl.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
      popupEl.addEventListener('mouseleave', (e) => {
        if (!currentTarget || !currentTarget.contains(e.relatedTarget)) scheduleHide();
      });
    }
  }

  function scheduleHide() {
    clearTimeout(hoverTimeout);
    currentTarget = null;
    hoverTimeout = setTimeout(() => {
      const popupEl = document.querySelector(`.${popupClassName}`);
      if (popupEl) {
        popupEl.classList.remove('show');
        popupEl.addEventListener(
          'transitionend',
          () => {
            popupEl.remove();
            currentTarget = null;
          },
          { once: true }
        );
      }
    }, delay);
  }

  targets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const enterTimeout = setTimeout(() => {
        if (document.body.contains(el)) {
          showHover(el);
        }
      }, hoverDelay);
      enterTimeoutMap.set(el, enterTimeout);
    });

    el.addEventListener('mouseleave', (e) => {
      clearTimeout(enterTimeoutMap.get(el));

      const popupEl = document.querySelector(`.${popupClassName}`);
      if (!popupEl || !popupEl.contains(e.relatedTarget)) {
        scheduleHide();
      }
    });
  });
}


/**
 * Check if an element is in the viewport
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - True if the element is in the viewport, false otherwise
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight)
  );
}

(function () {
  enableTips()
  quickPanelKeyBoard()
  injectPageScript()
  chrome.runtime.onMessage.addListener((request) => {
    if (request.message === "switchKeyboard") {
      quickPanelKeyBoard(request.value)
    }
  })
})();