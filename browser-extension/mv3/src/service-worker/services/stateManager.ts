import { PUBLIC_NAMESPACE } from "common/constants";
// import { tabService } from "./tabService";

class StateManager {
  private variables: Record<string, any>;

  private cacheSharedStateOnPage(tabId: number) {
    const sharedState = {};

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: (sharedState, PUBLIC_NAMESPACE) => {
        window.top[PUBLIC_NAMESPACE] = window.top[PUBLIC_NAMESPACE] || {};
        window.top[PUBLIC_NAMESPACE].sharedState = sharedState;
      },
      args: [sharedState, PUBLIC_NAMESPACE],
      injectImmediately: true,
      world: "MAIN",
    });
  }

  // private updateSharedStateInStorage(tabId: number, sharedState: Record<string, any>) {
  //   tabService.setData(tabId, "sharedState", sharedState);
  // }

  constructor() {
    this.variables = {};
    this.addListenerForSharedState();
  }

  setVariables(newVariables: Record<string, any>) {
    this.variables = newVariables;
  }

  getVariable(key: string) {
    return this.variables[key];
  }

  getVariables() {
    return this.variables;
  }

  initSharedStateCaching(tabId: number) {
    this.cacheSharedStateOnPage(tabId);
  }

  addListenerForSharedState() {
    chrome.tabs.onCreated.addListener((tabData) => {
      this.cacheSharedStateOnPage(tabData.id);
    });
  }
}

export const stateManager = new StateManager();
