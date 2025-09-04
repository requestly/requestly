import { tabServiceStore } from "componentsV2/Tabs/store/tabServiceStore";
import * as Sentry from "@sentry/react";
import { getApiClientFeatureContext } from "../store.utils";
import { NativeError } from "errors/NativeError";

export function closeCorruptedTabs() {
  const { tabs, closeTabBySource, setIgnorePath } = tabServiceStore.getState();

  try {
    tabs.forEach((tab) => {
      const { source } = tab.getState();

      const contextId = source.metadata.context?.id;
      const context = getApiClientFeatureContext(contextId);

      if (!context) {
        throw new NativeError("Tab context does not exist!").addContext({ metadata: source.metadata });
      }

      const isValid = source.getIsValidTab(context);

      if (!isValid) {
        const sourceId = source.getSourceId();
        const sourceName = source.getSourceName();

        closeTabBySource(sourceId, sourceName, true);
        setIgnorePath(true);
      }
    });
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    setIgnorePath(false);
  }
}
