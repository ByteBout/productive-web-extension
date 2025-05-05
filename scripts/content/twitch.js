const targetElements = {
    "hide-feed": ["[data-a-target='front-page-carousel']", "#front-page-main-content"],
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
    if (data.settings && data.settings.twitch) {
        cachedSettings = data.settings.twitch || [];
    }
});

chrome.storage.onChanged.addListener((changes) => {
    if (
        changes.settings &&
        changes.settings.newValue &&
        changes.settings.newValue.twitch
    ) {
        cachedSettings = changes.settings.newValue.twitch || [];
        applySetting(cachedSettings);
    }
});

chrome.runtime.onMessage.addListener((message) => {
    try {
        if (message.platform === "twitch") {
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
