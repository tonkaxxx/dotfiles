let paginationState = {
    next: '',
    isLoading: false
};

const loadWallets = async (loadMore = false) => {
    const container = document.querySelector("#list-content");
    if (!loadMore) {
        container.innerHTML = "";
        paginationState = {
            next: '',
            isLoading: false
        };
    }
    if (paginationState.isLoading || paginationState.next === 'nomore') return;
    paginationState.isLoading = true;
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.textContent = 'Loading...';
    container.appendChild(loader);
    const res = await getWalletList({ size: 100, next: paginationState.next })
    paginationState.isLoading = false;
    container.removeChild(loader);
    if (!res?.data) {
        return;
    }
    paginationState.next = res.next || 'nomore';
    for (let i = 0; i < res.data.length; i++) {
        const current = res.data[i]
        const listItem = document.createElement('div')
        listItem.className = 'list-item'
        listItem.innerHTML = `<div class="wallet-address" >${current.wallet}</div>
              <div class="note">${current.alias}</div>
              <div data-id="${current.id}" class="delete-wallet-btn">
                <img src="/src/public/assets/images/del.png" alt="" >
              </div>`
        container.appendChild(listItem)
    }
    document.querySelectorAll(".delete-wallet-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const dataId = Number(btn.dataset.id);
            deleteWalletItem(dataId);
        });
    });
}

const deleteWalletItem = async (id) => {
    const res = await deleteWallet({ id })
    if (res) {
        showToast("Delete success!")
        await loadWallets()
    }
}
const addWalletItems = async () => {
    function parseTextareaValue(textareaId) {
        const textarea = document.getElementById(textareaId);
        const raw = textarea.value;

        const result = [];
        const items = raw.split('\n').map(item => item.trim()).filter(Boolean);

        for (const item of items) {
            const index = item.indexOf(',');
            if (index === -1) {
                showToast("Format error", { isError: true });
                return null;
            }

            const address = item.slice(0, index).trim();
            const note = item.slice(index + 1).trim();

            if (!address || !note) {
                showToast("Format error", { isError: true });
                return null;
            }

            result.push(`${address},${note}`);
        }

        if (!result.length) {
            return showToast("Format error", { isError: true });
        }

        return result;
    }


    const wallets = parseTextareaValue('add-container');

    if (wallets && wallets.length) {
        if (wallets.length > 500) {
            return showToast("Wallet limit reached. You can import up to 500 wallets only", { isError: true });
        }
        const res = await addWallets({ wallets })
        if (res.failed.length) {
            const failedList = res.failed.join('\n')
            showToast(`Failed count ${res.failed.length}\nfailed wallets \n${failedList}`, { isError: true, duration: 5000 })
        } else {
            showToast("Import success!")
        }
        if (res) {
            const res2 = await getWalletList({})
            if (!res2) return
            chrome.storage.local.set({ "tradewiz.wallets": res2.data });

        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const addContainer = document.querySelector('.add-container')
    const listContent = document.querySelector("#list-content");

    if (!addContainer) {
        await loadWallets()
        listContent.addEventListener('scroll', () => {
            if (listContent.scrollTop + listContent.clientHeight >= listContent.scrollHeight - 50) {
                loadWallets(true);
            }
        });
    } else {
        addContainer.value = ""
        const importBtn = document.querySelector("#import-wallets")
        importBtn.addEventListener('click', () => {
            addWalletItems()
        })
    }
});
