const targetElements = {
    "hide-feed": [
        "[data-a-target='front-page-carousel']",
        "#front-page-main-content",
    ],
    "hide-browse": [".jDgJoG:nth-child(2)"],
    "hide-prime": [".top-nav__prime"],
    "hide-notifications": [".czRfnU:has(.onsite-notifications)"],
    "hide-whispers": [".czRfnU:has(.cafndC)"],
    "hide-bits": [".czRfnU:has(.ceSMVf)"],
    "hide-ad-free": [".czRfnU:nth-child(6)", ".turbo-sda-upsell-content"],
    "hide-stories": [".storiesLeftNavSection--csO9S"],
    "hide-followed-channels": [
        ".side-nav-section[aria-label='Followed Channels']",
    ],
    "hide-live-channels": [".side-nav-section[aria-label='Live Channels']"],
    "hide-also-watch": [".side-nav-section:nth-child(4)"],
    "hide-stream-info": ["#live-channel-stream-information"],
    "hide-about": [".about-section__panel"],
    "hide-panel": [".channel-panels"],
    "hide-chat": [
        ".community-highlight-stack__card--wide",
        ".iWWhvN",
        ".fxCDlb",
        ".DGdsv",
    ],
};

let cachedSettings = [];

// Apply user settings via CSS rules
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

// Load settings
chrome.storage.sync.get(["settings"], (data) => {
    if (data.settings?.twitch) {
        cachedSettings = data.settings.twitch;
        applySetting(cachedSettings);
    }
});

// React to storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.twitch) {
        cachedSettings = changes.settings.newValue.twitch;
        applySetting(cachedSettings);
    }
});

// React to runtime messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.platform === "twitch") {
        cachedSettings = message.setting || [];
        applySetting(cachedSettings);
    }
});

// Observe DOM changes
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            debouncedApplySettings();
            break;
        }
    }
});

// Detect page changes
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

// Start mutation observer
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
