/**
 * scroll loading utility for infinite scroll scenarios.
 * @param {Object} options
 * @param {HTMLElement} options.container - The container to listen for scroll events
 * @param {Function} options.loadFn - The function to call when loading more content, must be async
 * @param {number} options.threshold - How far from the bottom to trigger loading (default 100px)
 * @returns {Function} detach function to remove the listener
 */
function attachInfiniteScroll({ container, loadFn, threshold = 100, hasMore }) {
  if (container._scrollAttached) return;

  let isLoading = false;
  container._scrollAttached = true;

  async function onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - threshold && !isLoading && hasMore()) {
      isLoading = true;
      await loadFn();
      isLoading = false;
    }
  }

  container.addEventListener("scroll", onScroll);

  return function detach() {
    container.removeEventListener("scroll", onScroll);
    container._scrollAttached = false;
  }
}

function createLoader() {
  const loaderContainer = createStyledDiv({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 28, 0.9)',
    height: '42px',
    flex: '0 0 42px',
    width: '100%',
    color: '#FFFFFF',
  });
  loaderContainer.classList.add('tradewiz-loading-spinner');

  const spinner = createStyledDiv({
    width: '12px',
    height: '12px',
    animation: 'spin 1s linear infinite',
    backgroundImage: `url(${chrome.runtime.getURL('src/public/assets/images/loading.png')})`,
    backgroundSize: 'contain',
    marginRight: '4px'
  });

  const text = createStyledDiv({
    fontSize: '12px',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.40)'
  }, null, "Loading...")

  loaderContainer.appendChild(spinner);
  loaderContainer.appendChild(text);
  return loaderContainer;
}

function showLoader(parent) {
  const existing = parent.querySelector('.tradewiz-loading-spinner');
  if (!existing) {
    const loader = createLoader();
    parent.appendChild(loader);
  }
}

function hideLoader(parent) {
  const loader = parent.querySelector('.tradewiz-loading-spinner');
  if (loader) loader.remove();
}
