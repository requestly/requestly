type TabId = chrome.tabs.Tab["id"];

enum DataScope {
  TAB = "tabData", // tab-level data
  PAGE = "pageData", // page-level data, will wipe out when page unloads
}

type TabData = chrome.tabs.Tab & {
  [DataScope.TAB]?: Record<string, string>;
};

class TabService {
  static instance: TabService = null;

  map: Record<number, TabData> = {};

  constructor() {
    if (!TabService.instance) {
      TabService.instance = this;
      this.initTabs();
      this.addEventListeners();
    }

    return TabService.instance;
  }

  static getInstance() {
    if (!TabService.instance) {
      TabService.instance = new TabService();
    }

    return TabService.instance;
  }

  initTabs() {
    chrome.tabs.query({}, (tabs) => {
      this.map = {};
      tabs.forEach((tab) => this.addOrUpdateTab(tab));
    });
  }

  addOrUpdateTab(tab: chrome.tabs.Tab) {
    // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
    if (tab.id !== chrome.tabs.TAB_ID_NONE) {
      this.map[tab.id] = tab;
    }
  }

  createNewTab(url: string, openerTabId: TabId, callback: Function) {
    chrome.tabs.create({ url, openerTabId }, (tab) => {
      callback(tab);
    });
  }

  removeTab(tabId: TabId) {
    delete this.map[tabId];
  }

  addEventListeners() {
    chrome.tabs.onCreated.addListener((tab) => this.addOrUpdateTab(tab));

    chrome.tabs.onRemoved.addListener((tabId) => this.removeTab(tabId));

    chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
      this.removeTab(removedTabId);
      chrome.tabs.get(addedTabId, (tab) => this.addOrUpdateTab(tab));
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      const existingTab = this.getTab(tabId);

      if (!existingTab) {
        this.addOrUpdateTab(tab);
        return;
      }

      const newTabState = {
        ...tab,
        [DataScope.TAB]: existingTab[DataScope.TAB] || {},
      };

      this.addOrUpdateTab(newTabState);
    });

    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        if (details.type === "main_frame") {
          const tab = this.getTab(details.tabId) || { id: details.tabId };
          this.addOrUpdateTab({ ...tab, url: details.url });
        }
      },
      { urls: ["<all_urls>"] }
    );
  }

  getTabs() {
    return this.map;
  }

  getTab(tabId: TabId) {
    return this.getTabs()[tabId];
  }

  getTabUrl(tabId: TabId) {
    var tab = this.getTab(tabId);
    return tab && tab.url;
  }

  focusTab(tabId: TabId) {
    var tab = this.getTab(tabId);

    if (tab && tab.windowId) {
      try {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.highlight({ windowId: tab.windowId, tabs: tab.index });
        });
        return true;
      } catch (e) {
        return false;
      }
    }

    return false;
  }

  closeTab(tabId: TabId) {
    chrome.tabs.remove(tabId);
  }

  ensureTabLoadingComplete(tabId: TabId) {
    return new Promise<void>((resolve, reject) => {
      const tab = this.getTab(tabId);

      if (tab) {
        if (tab.status === "complete") {
          resolve();
        } else {
          const handler = (currentTabId: TabId, tabChangeInfo: chrome.tabs.TabChangeInfo) => {
            if (currentTabId === tabId && tabChangeInfo.status === "complete") {
              chrome.tabs.onUpdated.removeListener(handler);
              resolve();
            }
          };
          chrome.tabs.onUpdated.addListener(handler);
        }
      } else {
        reject();
      }
    });
  }

  // setDataForScope(scope: DataScope, tabId: TabId, key: any, value: any) {
  //   const tab = this.getTab(tabId);

  //   if (!tab) {
  //     return;
  //   }

  //   // null safe for firefox as in firefox get/set happen before tab updation whereas
  //   // in chrome get/set happens after tab updation
  //   if (tab[scope]) {
  //     tab[scope][key] = value;
  //   } else {
  //     tab[scope] = { [key]: value };
  //   }
  // }

  // getDataForScope(scope: DataScope, tabId: TabId, key: any, defaultValue: any) {
  //   const tab = this.getTab(tabId);

  //   if (!tab) {
  //     return;
  //   }

  //   return tab[scope]?.[key] || defaultValue;
  // }

  // removeDataForScope(scope: DataScope, tabId: TabId, key: any) {
  //   const tab = this.getTab(tabId);

  //   if (!tab || !tab[scope]) {
  //     return;
  //   }

  //   delete tab[scope][key];
  // }

  setData(tabId: TabId, key: any, value: any) {
    const tab = this.getTab(tabId);

    if (!tab) {
      return;
    }
    // null safe for firefox as in firefox get/set happen before tab updation whereas
    // in chrome get/set happens after tab updation
    if (tab[DataScope.TAB]) {
      tab[DataScope.TAB][key] = value;
    } else {
      tab[DataScope.TAB] = { [key]: value };
    }
  }

  getData(tabId: TabId, key: any, defaultValue: any) {
    const tab = this.getTab(tabId);

    if (!tab) {
      return;
    }

    return tab[DataScope.TAB]?.[key] || defaultValue;
  }

  removeData(tabId: TabId, key: any) {
    const tab = this.getTab(tabId);

    if (!tab || !tab[DataScope.TAB]) {
      return;
    }

    delete tab[DataScope.TAB][key];
  }
}
const tabService = TabService.getInstance();

export { tabService };
