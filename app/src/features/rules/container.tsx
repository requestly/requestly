import { Outlet } from "react-router-dom";
import { RulesSidebar } from "./components/RulesSidebar/RulesSidebar";
import { RulesContextProvider } from "./context";
import { CreateNewRuleGroupModalWrapper } from "./modals/CreateNewRuleGroupModalWrapper";
import { ImportRulesModalWrapper } from "./modals/ImportRulesModal/ImportRulesModalWrapper";
import { ChangeRuleGroupModalWrapper } from "./modals/ChangeRuleGroupModalWrapper";
import { DeleteRecordsModalWrapper } from "./modals/DeleteRecordsModalWrapper";
import { DuplicateRuleModalWrapper } from "./modals/DuplicateRuleModalWrapper";
import { UngroupOrDeleteRulesModalWrapper } from "./modals/UngroupOrDeleteRulesModalWrapper";
import { RenameGroupModalWrapper } from "./modals/RenameGroupModalWrapper";
import { MV3MigrationModal, NotificationCard } from "./modals/MV3MigrationModal";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";

import "./container.scss";
import { useEffect } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { Row, notification } from "antd";
import PATHS from "config/constants/sub/paths";
import { trackErrorInSavingDNR } from "modules/analytics/events/common/rules";
import { useSelector } from "react-redux";
import { StorageService } from "init";
import { getAppMode } from "store/selectors";

const RulesFeatureContainer = () => {
  const appMode = useSelector(getAppMode);

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
              {message.error.match(
                /Rule with id \d+ was skipped as the "regexFilter" value exceeded the 2KB memory.*/
              ) ? (
                <span>
                  We are facing some limitations due to chrome API changes. Please try the solution mentioned{" "}
                  <a href="https://github.com/requestly/requestly/issues/1797" target="_blank" rel="noreferrer">
                    here.
                  </a>
                </span>
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
      StorageService(appMode)
        .getRecord(message.rqRuleId)
        .then((ruleDetails) => {
          const sourceCondition = ruleDetails?.pairs?.[0]?.source;
          trackErrorInSavingDNR({
            rule_type: message.rqRuleId.split("_")[0],
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

  return (
    <SecondarySidebarLayout secondarySidebar={<RulesSidebar />}>
      <RulesContextProvider>
        <>
          <RenameGroupModalWrapper />
          <UngroupOrDeleteRulesModalWrapper />
          <DuplicateRuleModalWrapper />
          <ImportRulesModalWrapper />
          <ChangeRuleGroupModalWrapper />
          <CreateNewRuleGroupModalWrapper />
          <DeleteRecordsModalWrapper />
          <MV3MigrationModal />
          <NotificationCard />
          <Outlet />
        </>
      </RulesContextProvider>
    </SecondarySidebarLayout>
  );
};

export default RulesFeatureContainer;
