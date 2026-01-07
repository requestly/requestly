import React, { useCallback, useState } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import { useCollectionView } from "../../../../collectionView.context";
import { useRunContext, useRunResultStore } from "../../run.context";
import { useApiClientSelector, useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { selectRunConfig, selectTotalRequestCount } from "features/apiClient/slices/runConfig/selectors";
import {
  getRunnerConfigId,
  DEFAULT_RUN_CONFIG_ID,
  toSavedRunConfig,
  fromSavedRunConfig,
} from "features/apiClient/slices/runConfig/types";
import { saveRunConfig as saveRunConfigThunk } from "features/apiClient/slices/runConfig/thunks";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { useActiveTabId } from "componentsV2/Tabs/slice/hooks";
import {
  getApiClientFeatureContext,
  useApiClientFeatureContext,
} from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { bufferActions } from "features/apiClient/slices/buffer";
import { runnerConfigActions } from "features/apiClient/slices/runConfig/slice";
import { selectAllDescendantIds } from "features/apiClient/slices/apiRecords/selectors";
import { useCommand } from "features/apiClient/commands";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { useBatchRequestExecutor } from "features/apiClient/hooks/requestExecutors/useBatchRequestExecutor";
import { useGenericState } from "hooks/useGenericState";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../../../src/constants/keyboardShortcuts";
import { RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import { EmptyState } from "../EmptyState/EmptyState";
import { Conditional } from "components/common/Conditional";
import "./runConfigView.scss";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { isDesktopMode } from "utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import {
  trackCollectionRunnerConfigSaved,
  trackCollectionRunnerConfigSaveFailed,
  trackInstallExtensionDialogShown,
} from "modules/analytics/events/features/apiClient";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { getAppMode } from "store/selectors";
import { useHostContext } from "hooks/useHostContext";
import { TAB_KEYS } from "../../../../CollectionView";
import { useIsBufferDirty } from "features/apiClient/slices/entities";

const RunConfigSaveButton: React.FC<{ disabled?: boolean; isRunnerTabActive: boolean }> = ({
  disabled = false,
  isRunnerTabActive,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const { collectionId } = useCollectionView();
  const workspaceId = useWorkspaceId();
  const dispatch = useApiClientDispatch();
  const activeTabId = useActiveTabId();

  // Get config from Redux slice
  const config = useApiClientSelector((state) => selectRunConfig(state, collectionId, DEFAULT_RUN_CONFIG_ID));

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: getRunnerConfigId(collectionId, config?.configId!),
    type: "referenceId",
  });

  const iterations = config?.iterations ?? 1;
  const delay = config?.delay ?? 0;

  const { getIsActive } = useHostContext();

  const isActiveTab = getIsActive();

  const handleSaveClick = useCallback(async () => {
    if (!config) return;

    setIsSaving(true);
    const configToSave = toSavedRunConfig(config);

    try {
      await dispatch(
        saveRunConfigThunk({
          workspaceId,
          collectionId,
          configToSave,
        })
      ).unwrap();

      // Mark buffer as clean after successful save
      // if (buffer && activeTabId) {
      //   const ctx = getApiClientFeatureContext(workspaceId);
      //   ctx.store.dispatch(
      //     bufferActions.markSaved({ id: buffer.id, savedData: fromSavedRunConfig(collectionId, configToSave) })
      //   );
      // }

      toast.success("Configuration saved");
      trackCollectionRunnerConfigSaved({
        collection_id: collectionId,
        request_count: configToSave.runOrder.filter((r: { isSelected: boolean }) => r.isSelected).length,
        iteration_count: iterations,
        delay: delay,
      });
    } catch (error) {
      toast.error("Something went wrong while saving!");
      Sentry.captureException(error, { extra: { collectionId, configToSave } });
      trackCollectionRunnerConfigSaveFailed({
        collection_id: collectionId,
        request_count: configToSave.runOrder.filter((r: { isSelected: boolean }) => r.isSelected).length,
        iteration_count: iterations,
        delay: delay,
      });
    } finally {
      setIsSaving(false);
    }
  }, [config, dispatch, workspaceId, collectionId, iterations, delay]);

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
        enableHotKey={isRunnerTabActive && isActiveTab}
        hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_COLLECTION?.hotKey}
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
  const genericState = useGenericState();
  const appMode = useSelector(getAppMode);

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

    const error = await runCollection({ runContext, executor, genericState, appMode });
    if (!error) {
      return;
    }

    toast.error(error?.message || "Unable to run collection!");
    Sentry.captureException(error, {
      extra: {
        reason: "Unable to run collection!",
      },
    });
  }, [runCollection, runContext, executor, dispatch, genericState, appMode]);

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

interface Props {
  activeTabKey: string;
}

export const RunConfigView: React.FC<Props> = ({ activeTabKey }) => {
  const ctx = useApiClientFeatureContext();
  const dispatch = useApiClientDispatch();

  const { collectionId } = useCollectionView();

  // Get config from Redux slice
  const config = useApiClientSelector((state) => selectRunConfig(state, collectionId, DEFAULT_RUN_CONFIG_ID));

  const isRunnerTabActive = activeTabKey === TAB_KEYS.RUNNER;
  // Get run order count
  const runOrderCount = useApiClientSelector((state) => {
    const config = selectRunConfig(state, collectionId, DEFAULT_RUN_CONFIG_ID);
    if (!config) return 0;
    const key = getRunnerConfigId(collectionId, config.configId);
    return selectTotalRequestCount(state, key);
  });

  // Get all descendant IDs for reset functionality
  const descendantIds = useApiClientSelector((state) => selectAllDescendantIds(state, collectionId));

  const handleSelectAllClick = () => {
    if (config) {
      dispatch(runnerConfigActions.toggleAllSelections(collectionId, config.configId, true));
    }
  };

  const handleDeselectAllClick = () => {
    if (config) {
      dispatch(runnerConfigActions.toggleAllSelections(collectionId, config.configId, false));
    }
  };

  const handleResetClick = () => {
    if (!config) return;

    const resetRunOrder = descendantIds.map((id: string) => ({ id, isSelected: true }));
    dispatch(runnerConfigActions.updateRunOrder(collectionId, config.configId, resetRunOrder));
  };

  const isEmpty = runOrderCount === 0;

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
          <Conditional condition={!(ctx.repositories instanceof ApiClientLocalRepository)}>
            <RunConfigSaveButton disabled={isEmpty} isRunnerTabActive={isRunnerTabActive} />
          </Conditional>
          {/* <RunCollectionButton disabled={isEmpty} /> */}
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          title="No requests in this collection"
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
