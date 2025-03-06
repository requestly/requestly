import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import fileDownload from "js-file-download";
import { getAppMode } from "store/selectors";
import { prepareContentToExport } from "../actions";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRulesExportedEvent } from "modules/analytics/events/common/rules";
import { getFormattedDate } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
import { getAllRecords } from "store/features/rules/selectors";
import "./DownloadRules.css";
import { StorageRecord } from "@requestly/shared/types/entities/rules";
import { globalActions } from "store/slices/global/slice";

interface DownloadRulesProps {
  selectedRules: StorageRecord["id"][];
  toggleModal: () => void;
  onRulesDownloaded?: () => void;
}

export const DownloadRules: React.FC<DownloadRulesProps> = ({
  selectedRules = [],
  toggleModal,
  onRulesDownloaded = () => {},
}) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const records = useSelector(getAllRecords);
  const [rulesToDownload, setRulesToDownload] = useState<{
    fileContent: string;
    rulesCount: number;
    groupsCount: number;
  } | null>(null);

  const singleRuleData = useMemo(
    () => (selectedRules.length === 1 ? records.find((record) => record.id === selectedRules[0]) : null),
    [records, selectedRules]
  );

  const fileName =
    rulesToDownload?.rulesCount === 1
      ? singleRuleData?.name ?? ""
      : `requestly_export_${getFormattedDate("DD_MM_YYYY")}.json`;

  const handleDownloadRules = useCallback(
    (e: unknown) => {
      const { rulesCount, fileContent } = rulesToDownload ?? {};

      trackRQLastActivity("rules_exported");
      trackRulesExportedEvent(rulesCount);
      dispatch(globalActions.clearSelectedRecords());
      fileDownload(fileContent, fileName, "application/json");
      setTimeout(() => toast.success(`${rulesCount === 1 ? "Rule" : "Rules"} downloaded successfully`), 0);
      onRulesDownloaded();
      toggleModal();
    },
    [rulesToDownload, onRulesDownloaded, dispatch, fileName, toggleModal]
  );

  useEffect(() => {
    if (!rulesToDownload) {
      prepareContentToExport(appMode, selectedRules).then((result: any) => {
        setRulesToDownload(result);
      });
    }
  }, [selectedRules, rulesToDownload, appMode, dispatch]);

  return (
    <div className="sharing-modal-body">
      <div className="download-rules-details">
        <span className="line-clamp">{fileName}</span>
        <span className="text-gray">
          {rulesToDownload?.rulesCount} {rulesToDownload?.rulesCount === 1 ? " rule" : " rules"}
        </span>
      </div>
      <Button type="primary" onClick={handleDownloadRules}>
        Download rule
      </Button>
    </div>
  );
};
