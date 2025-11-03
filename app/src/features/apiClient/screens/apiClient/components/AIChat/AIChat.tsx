import React, { useEffect, useMemo, useState } from "react";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useStore, StoreApi, create } from "zustand";
import { RequestViewStore } from "../views/store";
import { RQButton } from "lib/design-system/components";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { RQAPI } from "features/apiClient/types";
import { createRecordStore } from "features/apiClient/store/apiRecords/apiRecords.store";

const useEntryStore = () => {
  const [activeTabId, tabs] = useTabServiceWithSelector((state) => [state.activeTabId, state.tabs]);
  const [noopStore] = useState(() => createRecordStore({} as RQAPI.ApiClientRecord));
  const entryStore = useMemo(() => {
    if (!activeTabId) return null;
    const activeTab = tabs.get(activeTabId);
    return activeTab?.getState().entryStore ?? null;
  }, [activeTabId, tabs]);

  // const recordStore = useMemo(() => {
  //   // no multi view
  //   const recordId = entryStore?.getState().recordId;
  //   if (!recordId) return null;
  //   return getRecordStore(recordId);
  // }, [entryStore, getRecordStore]);

  // if(!recordStore) return entryStore

  const apiEntryDetails = useStore(
    (entryStore || noopStore) as StoreApi<RequestViewStore>,
    (state) => state.apiEntryDetails
  );

  return { apiEntryDetails, entryStore };
};

const useEntryRecordStore = (recordId?: string) => {
  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);
  const recordStore = getRecordStore(recordId ?? "");

  const [recordData, setRecordData] = useState<RQAPI.ApiClientRecord | null>(
    recordStore?.getState().record as RQAPI.ApiRecord | null
  );

  useEffect(() => {
    let unsub: () => void;
    if (recordStore && recordId !== "draft") {
      unsub = recordStore.subscribe((state) => {
        setRecordData(state.record as RQAPI.ApiRecord);
      });
    }

    return () => {
      unsub?.();
    };
  }, [recordStore, recordId]);
  // return useStore(recordStore, (state) => state.record)
  return recordData;
};

export const AiChatContainer: React.FC = () => {
  const [activeTabId] = useTabServiceWithSelector((state) => [state.activeTabId]);

  return activeTabId ? (
    <div>
      <AIChat />
    </div>
  ) : null;
};

export const AIChat: React.FC = () => {
  const [activeTabId, tabs] = useTabServiceWithSelector((state) => [state.activeTabId, state.tabs]);

  // const { apiEntryDetails: liveEntry, entryStore } = useEntryStore();
  // const liveRecord = useEntryRecordStore(entryStore.getState().recordId);

  // console.log("liveEntry", { liveEntry });

  const [noopStore] = useState(() => createRecordStore({} as RQAPI.ApiClientRecord));
  const entryStore = useMemo(() => {
    if (!activeTabId) return null;
    const activeTab = tabs.get(activeTabId);
    return activeTab?.getState().entryStore ?? null;
  }, [activeTabId, tabs]);

  const liveEntry = useStore((entryStore || noopStore) as StoreApi<RequestViewStore>, (state) => state.apiEntryDetails);

  const recordId = entryStore?.getState().recordId;

  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);
  const recordStore = getRecordStore(recordId ?? "");

  const [liveRecord, setRecordData] = useState<RQAPI.ApiClientRecord | null>(null);

  useEffect(() => {
    let unsub: () => void;
    if (recordStore && recordId !== "draft") {
      setRecordData(recordStore.getState().record as RQAPI.ApiRecord);
      unsub = recordStore.subscribe((state) => {
        setRecordData(state.record as RQAPI.ApiRecord);
      });
    }

    return () => {
      unsub?.();
    };
  }, [recordStore, recordId]);

  return (
    <div>
      <p>Active Tab ID: {activeTabId}</p>
      <p>Entry URL: {liveEntry.data.request.url || "N/A"}</p>
      <p>Entry Method: {liveEntry.data.request?.method || "N/A"}</p>
      <p> name: {liveRecord?.name}</p>
      <RQButton
        onClick={() => {
          entryStore?.getState().updatePostResponseScript("console.log('Hello, world!');");
        }}
      >
        Update Post Response Script
      </RQButton>
    </div>
  );
};
