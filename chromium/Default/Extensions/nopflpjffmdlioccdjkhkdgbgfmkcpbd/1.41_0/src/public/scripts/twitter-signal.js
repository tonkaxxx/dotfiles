const signalTab = document.querySelectorAll(".signal-tab");
const signalContent = document.querySelectorAll(".signal-content");
const signalSearchInput = document.querySelector(".signal-search-input");
let signalTabActive = 0;
const loadFloowKolList = async (search) => {
  let next = ""
  let isLastPage = false;
  attachInfiniteScroll({
    container: signalContent[0],
    loadFn: loadMoreData,
    hasMore: () => !isLastPage
  });
  loadMoreData(true);

  async function loadMoreData(isFirst = false) {
    showLoader(signalContent[0]);
    if (isFirst) {
      signalContent[0].innerHTML = "";
    }
    const response = await kolList({ next, is_follow: true, search });
    if (!response) {
      hideLoader(signalContent[0]);
      return;
    }
    signalTab[0].textContent = `Customed Feed ${response.total}`;
    hideLoader(signalContent[0]);
    next = response.next;
    response.kols.forEach((kol) => {
      const signalItem = createSignalItem(kol);
      signalContent[0].appendChild(signalItem);
    });
    if (!next) {
      isLastPage = true;
    }
  }
}
const loadUnfloowKolList = async (search) => {
  let next = ""
  let isLastPage = false;
  attachInfiniteScroll({
    container: signalContent[1],
    loadFn: loadMoreData,
    hasMore: () => !isLastPage
  });
  loadMoreData(true);

  async function loadMoreData(isFirst = false) {
    showLoader(signalContent[1]);
    if (isFirst) {
      signalContent[1].innerHTML = "";
    }
    const response = await kolList({ next, is_follow: false, search });
    if (!response) {
      hideLoader(signalContent[1]);
      return;
    }
    signalTab[1].textContent = `All Feed ${response.total}`;
    hideLoader(signalContent[1]);
    next = response.next;
    response.kols.forEach((kol) => {
      const signalItem = createSignalItem(kol);
      signalContent[1].appendChild(signalItem);
    });
    if (!next) {
      isLastPage = true;
      return false;
    }
  }
}
const floowSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9.00049 0.000488281C13.9708 0.000688882 18.0005 4.03016 18.0005 9.00049C18.0003 13.9706 13.9706 18.0003 9.00049 18.0005C4.03016 18.0005 0.000688886 13.9708 0.000488281 9.00049C0.000488281 4.03003 4.03003 0.000488281 9.00049 0.000488281ZM9.00049 1.63721C4.93375 1.63721 1.63721 4.93375 1.63721 9.00049C1.63741 13.0671 4.93388 16.3638 9.00049 16.3638C13.0669 16.3636 16.3636 13.0669 16.3638 9.00049C16.3638 4.93388 13.0671 1.63741 9.00049 1.63721ZM8.99951 4.90869C9.45124 4.90869 9.81766 5.27537 9.81787 5.72705V8.18213H12.272L12.356 8.18701C12.7685 8.22891 13.0903 8.57687 13.0903 9.00049C13.0901 9.42392 12.7684 9.77208 12.356 9.81396L12.272 9.81885H9.81787V12.272C9.81787 12.7238 9.45137 13.0903 8.99951 13.0903C8.54788 13.0901 8.18115 12.7237 8.18115 12.272V9.81885H5.72705C5.27539 9.81878 4.90892 9.45211 4.90869 9.00049C4.90869 8.54867 5.27525 8.18219 5.72705 8.18213H8.18115V5.72705C8.18137 5.27554 8.54801 4.90895 8.99951 4.90869Z"
            fill="currentColor" />
        </svg>`;
const unfloowSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.00098 0.0913086C13.9211 0.091486 17.9102 4.08035 17.9102 9.00049C17.9099 13.9204 13.9209 17.9095 9.00098 17.9097C4.08086 17.9097 0.0920073 13.9206 0.0917969 9.00049C0.0917969 4.08024 4.08073 0.0913086 9.00098 0.0913086ZM9.00098 1.54639C4.88403 1.54639 1.54688 4.88355 1.54688 9.00049C1.54709 13.1173 4.88416 16.4546 9.00098 16.4546C13.1176 16.4544 16.4549 13.1171 16.4551 9.00049C16.4551 4.88366 13.1178 1.54656 9.00098 1.54639ZM12.4189 8.2876C12.7506 8.35521 13 8.64885 13 9.00049C12.9998 9.35193 12.7505 9.6458 12.4189 9.71338L12.2725 9.72803H5.72754C5.32624 9.72778 5.00024 9.40179 5 9.00049C5 8.59899 5.3261 8.2732 5.72754 8.27295H12.2725L12.4189 8.2876Z" fill="currentColor"/>
</svg>
`
const createSignalItem = (kol) => {
  const item = document.createElement("div");
  item.className = "signal-item";
  item.setAttribute("data-floow", kol.is_follow);
  item.innerHTML = `
    <img
      src="${kol.avatar}"
      alt="">
    <div class="signal-item-name">${kol.name}</div>
    <div class="signal-item-handle">
      <a data-tip="<img style='width:12px;height:12px;margin:0 4px;vertical-align:middle' src=${chrome.runtime.getURL("/src/public/assets/images/twitter.png")} /> https://twitter.com/${kol.screen_name}" href=https://twitter.com/${kol.screen_name} target="_blank">@${kol.screen_name}</a>
      <div class="signal-item-handle-info">
      ${kol.position ? `<div class="signal-item-handle-info-item">${kol.position}</div>` : ""}
      </div>
    </div>
    <div class="signal-item-content">
      ${kol.is_follow ? unfloowSvg : floowSvg}
    </div>
  `;
  const signalItemContent = item.querySelector(".signal-item-content");
  signalItemContent.addEventListener("click", async () => {
    kol.is_follow = !kol.is_follow;
    signalItemContent.innerHTML = kol.is_follow ? unfloowSvg : floowSvg;
    if (kol.is_follow) {
      await kolFollow({
        kol_id: kol.screen_name
      })
    } else {
      item.remove()
      await kolUnfollow({
        kol_id: kol.screen_name
      })
    }
  });

  return item;
}

document.addEventListener("DOMContentLoaded", async () => {
  signalTab.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      signalTab.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      signalSearchInput.value = "";
      signalContent.forEach((content) => {
        content.style.display = "none";
      });
      signalTabActive = index;
      signalContent[index].style.display = "block";
      if (index === 0) {
        loadFloowKolList();
      } else {
        loadUnfloowKolList();
      }
    });
  });
  let searchTimeout;
  signalSearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.trim();
      if (signalTabActive === 0) {
        loadFloowKolList(searchTerm);
      } else {
        loadUnfloowKolList(searchTerm);
      }
    }, 300);
  });
  await loadFloowKolList();
  await loadUnfloowKolList();
});