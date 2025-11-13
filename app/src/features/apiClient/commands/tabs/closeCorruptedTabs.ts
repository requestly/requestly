import { tabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import { getApiClientFeatureContext } from "../store.utils";

export function closeCorruptedTabs() {
  const { tabs, closeTabBySource, setIgnorePath } = tabServiceStore.getState();

  tabs.forEach((tab) => {
    const { source } = tab.getState();

    const contextId = source.metadata.context?.id;
    const context = getApiClientFeatureContext(contextId);

    // This getIsValidTab will give false always, since on every restart the
    // record id changes
    const isValid = !!context && source.getIsValidTab(context);

    if (!isValid) {
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();

      closeTabBySource(sourceId, sourceName, true);
      setIgnorePath(true);
    }
  });
}
