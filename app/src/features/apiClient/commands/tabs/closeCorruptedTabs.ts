import { tabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import { getApiClientFeatureContext } from "../store.utils";

export function closeCorruptedTabs() {
  const { tabs, closeTabBySource, setIgnorePath } = tabServiceStore.getState();

  tabs.forEach((tab) => {
    const { source } = tab.getState();

    const contextId = source.metadata.context.id;
    if (!contextId) {
      return;
    }

    const context = getApiClientFeatureContext(contextId);

    // "getIsValidTab" will always give false for local workspace,
    // since on every app restart the record id changes
    const isValid = !!context && source.getIsValidTab(context);

    if (!isValid) {
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();

      closeTabBySource(sourceId, sourceName, true);
      setIgnorePath(true);
    }
  });
}
