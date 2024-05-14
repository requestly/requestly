import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import LINKS from "config/constants/sub/links";

import { Typography } from "antd";

import RuleIcon from "components/common/RuleIcon";
import { IoWarningOutline } from "@react-icons/all-files/io5/IoWarningOutline";
import { RxExternalLink } from "@react-icons/all-files/rx/RxExternalLink";
import { CiMail } from "@react-icons/all-files/ci/CiMail";
import { SOURCE } from "modules/analytics/events/common/constants";
import { RuleMigrationChange, getMV3MigrationData } from "modules/extension/utils";
import { isEmpty } from "lodash";

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
            <Typography.Text code>Path</Typography.Text> source changed to → <Typography.Text code>URL</Typography.Text>
            .
          </li>
        )}
        {ruleMigrationData.some((e) => e.type === RuleMigrationChange.SOURCE_PAGEURL_MIGRATED) && (
          <li className="migrated-rule-description">
            <Typography.Text code>Page URL</Typography.Text> source filter changed to →{" "}
            <Typography.Text code>Page Domains</Typography.Text>.
          </li>
        )}
      </ul>
    </div>
  );
};

const MigratedRules = () => {
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const appMode = useSelector(getAppMode);

  const [rulesData, setRulesData] = useState({});

  const migratedRulesLogs = useMemo(() => {
    const migrationData = getMV3MigrationData();

    const migratedRulesLogs = migrationData?.[currentlyActiveWorkspace?.id ?? "private"]?.rulesMigrationLogs;

    if (isEmpty(migratedRulesLogs)) return {};

    return migratedRulesLogs;
  }, [currentlyActiveWorkspace]);

  useEffect(() => {
    if (Object.keys(migratedRulesLogs).length) {
      Object.keys(migratedRulesLogs).forEach((ruleId) => {
        StorageService(appMode)
          .getRecord(ruleId)
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

      <div className="text">
        <Typography.Text className="text-with-images">
          Contact us if you have any questions or need assistance.
          <a href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`} className=" blue-text">
            <CiMail /> Contact Us
          </a>
        </Typography.Text>
        <Typography.Text className="text-with-images">
          To report Issues related to MV3, please open an issue here{" "}
          <a href={`${LINKS.REQUESTLY_GITHUB_ISSUES}`} className="red-text">
            Report Issue <RxExternalLink />
          </a>
        </Typography.Text>
      </div>
    </div>
  ) : null;
};

export default MigratedRules;
