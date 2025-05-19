import { injectWebAccessibleScript } from "./scriptUtils";

export const initCustomWidgets = (tabId: number, frameId: number) => {
  injectWebAccessibleScript("libs/customElements.js", { tabId, frameIds: [frameId] });
};
