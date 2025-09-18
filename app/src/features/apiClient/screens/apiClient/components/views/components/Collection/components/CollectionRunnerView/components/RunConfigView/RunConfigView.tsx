import React, { useCallback, useState } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import { useCommand } from "features/apiClient/commands";
import { useCollectionView } from "../../../../collectionView.context";
import { useRunConfigStore } from "features/apiClient/store/collectionRunConfig/runConfigStoreContext.hook";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import { useBatchRequestExecutor } from "features/apiClient/hooks/requestExecutors/useBatchRequestExecutor";
import "./runConfigView.scss";

const RunCollectionButton: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { collectionId } = useCollectionView();
  const getConfig = useRunConfigStore((s) => s.getConfig);
  const {
    runner: { runCollection },
  } = useCommand();

  const executor = useBatchRequestExecutor(collectionId);

  const handleRunClick = useCallback(() => {
    runCollection({ runResultStore: {}, runConfig: getConfig(), executor, orderedRequests: [] });
  }, [runCollection, getConfig, executor]);

  /* TODO: For CLI support convert it into dropdown button */
  return (
    <RQButton disabled={disabled} size="small" type="primary" icon={<MdOutlineVideoLibrary />} onClick={handleRunClick}>
      Run
    </RQButton>
  );
};

export const RunConfigView: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const { collectionId } = useCollectionView();
  const [getConfigToSave] = useRunConfigStore((s) => [s.getConfigToSave]);
  const {
    runner: { saveRunConfig },
  } = useCommand();

  const handleSelectAllClick = () => {
    setIsSelectAll(true);
  };

  const handleDeselectAllClick = () => {
    setIsSelectAll(false);
  };

  const handleSaveClick = useCallback(async () => {
    setIsSaving(true);
    const configToSave = getConfigToSave();

    try {
      await saveRunConfig({ collectionId, configToSave });
    } catch (error) {
      toast.error("Something went wrong while saving!");
      Sentry.captureException(error, { extra: { collectionId, configToSave } });
    } finally {
      setIsSaving(false);
    }
  }, [getConfigToSave, saveRunConfig, collectionId]);

  const handleResetClick = () => {
    // TODO
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
          <RQButton size="small" loading={isSaving} icon={<MdOutlineSave />} onClick={handleSaveClick}>
            Save
          </RQButton>
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

        <RunConfigOrderedRequests isSelectAll={isSelectAll} />
        <RunConfigSettings />
      </div>
    </div>
  );
};
