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

const RulesFeatureContainer = () => {
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
