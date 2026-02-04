import React, { useCallback, useMemo } from "react";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import {
  GenericApiClient,
  GenericApiClientOverride,
} from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import "./historyView.scss";
import {
  ApiClientViewMode,
  bufferActions,
  useApiClientFeatureContext,
  useApiClientStore,
  useViewMode,
} from "features/apiClient/slices";
import { useTabActions } from "componentsV2/Tabs/slice";
import { useHostContext } from "hooks/useHostContext";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { NativeError } from "errors/NativeError";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { saveOrUpdateRecord } from "features/apiClient/hooks/useNewApiClientContext";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

const EmptyHistoryView: React.FC = () => {
  return (
    <div className="empty-state">
      <img src={"/assets/media/apiClient/response-empty-state.svg"} alt="empty card" width={80} height={80} />
      <div className="api-client-empty-response-view__title">Nothing to see here!</div>
      <div className="api-client-empty-response-view__description">Select a request from the history to view it</div>
    </div>
  );
};

const BufferedHistoryView: React.FC<{
  bufferId: string;
  selectedEntry: RQAPI.ApiEntry;
  hideSaveBtn: boolean;
}> = ({ bufferId, selectedEntry, hideSaveBtn }) => {
  const { openBufferedTab } = useTabActions();
  const { history, addToHistory, setCurrentHistoryIndex } = useApiClientContext();
  const scratchBuffer = useOriginUndefinedBufferedEntity<
    ApiClientEntityType.HTTP_RECORD | ApiClientEntityType.GRAPHQL_RECORD
  >({
    bufferId,
  });

  const store = useApiClientStore();
  const ctx = useApiClientFeatureContext();

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      setCurrentHistoryIndex(history.length);
      addToHistory(entry);
    },
    [addToHistory, setCurrentHistoryIndex, history]
  );

  const save = useCallback(
    async (record: RQAPI.ApiRecord, repos: ApiClientRepositoryInterface): Promise<RQAPI.ApiRecord> => {
      const result = await repos.apiClientRecordsRepository.createRecord(record);
      if (!result.success) {
        throw new NativeError(result.message || "Could not save request!");
      }
      return result.data as RQAPI.ApiRecord;
    },
    []
  );

  const override: GenericApiClientOverride | undefined = useMemo(() => {
    if (hideSaveBtn) {
      return undefined;
    }

    return {
      onSaveClick: {
        save,
        onSuccess: (savedRecord) => {
          /**
           * HISTORY SAVE FLOW EXPLANATION:
           *
           * Problem: saveBuffer() calls markSaved() with the saved record (which has an ID).
           * This updates buffer.current to contain the saved record. On the next save,
           * produceChanges uses buffer.current (which now has an ID), causing createRecord
           * to do an upsert instead of creating a new record.
           *
           * Solution: Immediately call markSaved again with clean seed data (empty ID).
           * This overwrites buffer.current with a fresh history entry state, ensuring
           * each save from history creates a new independent record.
           */

          const stableHistoryReferenceId = `history:${ctx.workspaceId}:${selectedEntry.type}`;

          // Prepare clean seed data with empty ID
          const seed: RQAPI.ApiRecord = {
            data: { ...selectedEntry },
            type: RQAPI.RecordType.API,
            id: "", // Empty ID forces createRecord to generate new ID on next save
            name: "Untitled request",
            collectionId: "",
            ownerId: "",
            deleted: false,
            createdBy: "",
            updatedBy: "",
            createdTs: Date.now(),
            updatedTs: Date.now(),
          };

          // Override buffer state with clean seed data and stable reference ID
          store.dispatch(
            bufferActions.markSaved({
              id: bufferId,
              referenceId: stableHistoryReferenceId,
              savedData: seed, // Reset buffer.current to seed with empty ID
            })
          );

          saveOrUpdateRecord(ctx, savedRecord);

          // Open new tab with the saved record
          openBufferedTab({
            source: new RequestViewTabSource({
              id: savedRecord.id,
              apiEntryDetails: savedRecord,
              title: savedRecord.name || savedRecord.data.request?.url,
              name: savedRecord.name,
              context: { id: ctx.workspaceId },
            }),
            preview: false,
          });
        },
      },
    };
  }, [bufferId, ctx, hideSaveBtn, openBufferedTab, save, selectedEntry, store]);

  return (
    <GenericApiClient
      isOpenInModal={hideSaveBtn} // TODO: rename isOpenInModal prop with some meaningful name
      override={override}
      entity={scratchBuffer}
      handleAppRequestFinished={handleAppRequestFinished}
    />
  );
};

export const HistoryView: React.FC = () => {
  const viewMode = useViewMode();
  const { history, selectedHistoryIndex } = useApiClientContext();
  const host = useHostContext();

  const selectedEntry = useMemo(() => {
    if (selectedHistoryIndex == null) {
      return null;
    }
    return history?.[selectedHistoryIndex] ?? null;
  }, [history, selectedHistoryIndex]);

  const hideSaveBtn = viewMode === ApiClientViewMode.MULTI;

  if (!selectedEntry) {
    return <EmptyHistoryView />;
  }

  const bufferId = host.getBufferId();
  if (!bufferId) {
    // Tab is likely still switching from entity -> buffer mode.
    return <EmptyHistoryView />;
  }

  return <BufferedHistoryView bufferId={bufferId} selectedEntry={selectedEntry} hideSaveBtn={hideSaveBtn} />;
};
