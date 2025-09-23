import React, { useCallback, useEffect, useState } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import { useCommand } from "features/apiClient/commands";
import { useCollectionView } from "../../../../collectionView.context";
import { useRunConfigStore, useRunContext, useRunResultStore } from "../../run.context";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { useBatchRequestExecutor } from "features/apiClient/hooks/requestExecutors/useBatchRequestExecutor";
import { useGenericState } from "hooks/useGenericState";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../../../src/constants/keyboardShortcuts";
import { RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import "./runConfigView.scss";

const RunConfigSaveButton: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  const { collectionId } = useCollectionView();
  const [getConfigToSave, hasUnsavedChanges, setHasUnsavedChanges] = useRunConfigStore((s) => [
    s.getConfigToSave,
    s.hasUnsavedChanges,
    s.setHasUnsavedChanges,
  ]);

  const {
    runner: { saveRunConfig },
  } = useCommand();

  const { setPreview, setUnsaved, getIsActive } = useGenericState();

  const isActiveTab = getIsActive();

  useEffect(() => {
    setUnsaved(hasUnsavedChanges);

    if (hasUnsavedChanges) {
      setPreview(false);
    }
  }, [setUnsaved, setPreview, hasUnsavedChanges]);

  const handleSaveClick = useCallback(async () => {
    setIsSaving(true);
    const configToSave = getConfigToSave();

    try {
      await saveRunConfig({ collectionId, configToSave });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error("Something went wrong while saving!");
      Sentry.captureException(error, { extra: { collectionId, configToSave } });
    } finally {
      setIsSaving(false);
    }
  }, [getConfigToSave, saveRunConfig, collectionId, setHasUnsavedChanges]);

  return (
    <RQTooltip
      placement="top"
      title={
        hasUnsavedChanges
          ? "Save your current configuration for future use. You can also run the collection without saving"
          : null
      }
    >
      <RQButton
        enableHotKey={isActiveTab}
        hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_COLLECTION.hotKey}
        size="small"
        loading={isSaving}
        icon={hasUnsavedChanges ? <div className="unsaved-changes-indicator" /> : <MdOutlineSave />}
        onClick={handleSaveClick}
      >
        Save
      </RQButton>
    </RQTooltip>
  );
};

const RunCollectionButton: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { collectionId } = useCollectionView();
  const runContext = useRunContext();
  const [runStatus] = useRunResultStore((s) => [s.runStatus]);

  const {
    runner: { runCollection },
  } = useCommand();

  const executor = useBatchRequestExecutor(collectionId);

  const handleRunClick = useCallback(async () => {
    try {
      await runCollection({ runContext, executor });
    } catch (error) {
      runContext.runResultStore.getState().setRunStatus(RunStatus.ERRORED);
      toast.error("Unable to run collection!");
      Sentry.captureException(error, {
        extra: {
          reason: "Unable to run collection!",
        },
      });
    }
  }, [runCollection, runContext, executor]);

  const handleCancelRunClick = useCallback(async () => {}, []);

  const isRunning = runStatus === RunStatus.RUNNING;
  return isRunning ? (
    <RQButton disabled={disabled} size="small" type="danger" onClick={handleCancelRunClick}>
      Cancel
    </RQButton>
  ) : (
    <RQButton disabled={disabled} size="small" type="primary" icon={<MdOutlineVideoLibrary />} onClick={handleRunClick}>
      Run
    </RQButton>
  );
};

export const RunConfigView: React.FC = () => {
  const [selectAll, setSelectAll] = useState({ value: true });

  const { collectionId } = useCollectionView();
  const [setOrderedRequests, setHasUnsavedChanges] = useRunConfigStore((s) => [
    s.setOrderedRequests,
    s.setHasUnsavedChanges,
  ]);
  const {
    runner: { resetRunOrder },
  } = useCommand();

  const handleSelectAllClick = () => {
    setSelectAll({ value: true });

    if (!selectAll) {
      setHasUnsavedChanges(true);
    }
  };

  const handleDeselectAllClick = () => {
    setSelectAll({ value: false });

    if (selectAll) {
      setHasUnsavedChanges(true);
    }
  };

  const handleResetClick = () => {
    resetRunOrder({ collectionId, setOrderedRequests });
  };

  return (
    <div className="run-config-view-container">
      {/* header */}
      <div className="run-config-header">
        <div className="title">
          Configuration
          <RQTooltip
            title={
              ""
              // TODO: add title
            }
          >
            <MdInfoOutline />
          </RQTooltip>
        </div>

        <div className="actions">
          <RunConfigSaveButton />
          <RunCollectionButton />
        </div>
      </div>

      {/* config container */}
      <div className="run-config-container">
        <div className="run-config-ordered-requests-header">
          <RQButton type="transparent" size="small" onClick={handleSelectAllClick}>
            Select all
          </RQButton>
          <RQButton type="transparent" size="small" onClick={handleDeselectAllClick}>
            Deselect all
          </RQButton>
          <RQButton type="transparent" size="small" icon={<MdOutlineRestartAlt />} onClick={handleResetClick}>
            Reset
          </RQButton>
        </div>

        <RunConfigOrderedRequests selectAll={selectAll} />
        <RunConfigSettings />
      </div>
    </div>
  );
};
