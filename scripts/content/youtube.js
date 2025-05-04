const targetElements = {
    "hide-feed": ["[page-subtype='home']"],
    "hide-shorts": [
        ".ytd-rich-shelf-renderer",
        ".ytd-shorts",
        "a[title='Shorts']",
        "ytd-reel-shelf-renderer",
        "[tab-title='Shorts']",
        "ytd-video-renderer:has(.ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS'])",
        "ytd-video-renderer:has(.ytd-thumbnail-overlay-time-status-renderer.style-scope.ytd-thumbnail-overlay-time-status-renderer[aria-label='Shorts'])",
        ".ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS']",
        ".ytd-thumbnail:has(.ytd-thumbnail-overlay-time-status-renderer[overlay-style='SHORTS'])",
        "ytd-video-renderer:has(.badge-style-type-shorts)",
        ".badge-style-type-shorts",
        "[is-shorts-grid]",
    ],
    "hide-ads": [
        ".ytd-ad-slot-renderer",
        ".ytd-page-top-ad-layout-renderer",
        "[target-id='engagement-panel-ads']",
        ".ytd-companion-slot-renderer",
    ],
    "hide-notification": ["ytd-notification-topbar-button-renderer"],
    "hide-subscriptions": [".ytd-guide-renderer:nth-child(2)"],
    "hide-explore": [".ytd-guide-renderer:nth-child(3)"],
    "hide-more-from-youtube": [".ytd-guide-renderer:nth-child(4)"],
    "hide-video-title": ["#title"],
    "hide-channel-info": ["#owner"],
    "hide-action-buttons": ["#actions"],
    "hide-description": ["#description"],
    "hide-shop": [
        ".ytd-merch-shelf-renderer",
        ".ytd-product-item-renderer",
        ".ytd-shopping-companion-ad-renderer",
    ],
    "hide-comments": [".ytd-comments"],
    "hide-recommends": [".ytd-watch-next-secondary-results-renderer"],
    "hide-live-chat": ["#chat-container"],
    "hide-playlist": ["#playlist"],
    "hide-fundraise": ["#donation-shelf"],
};

let cachedSettings = [];

function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

chrome.storage.sync.get(["settings"], (data) => {
    if (data.settings && data.settings.youtube) {
        cachedSettings = data.settings.youtube || [];
    }
});

chrome.storage.onChanged.addListener((changes) => {
    if (
        changes.settings &&
        changes.settings.newValue &&
        changes.settings.newValue.youtube
    ) {
        cachedSettings = changes.settings.newValue.youtube || [];
        applySetting(cachedSettings);
    }
});

chrome.runtime.onMessage.addListener((message) => {
    try {
        if (message.platform === "youtube") {
            const setting = message.setting || [];
            cachedSettings = setting;
            if (setting) applySetting(setting);
        }
    } catch (error) {
        console.error(error);
    }
});

function applySetting(setting) {
    let styleSheet = document.getElementById("productive-web-styles");
    if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = "productive-web-styles";
        document.head.appendChild(styleSheet);
    }

    let cssRules = "";

    for (const id in targetElements) {
        const selectors = targetElements[id];
        if (setting.includes(id)) {
            cssRules +=
                selectors.join(", ") + " { display: none !important; }\n";
        }
    }

    styleSheet.textContent = cssRules;
}

// Optimized mutation observer
const debouncedApplySettings = debounce(() => {
    applySetting(cachedSettings);
}, 250);

const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (let mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            for (const id in targetElements) {
                const selectors = targetElements[id];
                for (const selector of selectors) {
                    if (
                        selector.includes(
                            mutation.target.tagName?.toLowerCase(),
                        ) ||
                        (mutation.target.classList &&
                            selector.includes(
                                Array.from(mutation.target.classList).join(""),
                            ))
                    ) {
                        shouldUpdate = true;
                        break;
                    }
                }
                if (shouldUpdate) break;
            }
        }
        if (shouldUpdate) break;
    }

    if (shouldUpdate) {
        debouncedApplySettings();
    }
});

function detectPageChange() {
    let lastUrl = location.href;
    return function () {
        if (lastUrl !== location.href) {
            lastUrl = location.href;
            return true;
        }
        return false;
    };
}

const isPageChanged = detectPageChange();

setInterval(() => {
    if (isPageChanged()) {
        debouncedApplySettings();
    }
}, 500);

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
} else {
    startObserver();
}

function startObserver() {
    applySetting(cachedSettings);

    observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: false,
    });
}
