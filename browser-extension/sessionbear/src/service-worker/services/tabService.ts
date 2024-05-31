import { EXTENSION_MESSAGES } from "../../constants";

type TabId = chrome.tabs.Tab["id"];

export enum DataScope {
  TAB = "tabData", // tab-level data
  PAGE = "pageData", // page-level data, will wipe out when page unloads
}

type TabData = chrome.tabs.Tab & {
  [DataScope.TAB]?: Record<string, any>;
  [DataScope.PAGE]?: Record<string, any>;
};

class TabService {
  private map: Record<number, TabData> = {};

  constructor() {
    this.initTabs();
    this.addEventListeners();
  }

  private initTabs() {
    chrome.tabs.query({}, (tabs) => {
      this.map = {};
      tabs.forEach((tab) => this.addOrUpdateTab(tab));
    });
  }

  private addEventListeners() {
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
        [DataScope.PAGE]: existingTab[DataScope.PAGE] || {},
      };

      this.addOrUpdateTab(newTabState);
    });

    // Why?
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        if (details.type === "main_frame") {
          const tab = this.getTab(details.tabId) || ({ id: details.tabId } as TabData);
          this.addOrUpdateTab({ ...tab, url: details.url });
        }
      },
      { urls: ["<all_urls>"] }
    );

    chrome.webNavigation.onCommitted.addListener((navigatedTabData) => {
      if (navigatedTabData.frameId === 0) {
        this.resetPageData(navigatedTabData.tabId);
      }
    });

    chrome.webNavigation.onDOMContentLoaded.addListener((navigatedTabData) => {
      if (navigatedTabData.frameId === 0) {
        const tab = this.getTab(navigatedTabData.tabId);

        if (tab) {
          this.sendMessage(navigatedTabData.tabId, { action: EXTENSION_MESSAGES.CLIENT_PAGE_LOADED });
        }
      }
    });
  }

  private sendMessage(tabId: TabId, ...args: [any, any?, ((response: any) => void)?]) {
    chrome.tabs.sendMessage(tabId, ...args);
  }

  addOrUpdateTab(tab: TabData) {
    // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
    if (tab.id !== chrome.tabs.TAB_ID_NONE) {
      this.map[tab.id] = { ...this.map[tab.id], ...tab };
    }
  }

  createNewTab(url: string, openerTabId: TabId, callback: Function) {
    chrome.tabs.create({ url, openerTabId }, (tab) => {
      callback(tab);
    });
  }

  removeTab(tabId: TabId) {
    const sessionRulesMap = this.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP) as Record<
      string,
      Record<string, number>
    >;
    let ruleIdsToDelete: number[] = [];

    if (sessionRulesMap) {
      for (const sessionRuleType of Object.values(sessionRulesMap)) {
        ruleIdsToDelete.push(...Object.values(sessionRuleType));
      }
      chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: ruleIdsToDelete });
    }

    delete this.map[tabId];
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

  ensureTabLoadingComplete(tabId: TabId): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const tab = await chrome.tabs.get(tabId);

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

  setDataForScope(scope: DataScope, tabId: TabId, key: string, value: any) {
    const tab = this.getTab(tabId);

    if (!tab) {
      this.addOrUpdateTab({ id: tabId, [DataScope.TAB]: { [key]: value } } as TabData);
      return;
    }

    // null safe for firefox as in firefox get/set happen before tab updation whereas
    // in chrome get/set happens after tab updation
    if (tab[scope]) {
      tab[scope][key] = value;
    } else {
      tab[scope] = { [key]: value };
    }
  }

  getDataForScope(scope: DataScope, tabId: TabId, key: string, defaultValue: any) {
    const tab = this.getTab(tabId);

    if (!tab) {
      return;
    }

    return tab[scope]?.[key] || defaultValue;
  }

  removeDataForScope(scope: DataScope, tabId: TabId, key: string) {
    const tab = this.getTab(tabId);

    if (!tab || !tab[scope]) {
      return;
    }

    delete tab[scope][key];
  }

  setData(tabId: TabId, key: any, value: any) {
    this.setDataForScope(DataScope.TAB, tabId, key, value);
  }

  getData(tabId: TabId, key: any, defaultValue?: any) {
    return this.getDataForScope(DataScope.TAB, tabId, key, defaultValue);
  }

  removeData(tabId: TabId, key: any) {
    this.removeDataForScope(DataScope.TAB, tabId, key);
  }

  setPageData(tabId: TabId, key: any, value: any) {
    this.setDataForScope(DataScope.PAGE, tabId, key, value);
  }

  getPageData(tabId: TabId, key: any, defaultValue?: any) {
    return this.getDataForScope(DataScope.PAGE, tabId, key, defaultValue);
  }

  removePageData(tabId: TabId, key: any) {
    this.removeDataForScope(DataScope.PAGE, tabId, key);
  }

  resetPageData(tabId: TabId) {
    const tab = this.getTab(tabId);

    if (tab?.[DataScope.PAGE]) {
      tab[DataScope.PAGE] = {};
    }
  }

  // DO we really need this
  // promisifiedSetIcon(tabId, path) {
  //   return new Promise((resolve) => {
  //     chrome.browserAction.setIcon({ tabId, path }, resolve);
  //   });
  // }

  // // do not pass tabId to set icon globally
  // setExtensionIcon(path, tabId) {
  //   if (typeof tabId === "undefined") {
  //     chrome.browserAction.setIcon({ path });
  //     return;
  //   }

  //   // on invoking setIcon multiple times simultaneously in a tab may lead to inconsistency without synchronization
  //   let setIconSynchronizer = this.getPageData(tabId, "setIconSynchronizer");
  //   if (!setIconSynchronizer) {
  //     setIconSynchronizer = Promise.resolve();
  //   }

  //   this.setPageData(
  //     tabId,
  //     "setIconSynchronizer",
  //     setIconSynchronizer.then(() => this.promisifiedSetIcon(tabId, path))
  //   );
}

export const tabService = new TabService();

// TODO: Add this only when debug enabled
// @ts-ignore
self.tabService = tabService;

export const TAB_SERVICE_DATA = {
  SESSION_RECORDING: "sessionRecording",
  SESSION_RULES_MAP: "sessionRulesMap",
  TEST_RULE_DATA: "testRuleData",
  APPLIED_RULE_DETAILS: "appliedRuleDetails",
  RULES_EXECUTION_LOGS: "rulesExecutionLogs",
};
