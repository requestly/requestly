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

const RulesFeatureContainer = () => {
  useEffect(() => {
    PageScriptMessageHandler.addMessageListener("ruleSaveError", (message: any) => {
      notification.error({
        message: <span className="text-bold">{"Error saving rule"}</span>,
        description: (
          <div>
            <Row>
              {`There was as an error while saving the rule:`}
              <a href={PATHS.RULE_EDITOR.ABSOLUTE + `/edit/${message.rqRuleId}`}>{message.rqRuleId}</a>
            </Row>
            <Row className="text-gray">Please contact support.</Row>
          </div>
        ),
        placement: "bottomLeft",
        duration: 0,
      });
      console.log(`[Requestly]: Error saving rule - ${message.error}`);
      trackErrorInSavingDNR(message.error, message.rqRuleId.split("_")[0], message.rqRuleId);
    });
  }, []);

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
