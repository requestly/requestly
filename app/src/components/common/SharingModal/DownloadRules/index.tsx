import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { Button } from "antd";
import fileDownload from "js-file-download";
import { getAllRules, getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import { prepareContentToExport } from "../actions";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { Rule } from "types";
import { trackRulesExportedEvent } from "modules/analytics/events/common/rules";
import { getFormattedDate } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
import { trackRulesDownloadClicked } from "modules/analytics/events/misc/sharing";
import "./DownloadRules.css";

interface DownloadRulesProps {
  selectedRules: string[];
  toggleModal: () => void;
}

export const DownloadRules: React.FC<DownloadRulesProps> = ({ selectedRules = [], toggleModal }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const rules = useSelector(getAllRules);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const [rulesToDownload, setRulesToDownload] = useState<{
    fileContent: string;
    rulesCount: number;
    groupsCount: number;
  } | null>(null);

  const singleRuleData = useMemo(
    () => (selectedRules.length === 1 ? rules.find((rule: Rule) => rule.id === selectedRules[0]) : null),
    [rules, selectedRules]
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
      dispatch(actions.clearSelectedRules());
      fileDownload(fileContent, fileName, "application/json");
      setTimeout(() => toast.success(`${rulesCount === 1 ? "Rule" : "Rules"} downloaded successfully`), 0);
      trackRulesDownloadClicked(selectedRules.length);
      toggleModal();
    },
    [fileName, dispatch, toggleModal, rulesToDownload, selectedRules.length]
  );

  useEffect(() => {
    if (!rulesToDownload) {
      prepareContentToExport(appMode, selectedRules, groupwiseRulesToPopulate).then((result: any) => {
        setRulesToDownload(result);
      });
    }
  }, [selectedRules, groupwiseRulesToPopulate, rulesToDownload, appMode, dispatch]);

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
