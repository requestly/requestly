import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineStopCircle } from "@react-icons/all-files/md/MdOutlineStopCircle";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import * as Sentry from "@sentry/react";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { Conditional } from "components/common/Conditional";
import { useCommand } from "features/apiClient/commands";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { useBatchRequestExecutor } from "features/apiClient/hooks/requestExecutors/useBatchRequestExecutor";
import { entitySynced } from "features/apiClient/slices";
import { bufferActions } from "features/apiClient/slices/buffer";
import { useIsBufferDirty } from "features/apiClient/slices/entities";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { saveRunConfig as saveRunConfigThunk } from "features/apiClient/slices/runConfig/thunks";
import { DEFAULT_RUN_CONFIG_ID } from "features/apiClient/slices/runConfig/types";
import {
  getApiClientFeatureContext,
  useApiClientFeatureContext,
} from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";
import { RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import { useHostContext } from "hooks/useHostContext";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import {
  trackCollectionRunnerConfigSaved,
  trackCollectionRunnerConfigSaveFailed,
  trackInstallExtensionDialogShown,
} from "modules/analytics/events/features/apiClient";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import { isDesktopMode } from "utils/AppUtils";
import { toast } from "utils/Toast";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../../../src/constants/keyboardShortcuts";
import { TAB_KEYS } from "../../../../CollectionView";
import { useCollectionView } from "../../../../collectionView.context";
import { useRunContext, useRunResultStore } from "../../run.context";
import { EmptyState } from "../EmptyState/EmptyState";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import "./runConfigView.scss";
import { getAllDescendantApiRecordIds } from "features/apiClient/slices/apiRecords/utils";
import { fromSavedRunConfig, getRunnerConfigId, toSavedRunConfig } from "features/apiClient/slices/runConfig/utils";
import { useGenericState } from "hooks/useGenericState";

const RunConfigSaveButton: React.FC<{ disabled?: boolean; isRunnerTabActive: boolean }> = ({
  disabled = false,
  isRunnerTabActive,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const { collectionId } = useCollectionView();
  const workspaceId = useWorkspaceId();
  const dispatch = useApiClientDispatch();
  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: "referenceId",
  });

  const iterations = useApiClientSelector((state) => bufferedEntity.getIterations(state));
  const delay = useApiClientSelector((state) => bufferedEntity.getDelay(state));

  const { getIsActive } = useHostContext();

  const isActiveTab = getIsActive();

  const handleSaveClick = useCallback(async () => {
    setIsSaving(true);
    const state = getApiClientFeatureContext(workspaceId).store.getState();
    const config = bufferedEntity.getEntityFromState(state);
    const configToSave = toSavedRunConfig(config);

    try {
      await dispatch(
        saveRunConfigThunk({
          workspaceId,
          collectionId,
          configToSave,
        })
      ).unwrap();

      dispatch(
        entitySynced({
          entityId: bufferedEntity.meta.referenceId,
          entityType: ApiClientEntityType.RUN_CONFIG,
          data: config,
        })
      );
      dispatch(
        bufferActions.markSaved({
          id: bufferedEntity.meta.id,
          referenceId: bufferedEntity.meta.referenceId,
          savedData: fromSavedRunConfig(collectionId, configToSave),
        })
      );

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
  }, [bufferedEntity, dispatch, workspaceId, collectionId, iterations, delay]);

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
  const { collectionId } = useCollectionView();

  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, DEFAULT_RUN_CONFIG_ID),
    type: ApiClientEntityType.RUN_CONFIG,
  });

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
