import React, { useCallback } from "react";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useStore, StoreApi } from "zustand";
import { RequestViewState } from "../views/store";
import { RQButton } from "lib/design-system/components";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "features/apiClient/types";
import { useLiveStore } from "features/apiClient/store/apiRecords/apiRecords.store";

export const AiChatContainer: React.FC = () => {
  const [activeTabId] = useTabServiceWithSelector((state) => [state.activeTabId]);
  console.log("dg-1: activeTabId", activeTabId);
  return activeTabId ? (
    <div>
      <AIChat />
    </div>
  ) : null;
};

export const AIChat: React.FC = () => {
  const [activeTabId, tabs] = useTabServiceWithSelector((state) => [state.activeTabId, state.tabs]);
  console.log("ActiveTabId", activeTabId);

  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);
  const getEntryStore = useCallback(() => {
    if (!activeTabId) return;
    const activeTab = tabs.get(activeTabId);
    console.log("activeTab", activeTab);
    const viewStore = activeTab?.getState().viewStore;
    console.log("viewstore", activeTab?.getState().source);
    return viewStore as StoreApi<RequestViewState>; // todo: refactor to get livelistener in here
  }, [activeTabId, tabs]);

  const viewStoreRef = useLiveStore(getEntryStore);
  const viewStore = useStore(viewStoreRef);

  // const viewStore = useStore(getEntryStore()!)
  // const viewStore = useLiveStore(getEntryStore)

  const entry = viewStore?.entry;
  const recordId = viewStore?.recordId;

  const stableGetRecordStore = useCallback(() => {
    return recordId ? getRecordStore(recordId) : undefined;
  }, [recordId, getRecordStore]);

  const recordStoreRef = useLiveStore(stableGetRecordStore);
  const recordStore = useStore(recordStoreRef);

  // const recordStore = useLiveStore(stableGetRecordStore)
  console.log("entry", viewStore);

  // Check for dummy store or missing data
  if (!entry || "_isDummyStore" in recordStore) {
    return null;
  }

  return (
    <div>
      <p>Active Tab ID: {activeTabId}</p>
      <p>Entry URL: {entry.request.url || "N/A"}</p>
      <p>
        Entry Method/operation:{" "}
        {entry.type === RQAPI.ApiEntryType.HTTP ? entry.request?.method : entry.request.operation || "N/A"}
      </p>
      <p>name: {recordStore.record.name}</p>
      <RQButton
        onClick={() => {
          // entryStore?.getState().updatePostResponseScript("console.log('Hello, world!');");
          const currentPreRequestScript = entry.scripts?.preRequest;
          viewStore.updateEntryScripts({
            preRequest: currentPreRequestScript ?? "",
            postResponse: "console.log('Hello, world!');",
          });
        }}
      >
        Update Post Response Script
      </RQButton>
    </div>
  );
};
