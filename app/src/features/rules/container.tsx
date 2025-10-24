import { Outlet } from "react-router-dom";
import { RulesSidebar } from "./components/RulesSidebar/RulesSidebar";
import { RulesContextProvider } from "./context";
import { CreateNewRuleGroupModalWrapper } from "./modals/CreateNewRuleGroupModalWrapper";
import { ImportRulesModalWrapper } from "./modals/ImportRulesModal/ImportRulesModalWrapper";
import { ChangeRuleGroupModalWrapper } from "./modals/ChangeRuleGroupModalWrapper";
import { DeleteRecordsModalWrapper } from "./modals/DeleteRecordsModalWrapper";
import { DuplicateRecordModalWrapper } from "./modals/DuplicateRuleModalWrapper";
import { UngroupOrDeleteRulesModalWrapper } from "./modals/UngroupOrDeleteRulesModalWrapper";
import { RenameGroupModalWrapper } from "./modals/RenameGroupModalWrapper";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";

import "./container.scss";
import { useEffect } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { Row, notification } from "antd";
import PATHS from "config/constants/sub/paths";
import { trackErrorInSavingDNR } from "modules/analytics/events/common/rules";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { LocalFirstComingSoon } from "componentsV2/Nudge/views/LocalFirstComingSoon/LocalFirstComingSoon";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const RulesFeatureContainer = () => {
  const appMode = useSelector(getAppMode);
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener("ruleSaveError", (message: any) => {
      notification.warn({
        message: (
          <span className="text-bold">
            {"Error saving rule: "}
            <a href={PATHS.RULE_EDITOR.ABSOLUTE + `/edit/${message.rqRuleId}`} target="_blank" rel="noreferrer">
              {message.rqRuleId}
            </a>
          </span>
        ),
        description: (
          <div>
            <Row className="text-gray">
              {message.error?.match(
                /Rule with id \d+ was skipped as the "regexFilter" value exceeded the 2KB memory.*/
              ) ? (
                <span>
                  Due to Chrome API(MV3) limitations, rules can't be greater than 2KB. Please try a solution mentioned{" "}
                  <a href="https://github.com/requestly/requestly/issues/1797" target="_blank" rel="noreferrer">
                    here.
                  </a>
                </span>
              ) : message.error?.match(
                  /Rule with id \d+ specifies an incorrect value for the "action.redirect.regexSubstitution" key/
                ) ? (
                <span>The rule has an invalid value for regex substitution. Please check the rule.</span>
              ) : (
                "Please contact support."
              )}
            </Row>
          </div>
        ),
        placement: "bottomLeft",
        duration: 0,
      });
      console.log(`[Requestly]: Error saving rule - ${message.error}`);
      clientRuleStorageService.getRecordById(message.rqRuleId).then((ruleDetails) => {
        const sourceCondition = ruleDetails?.pairs?.[0]?.source;
        trackErrorInSavingDNR({
          rule_type: message.rqRuleId?.split("_")?.[0],
          rule_id: message.rqRuleId,
          error: message.error.replace(/Rule with id \d+/g, "Rule with id"),
          is_migration_triggered: window.location.search.includes("updatedToMv3"),
          source_key: sourceCondition?.key,
          source_operator: sourceCondition?.operator,
          source_value: sourceCondition?.value,
          page_path: window.location.pathname + window.location.search,
        });
      });
    });
  }, [appMode]);

  if (isLocalSyncEnabled) {
    return (
      <LocalFirstComingSoon
        featureName="HTTP Rules"
        featureDescription="HTTP rules are powerful and open-source debugging tool to intercept & modify network requests, headers, API requests, inject scripts & much more—all in one place."
      />
    );
  }

  return (
    <SecondarySidebarLayout secondarySidebar={<RulesSidebar />}>
      <RulesContextProvider>
        <>
          <RenameGroupModalWrapper />
          <UngroupOrDeleteRulesModalWrapper />
          <DuplicateRecordModalWrapper />
          <ImportRulesModalWrapper />
          <ChangeRuleGroupModalWrapper />
          <CreateNewRuleGroupModalWrapper />
          <DeleteRecordsModalWrapper />
          <Outlet />
        </>
      </RulesContextProvider>
    </SecondarySidebarLayout>
  );
};

export default RulesFeatureContainer;
