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
    "hide-subscriptions": [
        ".ytd-guide-renderer:has(.ytd-guide-section-renderer):has(#guide-section-title):nth-child(2)",
    ],
    "hide-explore": [
        ".ytd-guide-renderer:has(.ytd-guide-section-renderer):has(#guide-section-title):nth-child(3)",
    ],
    "hide-more-from-youtube": [
        ".ytd-guide-renderer:has(.ytd-guide-section-renderer):has(#guide-section-title):nth-child(4)",
    ],
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

// Efficient setting application via CSS
function applySetting(settingArray) {
    const styleSheetId = "productive-web-styles";
    let styleSheet = document.getElementById(styleSheetId);
    if (!styleSheet) {
        styleSheet = document.createElement("style");
        styleSheet.id = styleSheetId;
        document.head.appendChild(styleSheet);
    }

    const enabledSettings = new Set(settingArray);
    let cssRules = "";

    for (const id in targetElements) {
        if (enabledSettings.has(id)) {
            cssRules += `${targetElements[id].join(", ")} { display: none !important; }\n`;
        }
    }

    styleSheet.textContent = cssRules;
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedApplySettings = debounce(() => {
    applySetting(cachedSettings);
}, 250);

// Load stored settings
chrome.storage.sync.get(["settings"], (data) => {
    if (data.settings?.youtube) {
        cachedSettings = data.settings.youtube;
        applySetting(cachedSettings);
    }
});

// React to settings updates
chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.youtube) {
        cachedSettings = changes.settings.newValue.youtube;
        applySetting(cachedSettings);
    }
});

// Handle messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.platform === "youtube") {
        cachedSettings = message.setting || [];
        applySetting(cachedSettings);
    }
});

// Simplified DOM mutation observer
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            debouncedApplySettings();
            break;
        }
    }
});

// Track page navigation changes
function detectPageChange() {
    let lastUrl = location.href;
    return function () {
        if (location.href !== lastUrl) {
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
}, 1500);

// Observer start
function startObserver() {
    applySetting(cachedSettings);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
} else {
    startObserver();
}
