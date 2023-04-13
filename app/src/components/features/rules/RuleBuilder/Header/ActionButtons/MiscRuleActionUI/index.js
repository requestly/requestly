import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import RedirectRuleMiscUI from "./RedirectRuleMiscUI";

const MiscRuleConfigAction = ({ location }) => {
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  switch (currentlySelectedRuleConfig.TYPE) {
    case GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT:
      return <RedirectRuleMiscUI location={location} />;

    default:
      return null;
  }
};
export default MiscRuleConfigAction;
