import { tabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import * as Sentry from "@sentry/react";

export function closeCorruptedTabs() {
  try {
    const { tabs, closeTabBySource, setIgnorePath } = tabServiceStore.getState();

    tabs.forEach((tab) => {
      const { source } = tab.getState();
      const isValid = source.getIsValidTab();

      if (!isValid) {
        const sourceId = source.getSourceId();
        const sourceName = source.getSourceName();

        closeTabBySource(sourceId, sourceName, true);
        setIgnorePath(true);
      }
    });
  } catch (e) {
    Sentry.captureException(e);
  }
}
