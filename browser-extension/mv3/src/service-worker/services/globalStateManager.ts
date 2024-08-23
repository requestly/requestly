import { PUBLIC_NAMESPACE } from "common/constants";
import { TAB_SERVICE_DATA, tabService } from "./tabService";

declare const window: {
  [key: string]: any;
};

class GlobalStateManager {
  // private variables: Record<string, any>;

  private cacheSharedStateOnPage(tabId: number) {
    const sharedState = tabService.getData(tabId, TAB_SERVICE_DATA.SHARED_STATE, {});

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: (sharedState, PUBLIC_NAMESPACE) => {
        window[PUBLIC_NAMESPACE] = window[PUBLIC_NAMESPACE] || {};
        window[PUBLIC_NAMESPACE].sharedState = sharedState;
      },
      args: [sharedState, PUBLIC_NAMESPACE],
      injectImmediately: true,
      world: "MAIN",
    });
  }

  constructor() {
    // this.variables = {};
  }

  updateSharedStateInStorage(tabId: number, sharedState: Record<string, any>) {
    tabService.setData(tabId, TAB_SERVICE_DATA.SHARED_STATE, sharedState);
  }

  // For future use - global state variables
  // setVariables(newVariables: Record<string, any>) {
  //   this.variables = newVariables;
  // }

  // getVariable(key: string) {
  //   return this.variables[key];
  // }

  // getVariables() {
  //   return this.variables;
  // }

  initSharedStateCaching(tabId: number) {
    this.cacheSharedStateOnPage(tabId);
  }
}

export const globalStateManager = new GlobalStateManager();
