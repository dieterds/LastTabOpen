/* global chrome */
/* global chrome */

var url = "blank.html";
var bDebug = false;
function deb(message) { if (bDebug) console.log(message); }

function createTabInWindow(window) {
    deb('createTabInWindow');
    if (window.type === "normal") {
        chrome.tabs.create({ "windowId": window.id, "index": 0, "url": url, "active": false, "pinned": true }, function (tab) {
            deb('pin tab erstellt');
        });
    }
}

function isFirstTabOurs(window) {
    deb('isFirstTabOurs');
    var regex = "^chrome-extension\:\/\/.+blank\.html$";
    var regExpr = new RegExp(regex);

    if (typeof window.tabs != 'undefined' && window.tabs[0].url.search(regExpr) != -1) {
        return true;
    }
    return false;
}

function firstStart(windows) {
    deb('firststart');
    var index;
    for (index = 0; index < windows.length; ++index) {
        if (!isFirstTabOurs(windows[index])) createTabInWindow(windows[index]);

    }
}

function additionalCheck(windows) {
    deb('additionalCheck');
    var index;
    for (index = 0; index < windows.length; ++index) {
        if (!isFirstTabOurs(windows[index])) createTabInWindow(windows[index]);
        // Falls kein normales TAB mehr da ist, ein neues leeres erzeugen
        if (windows[index].type === "normal" && windows[index].tabs.length == 1) {
            chrome.tabs.create({ "windowId": windows[index].id, "index": 1, "active": true });
        }
    }
}

function tabRemoved(tabId, removeInfo) {
    deb('tabRemoved');
    if (removeInfo.isWindowClosing === false) chrome.windows.getAll({ populate: true }, additionalCheck);
}

function tabDetached(tabId, detachInfo) {
    deb('tabDetached');
    chrome.windows.getAll({ populate: true }, additionalCheck);
}

function tabActivated(activeInfo) {
    deb('tabActivated');
    if (typeof activeInfo.windowId != 'undefined') chrome.windows.get(activeInfo.windowId, { "populate": true },
        function (window) {
            if (window.tabs[0].active === true) {
                if (window.tabs.length >= 2) chrome.tabs.update(window.tabs[1].id, { active: true, highlighted: true, selected: true });
            }
        });
}


// add listeners

chrome.tabs.onRemoved.addListener(tabRemoved);
chrome.tabs.onDetached.addListener(tabDetached);
chrome.tabs.onActivated.addListener(tabActivated);
chrome.windows.onCreated.addListener(createTabInWindow);

// create windows when chrome or extension is started
chrome.windows.getAll({ populate: true }, firstStart);
deb('start'); 

// Aktuellen TAB active machen
chrome.windows.getCurrent({ populate: true, windowTypes: ["normal"] }, function (window) {
    chrome.tabs.update(window.tabs[1].id, { active: true });
    deb('tab2 active gemacht');
});