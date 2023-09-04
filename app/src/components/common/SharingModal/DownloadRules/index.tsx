import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { Button } from "antd";
import fileDownload from "js-file-download";
import { getAllRules, getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import { prepareContentToExport } from "components/features/rules/ExportRulesModal/actions";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { Rule } from "types";
import { trackRulesExportedEvent } from "modules/analytics/events/common/rules";
import { epochToDateAndTimeString } from "utils/DateTimeUtils";
import { toast } from "utils/Toast";
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
      : `requestly_export_${epochToDateAndTimeString(new Date()).split(" ")[0]}.json`;

  const handleDownloadRules = useCallback(
    (e: unknown) => {
      const { rulesCount, fileContent } = rulesToDownload ?? {};

      trackRQLastActivity("rules_exported");
      trackRulesExportedEvent(rulesCount);
      fileDownload(fileContent, fileName, "application/json");
      setTimeout(() => toast.success(`${rulesCount === 1 ? "Rule" : "Rules"} downloaded successfully`), 0);
      toggleModal();
      setRulesToDownload(null);
    },
    [fileName, rulesToDownload]
  );

  useEffect(() => {
    if (!rulesToDownload) {
      prepareContentToExport(appMode, selectedRules, groupwiseRulesToPopulate).then((result) => {
        setRulesToDownload(result);
        dispatch(actions.clearSelectedRules());
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
