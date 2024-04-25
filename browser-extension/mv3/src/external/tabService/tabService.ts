import { EXTENSION_MESSAGES } from "common/constants";

type TabId = chrome.tabs.Tab["id"];

enum DataScope {
  TAB = "tabData", // tab-level data
  // PAGE = "pageData", // page-level data, will wipe out when page unloads
}

type TabData = chrome.tabs.Tab & {
  [DataScope.TAB]?: Record<string, any>;
  documentLifecycle?: chrome.webNavigation.WebNavigationTransitionCallbackDetails["documentLifecycle"];
  frameId?: chrome.webNavigation.WebNavigationTransitionCallbackDetails["frameId"];
};

class TabService {
  static instance: TabService = null;

  static getInstance() {
    if (!TabService.instance) {
      TabService.instance = new TabService();
    }

    return TabService.instance;
  }

  private map: Record<number, TabData> = {};

  constructor() {
    if (!TabService.instance) {
      TabService.instance = this;
      this.initTabs();
      this.addEventListeners();
    }

    return TabService.instance;
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
        documentLifecycle: existingTab.documentLifecycle,
        frameId: existingTab.frameId,
      };

      this.addOrUpdateTab(newTabState);

      if (tab.status === "complete" && existingTab.documentLifecycle === "active" && existingTab.frameId === 0) {
        this.sendMessage(tabId, { action: EXTENSION_MESSAGES.CLIENT_PAGE_LOADED }, () => {
          existingTab[DataScope.TAB].messageQueue?.forEach((sendMessage: Function) => {
            sendMessage();
          });
          this.clearMessageQueue(tabId);
        });
      }
    });

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
      const tab = this.getTab(navigatedTabData.tabId);

      if (tab) {
        this.addOrUpdateTab({
          ...tab,
          documentLifecycle:
            tab.documentLifecycle !== "active" ? navigatedTabData.documentLifecycle : tab.documentLifecycle,
          frameId: tab.frameId !== 0 ? navigatedTabData.frameId : tab.frameId,
        });
      }
    });
  }

  private sendMessage(tabId: TabId, ...args: [any, any?, ((response: any) => void)?]) {
    chrome.tabs.sendMessage(tabId, ...args);
  }

  private pushToQueue(tabId: TabId, message: any) {
    const tab = this.getTab(tabId);

    if (!tab) {
      return;
    }

    if (!tab[DataScope.TAB].messageQueue) {
      tab[DataScope.TAB].messageQueue = [];
    }

    tab[DataScope.TAB].messageQueue.push(message);
  }

  private clearMessageQueue(tabId: TabId) {
    const tab = this.getTab(tabId);
    if (tab && tab[DataScope.TAB] && tab[DataScope.TAB].messageQueue) {
      tab[DataScope.TAB].messageQueue = [];
    }
  }

  addOrUpdateTab(tab: TabData) {
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

  sendMessageToTab(tabId: TabId, ...args: [any, any?, ((response: any) => void)?]) {
    const tab = this.getTab(tabId);

    const send = () => this.sendMessage(tabId, ...args);

    // message queue to handle the prerendered pages. If the tab is not active/prerendered, push the message to queue
    if (tab.status === "complete" && tab.documentLifecycle === "active") {
      send();
    } else {
      this.pushToQueue(tabId, send);
    }
  }

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

  getData(tabId: TabId, key: any, defaultValue?: any) {
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
