import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

import { Popover, Typography } from "antd";

import RuleIcon from "components/common/RuleIcon";
import { IoWarningOutline } from "@react-icons/all-files/io5/IoWarningOutline";
import { RxExternalLink } from "@react-icons/all-files/rx/RxExternalLink";
import { SOURCE } from "modules/analytics/events/common/constants";
import { RuleMigrationChange, getMV3MigrationData } from "modules/extension/utils";
import { isEmpty } from "lodash";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const MigratedRuleTile = ({ currentRule, ruleMigrationData }) => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    redirectToRuleEditor(navigate, currentRule.id, SOURCE.MV3_MODAL, true);
  };

  return !currentRule ? null : (
    <div className="migrated-rules-item">
      <div className="migrated-rule-name" onClick={handleOnClick}>
        <RuleIcon ruleType={currentRule.ruleType} /> {currentRule.name} <RxExternalLink />
      </div>
      <ul>
        {ruleMigrationData.some((e) => e.type === RuleMigrationChange.SOURCE_PATH_MIGRATED) && (
          <li className="migrated-rule-description">
            <Popover
              content={<img src={"/assets/media/rules/path-contains.png"} width={200} alt="path-migration" />}
              trigger="hover"
            >
              <a
                href="https://docs.requestly.com/general/http-rules/rule-types/map-local"
                target="_blank"
                rel="noreferrer"
              >
                <Typography.Text code>Path</Typography.Text>
              </a>
            </Popover>{" "}
            source condition changed to → <Typography.Text code>URL</Typography.Text>.
          </li>
        )}
        {ruleMigrationData.some((e) => e.type === RuleMigrationChange.SOURCE_PAGEURL_MIGRATED) && (
          <li className="migrated-rule-description">
            <Popover
              content={
                <img
                  src={"/assets/media/rules/source-filter-page-url.png"}
                  width={200}
                  alt="page-url-source-filter-migration"
                />
              }
              trigger="hover"
            >
              <a
                href="https://docs.requestly.com/general/http-rules/advanced-usage/advance-filters/"
                target="_blank"
                rel="noreferrer"
              >
                <Typography.Text code>Page URL</Typography.Text>{" "}
              </a>
            </Popover>
            advance filter changed to → <Typography.Text code>Page Domains</Typography.Text>.
          </li>
        )}
      </ul>
    </div>
  );
};

const MigratedRules = () => {
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const appMode = useSelector(getAppMode);

  const [rulesData, setRulesData] = useState({});

  const migratedRulesLogs = useMemo(() => {
    const migrationData = getMV3MigrationData();

    const migratedRulesLogs = migrationData?.[activeWorkspaceId ?? "private"]?.rulesMigrationLogs;

    if (isEmpty(migratedRulesLogs)) return {};

    return migratedRulesLogs;
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (Object.keys(migratedRulesLogs).length) {
      Object.keys(migratedRulesLogs).forEach((ruleId) => {
        clientRuleStorageService
          .getRecordById(ruleId)
          .then((rule) => {
            if (rule) {
              setRulesData((prev) => ({ ...prev, [ruleId]: rule }));
            }
          })
          .catch((err) => {
            // setFailedToFetchRule(true);
          });
      });
    }
  }, [appMode, migratedRulesLogs]);

  return Object.keys(rulesData).length > 0 ? (
    <div className="section migrated-rules">
      <div className="header">
        <div className="migrated-rules title">
          <IoWarningOutline className="icon" /> Migrated Rules
        </div>
        <Typography.Text className="text">
          Please review the updated rules below and make any necessary adjustments.
        </Typography.Text>
      </div>

      <div className="content">
        {Object.values(rulesData).map((ruleData, idx) => (
          <MigratedRuleTile currentRule={ruleData} ruleMigrationData={migratedRulesLogs[ruleData.id]} key={idx} />
        ))}
      </div>
    </div>
  ) : null;
};

export default MigratedRules;
