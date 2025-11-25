function showToast(message, { isError = false, duration = 3000 } = {}) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.textContent = message
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

async function getStoredValue(key) {
  const value = await chrome.storage.local.get(key);
  return value[key];
}

function smoothRedirect(url) {
  const link = document.createElement("link");
  link.href = url;
  document.head.appendChild(link);

  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.2s ease";

  setTimeout(() => {
    window.location.href = url;
  }, 200);
}

