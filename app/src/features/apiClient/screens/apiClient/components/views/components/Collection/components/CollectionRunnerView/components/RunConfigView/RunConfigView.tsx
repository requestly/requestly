import React, { useCallback, useState } from "react";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineSave } from "@react-icons/all-files/md/MdOutlineSave";
import { MdOutlineVideoLibrary } from "@react-icons/all-files/md/MdOutlineVideoLibrary";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { MdOutlineRestartAlt } from "@react-icons/all-files/md/MdOutlineRestartAlt";
import { RunConfigOrderedRequests } from "./RunConfigOrderedRequests/RunConfigOrderedRequests";
import { RunConfigSettings } from "./RunConfigSettings/RunConfigSettings";
import { useCommand } from "features/apiClient/commands";
import { useCollectionView } from "../../../../collectionView.context";
import { useRunConfigStore } from "features/apiClient/store/collectionRunConfig/runConfigStoreContext.hook";
import { toast } from "utils/Toast";
import * as Sentry from "@sentry/react";
import "./runConfigView.scss";

export const RunConfigView: React.FC = () => {
  const [selectAll, setSelectAll] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { collectionId } = useCollectionView();
  const [id, getConfigToSave] = useRunConfigStore((s) => [s.id, s.getConfigToSave]);
  const {
    runner: { saveRunConfig },
  } = useCommand();

  const handleSaveClick = useCallback(async () => {
    setIsSaving(true);
    const configToSave = getConfigToSave();

    try {
      await saveRunConfig({ collectionId, configId: id, configToSave });
    } catch (error) {
      toast.error("Something went wrong while saving!");
      Sentry.captureException(error, { extra: { collectionId, configId: id, configToSave } });
    } finally {
      setIsSaving(false);
    }
  }, [getConfigToSave, saveRunConfig, collectionId, id]);

  const handleRunClick = useCallback(() => {}, []);

  const onChange = (e: CheckboxChangeEvent) => {
    setSelectAll(e.target.checked);
  };

  const handleResetClick = () => {
    // TODO
    setSelectAll(false);
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
          {/* TODO: For CLI support convert it into dropdown button */}
          <RQButton size="small" type="primary" icon={<MdOutlineVideoLibrary />} onClick={handleRunClick}>
            Run
          </RQButton>
        </div>
      </div>

      {/* config container */}
      <div className="run-config-container">
        <div className="run-config-ordered-requests-header">
          <Checkbox checked={selectAll} onChange={onChange}>
            Select all
          </Checkbox>
          <RQButton type="transparent" size="small" icon={<MdOutlineRestartAlt />} onClick={handleResetClick}>
            Reset
          </RQButton>
        </div>

        <RunConfigOrderedRequests isSelectAll={selectAll} />
        <RunConfigSettings />
      </div>
    </div>
  );
};
