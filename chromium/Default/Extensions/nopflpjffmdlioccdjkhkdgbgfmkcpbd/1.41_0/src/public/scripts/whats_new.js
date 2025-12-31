document.addEventListener("DOMContentLoaded", async () => {
  const auth = await getStoredValue("tradewiz.token");
  if (!auth) {
    return
  }
  const header = document.querySelector(".header");
  header.style.display = "flex";
});
