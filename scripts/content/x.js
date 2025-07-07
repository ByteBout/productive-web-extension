const targetElements = {
    "hide-feed": [
        "div:has(> button[aria-label='New posts are available. Push the period key to go to the them.'])",
        "div[aria-label='Timeline: Your Home Timeline']",
    ],
    "hide-happening": ["div:has(> section > div[aria-label*='Timeline:'][aria-label*='Trending now'])"],
    "hide-who-follow": ["div:has(> div > [aria-label='Who to follow'])"],
    "hide-premium": [
        "[aria-label='Premium']",
        "[aria-label='Verified Orgs']",
        "[data-testid='super-upsell-UpsellButtonRenderProperties']",
        ".inlinePrompt",
    ],
    "hide-grok": [
        "[aria-label='Grok']",
        "div:has(> div[data-testid='GrokDrawerHeader'])",
        "[aria-label='Profile Summary']"
    ],
    "hide-explore": ["a[data-testid='AppTabBar_Explore_Link']"],
    "hide-notif": ["a[data-testid='AppTabBar_Notifications_Link']"],
    "hide-messages": ["a[data-testid='AppTabBar_DirectMessage_Link']"],
    "hide-communities": ["a[aria-label='Communities']"],
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
    if (data.settings?.x) {
        cachedSettings = data.settings.x;
        applySetting(cachedSettings);
    }
});

// React to storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.x) {
        cachedSettings = changes.settings.newValue.x;
        applySetting(cachedSettings);
    }
});

// React to runtime messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.platform === "x") {
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
