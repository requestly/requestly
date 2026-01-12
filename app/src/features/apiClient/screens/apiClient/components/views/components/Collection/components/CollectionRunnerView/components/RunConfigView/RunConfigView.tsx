import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import * as Sentry from "@sentry/react";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { Conditional } from "components/common/Conditional";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { useBatchRequestExecutor } from "features/apiClient/hooks/requestExecutors/useBatchRequestExecutor";
import { useIsBufferDirty } from "features/apiClient/slices/entities";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { selectLiveRunResultRunStatus } from "features/apiClient/slices/liveRunResults/selectors";
import {
  saveRunConfig as saveRunConfigThunk,
  runCollectionThunk,
  cancelRunThunk,
  RunContext,
} from "features/apiClient/slices/runConfig/thunks";
import {
  getApiClientFeatureContext,
  useApiClientFeatureContext,
} from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { RunStatus } from "features/apiClient/slices/common/runResults/types";
import { useHostContext } from "hooks/useHostContext";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import {
  trackCollectionRunnerConfigSaved,
  trackCollectionRunnerConfigSaveFailed,
  trackInstallExtensionDialogShown,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { isDesktopMode } from "utils/AppUtils";
import { toast } from "utils/Toast";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../../../src/constants/keyboardShortcuts";
import { TAB_KEYS } from "../../../../CollectionView";
import { useCollectionView } from "../../../../collectionView.context";
import { EmptyState } from "../EmptyState/EmptyState";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import { getRunnerConfigId, toSavedRunConfig } from "features/apiClient/slices/runConfig/utils";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/constants";
import "./runConfigView.scss";

const RunConfigSaveButton: React.FC<{ disabled?: boolean; isRunnerTabActive: boolean }> = ({
  disabled = false,
  isRunnerTabActive,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const { collectionId, bufferedEntity } = useCollectionView();
  const workspaceId = useWorkspaceId();
  const dispatch = useApiClientDispatch();

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: "referenceId",
  });

  const iterations = useApiClientSelector((state) => bufferedEntity.getIterations(state));
  const delay = useApiClientSelector((state) => bufferedEntity.getDelay(state));

  const { getIsActive } = useHostContext();
  const saveBuffer = useSaveBuffer();

  const isActiveTab = getIsActive();

  const handleSaveClick = useCallback(async () => {
    saveBuffer(
      {
        entity: bufferedEntity,
        async save(changes, repositories) {
          await dispatch(
            saveRunConfigThunk({
              workspaceId,
              collectionId,
              configToSave: toSavedRunConfig(changes),
            })
          ).unwrap();
        },
      },
      {
        beforeSave() {
          setIsSaving(true);
        },
        onSuccess(configToSave) {
          toast.success("Configuration saved");
          trackCollectionRunnerConfigSaved({
            collection_id: collectionId,
            request_count: configToSave.runOrder.filter((r: { isSelected: boolean }) => r.isSelected).length,
            iteration_count: iterations,
            delay: delay,
          });
        },
        afterSave() {
          setIsSaving(false);
        },
        onError(error) {
          const { store } = getApiClientFeatureContext(workspaceId);
          const data = bufferedEntity.getEntityFromState(store.getState());
          toast.error("Something went wrong while saving!");
          Sentry.captureException(error, { extra: { collectionId, data } });
          trackCollectionRunnerConfigSaveFailed({
            collection_id: collectionId,
            request_count: data.runOrder.filter((r: { isSelected: boolean }) => r.isSelected).length,
            iteration_count: iterations,
            delay: delay,
          });
        },
      }
    );
  }, [bufferedEntity, collectionId, dispatch, iterations, delay, saveBuffer, workspaceId]);

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
  const { collectionId, bufferedEntity, liveRunResultEntity } = useCollectionView();
  const runStatus = useApiClientSelector((s) => selectLiveRunResultRunStatus(s, collectionId));

  const dispatch = useDispatch();
  const apiClientDispatch = useApiClientDispatch();
  const workspaceId = useWorkspaceId();
  const executor = useBatchRequestExecutor(collectionId);
  const { registerWorkflow } = useHostContext();

  const runContext: RunContext = useMemo(() => {
    return {
      liveRunResultEntity,
      runConfigEntity: bufferedEntity,
    };
  }, [bufferedEntity, liveRunResultEntity]);

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

    try {
      const promise = apiClientDispatch(
        runCollectionThunk({
          workspaceId,
          executor,
          runContext,
        })
      ).unwrap();

      registerWorkflow({
        cancelWarning: "Collection run is in progress, still want to close?",
        workflow: {
          then: (cb) => promise.then(cb),
          catch: (cb) => promise.catch(cb),
          abort: () => apiClientDispatch(cancelRunThunk({ runContext })),
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to run collection!");
      Sentry.captureException(error, {
        extra: {
          reason: "Unable to run collection!",
        },
      });
    }
  }, [dispatch, apiClientDispatch, workspaceId, executor, runContext, registerWorkflow]);

  const handleCancelRunClick = useCallback(() => {
    apiClientDispatch(cancelRunThunk({ runContext }));
  }, [runContext, apiClientDispatch]);

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
  const { collectionId, bufferedEntity } = useCollectionView();

  const isRunnerTabActive = activeTabKey === TAB_KEYS.RUNNER;
  const runOrderCount = useApiClientSelector((state) => bufferedEntity.getRunOrder(state).length);

  const handleSelectAllClick = () => {
    bufferedEntity.toggleAllSelections(true);
  };

  const handleDeselectAllClick = () => {
    bufferedEntity.toggleAllSelections(false);
  };

  const handleResetClick = () => {
    const descendantIds = getAllDescendantApiRecordIds(collectionId, ctx.workspaceId);
    const resetRunOrder = descendantIds.map((id: string) => ({ id, isSelected: true }));
    bufferedEntity.setRunOrder(resetRunOrder);
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
          <RunCollectionButton disabled={isEmpty} />
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
