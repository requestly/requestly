import React, { useCallback, useMemo } from "react";
import { RequestViewTabSource } from "../../RequestView/requestViewTabSource";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { GenericApiClient, GenericApiClientOverride } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
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
  const scratchBuffer = useOriginUndefinedBufferedEntity({ bufferId });

  const store = useApiClientStore();
  const ctx = useApiClientFeatureContext();

  const handleAppRequestFinished = useCallback(
    (entry: RQAPI.ApiEntry) => {
      setCurrentHistoryIndex(history.length);
      addToHistory(entry);
    },
    [addToHistory, setCurrentHistoryIndex, history]
  );

  const save = useCallback(async (record: RQAPI.ApiRecord, repos: ApiClientRepositoryInterface): Promise<RQAPI.ApiRecord> => {
    const result = await repos.apiClientRecordsRepository.createRecord(record);
    if (!result.success) {
      throw new NativeError(result.message || "Could not save request!");
    }
    return result.data as RQAPI.ApiRecord;
  }, []);

  const override: GenericApiClientOverride | undefined = useMemo(() => {
    if (hideSaveBtn) {
      return undefined;
    }

    return {
      onSaveClick: {
        save,
        onSuccess: (savedRecord) => {
          const stableHistoryReferenceId = `history:${ctx.workspaceId}:${selectedEntry.type}`;
          store.dispatch(
            bufferActions.markSaved({
              id: bufferId,
              referenceId: stableHistoryReferenceId,
            })
          );

          saveOrUpdateRecord(ctx, savedRecord);

          openBufferedTab({
            source: new RequestViewTabSource({
              id: savedRecord.id,
              apiEntryDetails: savedRecord,
              title: savedRecord.name || savedRecord.data.request?.url,
              context: { id: ctx.workspaceId },
            }),
            preview: false,
          });

          // Option B: reset History buffer back to the last selected seed (pre-edit).
          const seed: RQAPI.ApiRecord = {
            data: { ...selectedEntry },
            type: RQAPI.RecordType.API,
            id: "",
            name: "Untitled request",
            collectionId: "",
            ownerId: "",
            deleted: false,
            createdBy: "",
            updatedBy: "",
            createdTs: Date.now(),
            updatedTs: Date.now(),
          };

          store.dispatch(
            bufferActions.revertChanges({
              referenceId: stableHistoryReferenceId,
              sourceData: seed,
            })
          );
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
