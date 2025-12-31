const stopBtn = document.querySelector(".copy-wrap-stop-btn");

// SVG icons
const copySvg = `
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_4292_917)">
      <path d="M12.2227 0C13.2043 0 14 0.795744 14 1.77734V9.59766C14 10.5793 13.2043 11.375 12.2227 11.375H11.375V12.2227C11.375 13.2043 10.5793 14 9.59766 14H1.77734C0.795744 14 0 13.2043 0 12.2227V4.40234C0 3.42074 0.795744 2.625 1.77734 2.625H2.625V1.77734C2.625 0.795744 3.42074 0 4.40234 0H12.2227ZM9.59766 4.375H1.77734C1.76224 4.375 1.75 4.38724 1.75 4.40234V12.2227C1.75 12.2378 1.76224 12.25 1.77734 12.25H9.59766C9.61276 12.25 9.625 12.2378 9.625 12.2227V4.40234C9.625 4.38724 9.61276 4.375 9.59766 4.375ZM12.2227 1.75H4.40234C4.38724 1.75 4.375 1.76224 4.375 1.77734V2.625H9.59766C10.5793 2.625 11.375 3.42074 11.375 4.40234V9.625H12.2227C12.2378 9.625 12.25 9.61276 12.25 9.59766V1.77734C12.25 1.76224 12.2378 1.75 12.2227 1.75Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_4292_917">
        <rect width="14" height="14" fill="currentColor"/>
      </clipPath>
    </defs>
  </svg>
`;

const copySuccessSvg = `
  <svg width="14" height="14" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g transform="translate(-521.000000, -1894.000000)" fill="rgba(173, 173, 204, 0.6)" fillRule="nonzero">
        <g transform="translate(92.000000, 1881.000000)">
          <g transform="translate(73.000000, 0.000000)">
            <g transform="translate(356.000000, 13.000000)">
              <path d="M12.7196056,2.74628263 C13.1629092,3.1975024 13.1629092,3.9274976 12.7196056,4.37871737 L5.96521964,11.2537174 C5.51979678,11.7070942 4.7959927,11.7070942 4.35056983,11.2537174 L1.28039439,8.12871737 C0.837090758,7.6774976 0.837090758,6.9475024 1.28039439,6.49628263 C1.72581726,6.04290579 2.44962134,6.04290579 2.89505044,6.49628898 L5.15754167,8.799875 L11.1049558,2.74628263 C11.5503787,2.29290579 12.2741827,2.29290579 12.7196056,2.74628263 Z"/>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
`;

const playSvg = ` <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_5020_124877)">
                <path d="M7 0.5C10.5899 0.5 13.5 3.41015 13.5 7C13.5 10.5899 10.5899 13.5 7 13.5C3.41015 13.5 0.5 10.5899 0.5 7C0.5 3.41015 3.41015 0.5 7 0.5ZM6.11364 4.44129C5.7197 4.21385 5.22727 4.49815 5.22727 4.95303V9.04697C5.22727 9.50185 5.7197 9.78615 6.11364 9.55871L9.65909 7.51174C10.053 7.2843 10.053 6.7157 9.65909 6.48826L6.11364 4.44129Z" fill="currentColor"/>
              </g>
            </svg>`
const stopSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 0.5C10.5899 0.5 13.5 3.41015 13.5 7C13.5 10.5899 10.5899 13.5 7 13.5C3.41015 13.5 0.5 10.5899 0.5 7C0.5 3.41015 3.41015 0.5 7 0.5ZM5.52273 4.46753C5.10313 4.46753 4.76299 4.80768 4.76299 5.22727V8.77273C4.76299 9.19232 5.10313 9.53247 5.52273 9.53247C5.94232 9.53247 6.28247 9.19232 6.28247 8.77273V5.22727C6.28247 4.80768 5.94232 4.46753 5.52273 4.46753ZM8.47727 4.46753C8.05768 4.46753 7.71753 4.80768 7.71753 5.22727V8.77273C7.71753 9.19232 8.05768 9.53247 8.47727 9.53247C8.89687 9.53247 9.23701 9.19232 9.23701 8.77273V5.22727C9.23701 4.80768 8.89687 4.46753 8.47727 4.46753Z" fill="currentColor"/>
</svg>
`

const loadingSvg = `
<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2192_107974)">
<path d="M10.5 0.5C16.2988 0.5 21 5.2012 21 11C21 13.5389 20.0942 15.9406 18.4758 17.8292C18.3575 17.9729 18.2117 18.0916 18.0469 18.1784C17.8822 18.2651 17.7018 18.318 17.5163 18.3342C17.3308 18.3503 17.144 18.3293 16.9668 18.2724C16.7895 18.2155 16.6254 18.1238 16.484 18.0026C16.3426 17.8815 16.2268 17.7334 16.1434 17.567C16.0599 17.4005 16.0105 17.2191 15.998 17.0334C15.9855 16.8476 16.0102 16.6612 16.0707 16.4851C16.1311 16.309 16.226 16.1468 16.3499 16.0078C17.5469 14.6143 18.2035 12.8371 18.2 11C18.2 6.7475 14.7525 3.3 10.5 3.3C6.2475 3.3 2.8 6.7475 2.8 11C2.8 15.2525 6.2475 18.7 10.5 18.7C10.8713 18.7 11.2273 18.8476 11.4898 19.1101C11.7524 19.3727 11.8998 19.7287 11.8998 20.1C11.8998 20.4713 11.7524 20.8273 11.4898 21.0899C11.2273 21.3524 10.8713 21.5 10.5 21.5C4.7012 21.5 0 16.7988 0 11C0 5.2012 4.7012 0.5 10.5 0.5Z" fill="#ADADCC"/>
</g>
<defs>
<clipPath id="clip0_2192_107974">
<rect width="21" height="21" fill="white"/>
</clipPath>
</defs>
</svg>
`
const deleteCopy = async (item) => {
  await deleteCopyTrading({
    id: item.id
  })
  showToast("successfully")
  loadCopyTrading()
}

// Create copy trading item component
const createCopyItem = (item) => {
  const copyItem = createStyledDiv();

  const getRingHtml = (enabled) => {
    return enabled ?
      `<div class="ring-wrapper ring-active">
        <div class="ring3"></div>
        <div class="ring2"></div>
        <div class="center-dot"></div>
      </div>` :
      `<div class="ring-wrapper">
        <div class="ring-inactive"></div>
      </div>`;
  };

  copyItem.innerHTML = `
    <div class="copy-wrap-content-item">
      <div class="copy-wrap-content-item-title">
        ${getRingHtml(item.enabled)}
        <div class="label">
          ${item.tag} <span class="turbo">${item.enableTurbo ? "⚡Turbo" : ""}</span>
        </div>
        <div class="actions">
          <button class="play">
           ${item.enabled ? stopSvg : playSvg}
          </button>
          <button class="edit">
            <svg width="14" height="13" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.76618 2.73582L9.45166 5.4213L3.1855 11.6875H0.5V9.00201L6.76618 2.73582ZM13.5 10.0625V11.6875H5.375L7 10.0625H13.5ZM9.89923 0.497894L11.6896 2.28824C11.9368 2.53543 11.9368 2.93621 11.6896 3.1834L10.3468 4.52616L7.66134 1.84065L9.00408 0.497894C9.25132 0.250702 9.65206 0.250702 9.89923 0.497894Z" fill="currentColor"/>
            </svg>
          </button>
          <button class="delete">
            <svg width="14" height="13" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.36865 0.5C8.65219 0.5 8.91278 0.655833 9.04698 0.90566L9.75206 2.21836L12.73 2.21901C13.1249 2.21901 13.4503 2.51625 13.4948 2.89919L13.5 2.98898C13.5 3.41422 13.1553 3.75895 12.73 3.75895L12.0661 3.75788L12.0675 12.73C12.0675 13.1249 11.7703 13.4503 11.3873 13.4948L11.2975 13.5H2.70248C2.27724 13.5 1.93251 13.1553 1.93251 12.73L1.93236 3.75788L1.26997 3.75895C0.875103 3.75895 0.549658 3.46171 0.50518 3.07878L0.5 2.98898C0.5 2.56374 0.844728 2.21901 1.26993 2.21901L4.25109 2.21836L4.97511 0.899859C5.09525 0.680682 5.31311 0.535215 5.55753 0.505595L5.65029 0.5H8.36865ZM10.5273 3.75867H3.47188V11.9597H10.5273V3.75867ZM5.85399 5.08402C6.27924 5.08402 6.62397 5.42875 6.62397 5.85399V9.57851C6.62397 10.0038 6.27924 10.3485 5.85399 10.3485C5.42875 10.3485 5.08402 10.0038 5.08402 9.57851V5.85399C5.08402 5.42875 5.42875 5.08402 5.85399 5.08402ZM8.14601 5.08402C8.57125 5.08402 8.91598 5.42875 8.91598 5.85399V9.57851C8.91598 10.0038 8.57125 10.3485 8.14601 10.3485C7.72076 10.3485 7.37603 10.0038 7.37603 9.57851V5.85399C7.37603 5.42875 7.72076 5.08402 8.14601 5.08402ZM7.90764 2.03952H6.10576L6.00727 2.21836H8.00376L7.90764 2.03952Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="copy-wrap-content-item-info">
        <div class="copy-wrap-content-item-info-label">
          <span>Target Wallet: </span>
          <span class="target">
            ${formatAddress(item.target)}
            ${copySvg}
          </span>
        </div>
      </div>
    </div>
  `;

  // Add click handler for copying target address
  const target = copyItem.querySelector(".target");
  const play = copyItem.querySelector(".play");
  const editIcon = copyItem.querySelector(".edit");
  const deleteIcon = copyItem.querySelector(".delete");

  target.addEventListener("click", () => {
    navigator.clipboard.writeText(item.target);
    target.innerHTML = `${formatAddress(item.target)} ${copySuccessSvg}`;
    showToast("Copied to clipboard");
    setTimeout(() => {
      target.innerHTML = `${formatAddress(item.target)} ${copySvg}`;
    }, 1000);
  });

  play.addEventListener("click", async () => {
    item.enabled = !item.enabled
    play.innerHTML = item.enabled ? stopSvg : playSvg
    const title = copyItem.querySelector(".copy-wrap-content-item-title")
    title.firstElementChild.innerHTML = getRingHtml(item.enabled)
    await switchCopyTrading({
      id: item.id,
      enabled: item.enabled
    })
    await loadCopyTrading();
  });

  editIcon.addEventListener("click", () => {
    smoothRedirect(`/src/public/copy/add.html?id=${item.id}`)
  });

  deleteIcon.addEventListener("click", async (e) => {
    e.stopPropagation();
    const confirmed = confirm(
      `Do you really want to delete copy: "${item.tag}"?`
    );
    if (!confirmed) return;
    await deleteCopy(item)
  });

  return copyItem;
};

// Load and render copy trading list
const loadCopyTrading = async () => {
  const response = await getCopyTradingList();
  const copyList = document.querySelector(".copy-wrap-content");
  const total = document.querySelector(".copy-wrap-total");
  copyList.innerHTML = "";
  total.innerHTML = "";
  if (!response) return;

  const enabledLength = response.list.filter(item => item.enabled).length;
  total.innerHTML = `<span class="${enabledLength > 0 ? "active" : ""}">${enabledLength}</span>/<span>${response.list.length}</span>`;

  response.list.forEach(item => {
    const copyItem = createCopyItem(item);
    copyList.appendChild(copyItem);
  });
  stopBtn.style.display = "flex";
  if (response.list.length > 0 && enabledLength === 0) {
    stopBtn.classList.add("active");
    stopBtn.innerHTML = `<img src="/src/public/assets/images/play.png" alt="">Resume All`;
  } else {
    stopBtn.classList.remove("active");
    stopBtn.innerHTML = `<img src="/src/public/assets/images/stop.png" alt="">Stop All`;
  }
  stopBtn.disabled = response.list.length === 0;
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  loadCopyTrading();
  stopBtn.addEventListener("click", async () => {
    stopBtn.classList.add("loading");
    if (stopBtn.classList.contains("active")) {
      await enableAllCopyTrading();
    } else {
      await disableAllCopyTrading();
    }
    await loadCopyTrading();
    stopBtn.classList.remove("loading");
  });
});
