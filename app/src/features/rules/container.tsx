import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { RulesSidebar } from "./components/RulesSidebar/RulesSidebar";
import { RulesContextProvider } from "./context";
import { CreateNewRuleGroupModalWrapper } from "./modals/CreateNewRuleGroupModalWrapper";
import { ImportRulesModalWrapper } from "./modals/ImportRulesModal/ImportRulesModalWrapper";
import { ChangeRuleGroupModalWrapper } from "./modals/ChangeRuleGroupModalWrapper";
import { DeleteRecordsModalWrapper } from "./modals/DeleteRecordsModalWrapper";
import { DuplicateRuleModalWrapper } from "./modals/DuplicateRuleModalWrapper";
import { UngroupOrDeleteRulesModalWrapper } from "./modals/UngroupOrDeleteRulesModalWrapper";
import { RenameGroupModalWrapper } from "./modals/RenameGroupModalWrapper";

const RulesFeatureContainer = () => {
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);
  return (
    <div className="parent-container">
      {!isSecondarySidebarCollapsed && (
        <div className="secondary-sidebar-container">
          <RulesSidebar />
        </div>
      )}
      <div className="outlet-container">
        <RulesContextProvider>
          <>
            <RenameGroupModalWrapper />
            <UngroupOrDeleteRulesModalWrapper />
            <DuplicateRuleModalWrapper />
            <ImportRulesModalWrapper />
            <ChangeRuleGroupModalWrapper />
            <CreateNewRuleGroupModalWrapper />
            <DeleteRecordsModalWrapper />
            <Outlet />
          </>
        </RulesContextProvider>
      </div>
    </div>
  );
};

export default RulesFeatureContainer;
