const targetElements = {
    "hide-feed": [
        ".scaffold-finite-scroll:has(.scaffold-finite-scroll__content[data-finite-scroll-hotkey-context='FEED'])",
        ".feed-new-update-pill__new-update-button",
        ".artdeco-dropdown__trigger:has([aria-label='Sort order dropdown button'])",
    ],
    "hide-premium": [
        ".artdeco-card:has(.feed-identity-module__anchored-widget--premium-upsell)",
        ".premium-upsell-link",
        "[data-view-name='premium-nav-upsell-text']",
        ".ad-banner",
        ".ad-banner-container",
        ".artdeco-card:has(.ad-banner-container)",
        "[componentkey='MynetworkDesktopNav_mynetwork_desktop_nav_ad']",
        "li:has(.jobs-home-upsell-card__container)",
        ".pv-profile-card:has(#premium_browsemap_recommendation)",
        ".artdeco-card:has(.member-analytics-addon-card-list__upsell-card-container)",
        ".jobs-home-scalable-nav__nav-item:has(.jobshome_nav_insights_hub)",
    ],
    "hide-news": ["[data-view-name='news-module']"],
    "hide-messaging": [
        ".msg-overlay-list-bubble--is-minimized",
        "[data-view-name='messaging-overlay-maximize-connection-list-bar']",
        ".msg-overlay-list-bubble",
    ],
    "hide-nav-messaging": [
        ".global-nav__primary-item:has(a[href='https://www.linkedin.com/messaging/?'])",
        "[data-view-name='navigation-messaging']",
    ],
    "hide-nav-notifications": [
        ".global-nav__primary-item:has(a[href='https://www.linkedin.com/notifications/?'])",
        "[data-view-name='navigation-notifications']",
        ".global-nav__primary-item:has(a[href='https://www.linkedin.com/notifications/?filter=all&refresh=true'])",
    ],
    "hide-suggest": [".pv-profile-card:has(#guidance)"],
    "hide-followed-analytics": [".pv-profile-card:has(#insights)"],
    "hide-live-also-view": [".pv-profile-card:has(#browsemap_recommendation)"],
    "hide-may-know": [
        ".pv-profile-card:has(#pymk_recommendation)",
        ".pv-profile-card:has(#pymk_recommendation_from_industry)",
        ".pv-profile-card:has(#pymk_recommendation_from_school)",
        ".pv-profile-card:has(#pymk_recommendation_from_title)",
    ],
    "hide-might-like": [
        ".pv-profile-card:has(#group_recommendation)",
        ".pv-profile-card:has(#company_recommendation)",
        ".pv-profile-card:has(#newsletter_recommendation)",
        ".pv-profile-card:has(#learning_recommendation)",
    ],
    "hide-add-feed": [".feed-follows-module"],
    "hide-puzzle": [
        ".artdeco-card:has(.games-entrypoints-module__subheader)",
        ".e20f3f3c:has(a[href='https://www.linkedin.com/games/zip/'])",
    ],
};

let cachedSettings = [];

// Apply user settings as CSS rules
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
    if (data.settings?.linkedin) {
        cachedSettings = data.settings.linkedin;
        applySetting(cachedSettings);
    }
});

// Watch for settings changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue?.linkedin) {
        cachedSettings = changes.settings.newValue.linkedin;
        applySetting(cachedSettings);
    }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.platform === "linkedin") {
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

// Detect page URL changes
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

// Start everything
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
