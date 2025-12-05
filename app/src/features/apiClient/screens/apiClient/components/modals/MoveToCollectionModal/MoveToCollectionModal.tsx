import { Modal, notification } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { RQAPI } from "features/apiClient/types";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system/components";
import { trackMoveRequestToCollectionFailed, trackRequestMoved } from "modules/analytics/events/features/apiClient";
import "./moveToCollectionModal.scss";
import * as Sentry from "@sentry/react";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { getCollectionOptionsToMoveIn } from "features/apiClient/commands/utils";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";

import { createNewCollection, moveRecordsToCollection } from "./utils";
import { RQTooltip } from "lib/design-system-v2/components";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";

interface Props {
  recordsToMove: RQAPI.ApiClientRecord[];
  isOpen: boolean;
  isBulkActionMode?: boolean;
  onClose: () => void;
}

interface CollectionOption {
  label: string;
  value: string;
  __isNew__?: boolean;
}

const MoveRecordAcrossWorkspaceModal: React.FC<Props> = ({ isOpen, onClose, recordsToMove }) => {
  const currentContextId = useContextId();
  const [selectedWorkspaces] = useApiClientMultiWorkspaceView((s) => [s.selectedWorkspaces]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionOption | null>(null);

  const workspacesOptions = useMemo(() => {
    return selectedWorkspaces.map((w) => ({
      label: w.getState().name,
      value: w.getState().id,
    }));
  }, [selectedWorkspaces]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    label: string;
    value: string;
  } | null>(() =>
    workspacesOptions.find((w) => {
      return w.value === getApiClientFeatureContext(currentContextId).workspaceId;
    })
  );

  const context = useMemo(() => (selectedWorkspace ? getApiClientFeatureContext(selectedWorkspace.value) : null), [
    selectedWorkspace,
  ]);

  const collectionOptions = useMemo(() => {
    if (!context) {
      return [];
    }

    return getCollectionOptionsToMoveIn(context.id, recordsToMove);
  }, [context, recordsToMove]);

  const handleRecordMove = useCallback(async () => {
    if (!context) {
      return;
    }

    try {
      setIsLoading(true);
      const collectionId = selectedCollection?.__isNew__
        ? await createNewCollection(context, selectedCollection?.label)
        : selectedCollection?.value;

      if (collectionId) {
        await moveRecordsToCollection({
          contextId: currentContextId,
          recordsToMove,
          collectionId,
          destinationContextId: context?.id,
        });
      }

      trackRequestMoved(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
      toast.success("Requests moved to collection successfully");
    } catch (error) {
      notification.error({
        message: `Error moving records to collection`,
        description: error?.message,
        placement: "bottomRight",
      });

      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_move_to_collection");
        Sentry.captureException(error);
      });

      trackMoveRequestToCollectionFailed(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [
    context,
    selectedCollection?.__isNew__,
    selectedCollection?.label,
    selectedCollection?.value,
    currentContextId,
    recordsToMove,
    onClose,
  ]);

  return (
    <Modal
      open={isOpen}
      destroyOnClose
      onCancel={onClose}
      title="Move to Collection"
      className="custom-rq-modal move-to-collection-modal"
      footer={
        <RQButton type="primary" disabled={!selectedCollection} loading={isLoading} onClick={handleRecordMove}>
          {selectedCollection?.__isNew__ ? "Create collection and Move" : "Move"}
        </RQButton>
      }
    >
      <CreatableReactSelect
        isMulti={false}
        isValidNewOption={() => false} // dont allow workspace creation
        className="select-workspace-group"
        classNamePrefix="select-workspace-group"
        options={workspacesOptions}
        filterOption={(option, inputValue) => option.label.toLowerCase().includes(inputValue.toLowerCase())}
        placeholder="Select workspace"
        theme={(theme) => ({
          ...theme,
          borderRadius: 4,
          colors: {
            ...theme.colors,
            primary: "#ffffff19",
            primary25: "#282828",
            neutral0: "#1a1a1a",
          },
        })}
        value={selectedWorkspace}
        onChange={(newSelectedOption) => setSelectedWorkspace(newSelectedOption)}
      />

      <RQTooltip
        showArrow={false}
        title={selectedWorkspace ? null : "Please select workspace first"}
        placement="bottom"
      >
        <>
          <CreatableReactSelect
            isDisabled={!selectedWorkspace}
            isMulti={false}
            className="select-collection-group"
            classNamePrefix="select-collection-group"
            options={collectionOptions}
            filterOption={(option, inputValue) => option.label.toLowerCase().includes(inputValue.toLowerCase())}
            placeholder="Select or type collection name"
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary: "#ffffff19",
                primary25: "#282828",
                neutral0: "#1a1a1a",
              },
            })}
            value={selectedCollection}
            onChange={(newSelectedOption) => setSelectedCollection(newSelectedOption)}
          />
        </>
      </RQTooltip>
    </Modal>
  );
};

const MoveRecordInSameWorkspaceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recordsToMove,
  isBulkActionMode = false,
}) => {
  const contextId = useContextId();
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);

  const [selectedCollection, setSelectedCollection] = useState<CollectionOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectionOptions = useMemo(() => {
    return getCollectionOptionsToMoveIn(contextId, recordsToMove);
  }, [contextId, recordsToMove]);

  const handleRecordMove = useCallback(async () => {
    try {
      setIsLoading(true);

      const context = getApiClientFeatureContext(contextId);
      const collectionId = selectedCollection?.__isNew__
        ? await createNewCollection(context, selectedCollection?.label)
        : selectedCollection?.value;

      if (collectionId) {
        await moveRecordsToCollection({
          contextId,
          recordsToMove,
          collectionId,
          destinationContextId: contextId,
        });
      }

      trackRequestMoved(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
      toast.success("Requests moved to collection successfully");
    } catch (error) {
      notification.error({
        message: `Error moving records to collection`,
        description: error?.message,
        placement: "bottomRight",
      });

      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_move_to_collection");
        Sentry.captureException(error);
      });

      trackMoveRequestToCollectionFailed(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [
    contextId,
    selectedCollection?.__isNew__,
    selectedCollection?.label,
    selectedCollection?.value,
    recordsToMove,
    onClose,
  ]);

  return (
    <Modal
      open={isOpen}
      destroyOnClose
      onCancel={onClose}
      title="Move to Collection"
      className="custom-rq-modal move-to-collection-modal"
      footer={
        <RQButton type="primary" disabled={!selectedCollection} loading={isLoading} onClick={handleRecordMove}>
          {selectedCollection?.__isNew__ ? "Create collection and Move" : "Move"}
        </RQButton>
      }
    >
      <CreatableReactSelect
        isMulti={false}
        className="select-collection-group"
        classNamePrefix="select-collection-group"
        options={collectionOptions}
        filterOption={(option, inputValue) => option.label.toLowerCase().includes(inputValue.toLowerCase())}
        placeholder="Select or type collection name"
        theme={(theme) => ({
          ...theme,
          borderRadius: 4,
          colors: {
            ...theme.colors,
            primary: "#ffffff19",
            primary25: "#282828",
            neutral0: "#1a1a1a",
          },
        })}
        value={selectedCollection}
        onChange={(newSelectedOption: CollectionOption) => setSelectedCollection(newSelectedOption)}
      />

      {viewMode === ApiClientViewMode.MULTI && isBulkActionMode ? (
        <div className="multi-view-mode-info">
          <MdInfoOutline />
          <div className="info">
            Moving requests between workspaces isn't supported yet. However, you can move the request files manually on
            your system, and they'll reflect here after a refresh.
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export const MoveToCollectionModal: React.FC<Props> = ({ ...props }) => {
  const [viewMode] = useApiClientMultiWorkspaceView((s) => [s.viewMode]);

  if (viewMode === ApiClientViewMode.MULTI && !props.isBulkActionMode) {
    return <MoveRecordAcrossWorkspaceModal {...props} />;
  } else {
    return <MoveRecordInSameWorkspaceModal {...props} />;
  }
};
