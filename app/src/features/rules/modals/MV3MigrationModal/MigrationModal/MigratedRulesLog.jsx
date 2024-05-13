import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
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

const MigratedRules = () => {
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const getMigratedRulesFromLocalStorage = useCallback(() => {
    const migratedRules = localStorage.getItem("migratedToMV3");
    const localStorageRulesObject = migratedRules ? JSON.parse(migratedRules) : {};
    const migrationLogs = localStorageRulesObject?.[currentlyActiveWorkspace?.id];
    if (migrationLogs?.rulesMigrated) return migrationLogs.rulesMigrationLogs;
    return [];
  }, [currentlyActiveWorkspace]);

  const migratedRules = getMigratedRulesFromLocalStorage();

  const [showMigrationLogs, setShowMigrationLogs] = useState(migratedRules?.length);

  const MigratedRuleTile = ({ migrateRuleEntry }) => {
    const navigate = useNavigate();
    const appMode = useSelector(getAppMode);
    const [failedToFetchRule, setFailedToFetchRule] = useState(false);
    const [currentRule, setCurrentRule] = useState(null);
    useEffect(() => {
      if (!migrateRuleEntry || currentRule) return;
      StorageService(appMode)
        .getRecord(migrateRuleEntry.id)
        .then((rule) => {
          if (!rule) {
            setFailedToFetchRule(true);
            setShowMigrationLogs(false);
            return;
          } else {
            setCurrentRule(rule);
          }
        })
        .catch((err) => {
          console.error("Error while fetching rule", err);
          setFailedToFetchRule(true);
          setShowMigrationLogs(false);
        });
    }, [migrateRuleEntry, appMode, currentRule]);
    const handleOnClick = () => {
      redirectToRuleEditor(navigate, currentRule.id, "mv3_modal", true);
    };

    return failedToFetchRule ? undefined : currentRule ? (
      <div className="migrated-rules-item">
        <div className="migrated-rule-name" onClick={handleOnClick}>
          <RuleIcon ruleType={currentRule.ruleType} /> {currentRule.name} <RxExternalLink />
        </div>
        <ul>
          {migrateRuleEntry.migrationChanges.some((e) => e.type === "source_path_migrated") && (
            <li className="migrated-rule-description">Path contains changed to → Url contains.</li>
          )}
          {migrateRuleEntry.migrationChanges.some((e) => e.type === "source_pageUrl_migrated") && (
            <li className="migrated-rule-description">Page Url contains changed to → Page Domain contains.</li>
          )}
        </ul>
      </div>
    ) : null;
  };

  return showMigrationLogs ? (
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
        {migratedRules.map((rule, idx) => (
          <MigratedRuleTile migrateRuleEntry={rule} key={idx} />
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
