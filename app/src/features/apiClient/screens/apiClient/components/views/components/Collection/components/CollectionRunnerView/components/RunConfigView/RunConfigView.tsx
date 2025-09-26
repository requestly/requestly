import React, { useCallback, useEffect, useState } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
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
import { EmptyState } from "../EmptyState/EmptyState";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { Conditional } from "components/common/Conditional";
import "./runConfigView.scss";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { isDesktopMode } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { trackInstallExtensionDialogShown } from "modules/analytics/events/features/apiClient";

const RunConfigSaveButton: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
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
      toast.success("Configuration saved");
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
        disabled={disabled}
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
  const dispatch = useDispatch();

  const {
    runner: { runCollection, cancelRun },
  } = useCommand();

  const executor = useBatchRequestExecutor(collectionId);

  const handleRunClick = useCallback(async () => {
    if (!isExtensionInstalled() && !isDesktopMode()) {
      const modalProps = {
        heading: "Install browser Extension to use the API Client",
        subHeading:
          "A minimalistic API Client for front-end developers to test their APIs and fast-track their web development lifecycle. Add custom Headers and Query Params to test your APIs.",
        eventPage: "collection_runner",
      };
      dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
      trackInstallExtensionDialogShown({ src: "collection_runner" });
      return;
    }

    const error = await runCollection({ runContext, executor });
    if (!error) {
      return;
    }
    toast.error("Unable to run collection!");
    Sentry.captureException(error, {
      extra: {
        reason: "Unable to run collection!",
      },
    });
  }, [runCollection, runContext, executor, dispatch]);

  const handleCancelRunClick = useCallback(() => {
    cancelRun({ runContext });
  }, [cancelRun, runContext]);

  const isRunning = runStatus === RunStatus.RUNNING;
  return isRunning ? (
    <RQButton
      disabled={disabled}
      size="small"
      type="danger"
      icon={<MdOutlineStopCircle />}
      onClick={handleCancelRunClick}
    >
      Stop
    </RQButton>
  ) : (
    <RQButton disabled={disabled} size="small" type="primary" icon={<MdOutlineVideoLibrary />} onClick={handleRunClick}>
      Run
    </RQButton>
  );
};

export const RunConfigView: React.FC = () => {
  const ctx = useApiClientFeatureContext();

  const { collectionId } = useCollectionView();
  const [setOrderedRequests, orderedRequestsCount, setSelectionForAll] = useRunConfigStore((s) => [
    s.setOrderedRequests,
    s.orderedRequests.length,
    s.setSelectionForAll,
  ]);
  const {
    runner: { resetRunOrder },
  } = useCommand();

  const handleSelectAllClick = () => {
    setSelectionForAll(true);
  };

  const handleDeselectAllClick = () => {
    setSelectionForAll(false);
  };

  const handleResetClick = () => {
    resetRunOrder({ collectionId, setOrderedRequests });
  };

  const isEmpty = orderedRequestsCount === 0;

  return (
    <div className="run-config-view-container">
      {/* header */}
      <div className="run-config-header">
        <div className="title">
          Configuration
          <RQTooltip title={"Collection run configuration"}>
            <MdInfoOutline />
          </RQTooltip>
        </div>

        <div className="actions">
          <Conditional condition={ctx.repositories instanceof ApiClientCloudRepository}>
            <RunConfigSaveButton disabled={isEmpty} />
          </Conditional>
          <RunCollectionButton disabled={isEmpty} />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          title="No results in this collection"
          description="Collection must include at least one request to run."
        />
      ) : (
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

          <RunConfigOrderedRequests />
          <RunConfigSettings />
        </div>
      )}
    </div>
  );
};
