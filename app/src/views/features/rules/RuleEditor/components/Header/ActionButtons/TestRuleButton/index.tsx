import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { RQButton } from "lib/design-system/components";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { useLocation } from "react-router-dom";
import RULE_EDITOR_CONFIG from "config/constants/sub/rule-editor";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import "./index.scss";

export const TestRuleButton = () => {
  const location = useLocation();
  const { toggleBottomSheet, isSheetPlacedAtBottom } = useBottomSheetContext();

  const MODE = getModeData(location).MODE;

  if (isFeatureCompatible(FEATURES.TEST_THIS_RULE)) {
    return (
      <RQButton
        disabled={MODE !== RULE_EDITOR_CONFIG.MODES.EDIT}
        className="header-test-rule-btn"
        type="text"
        icon={<MdOutlineScience />}
        onClick={() => {
          if (isSheetPlacedAtBottom) {
            toggleBottomSheet();
          }
        }}
      >
        Test
      </RQButton>
    );
  }

  return null;
};
