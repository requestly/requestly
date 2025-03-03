import React from "react";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { RQButton } from "lib/design-system-v2/components";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { useLocation } from "react-router-dom";
import RULE_EDITOR_CONFIG from "config/constants/sub/rule-editor";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { RBAC, useRBAC } from "features/rbac";
import "./index.scss";

export const TestRuleButton: React.FC = () => {
  const location = useLocation();
  const { toggleBottomSheet, sheetPlacement } = useBottomSheetContext();
  const { validatePermission } = useRBAC(RBAC.Resource.http_rule);
  const { isValid: isValidPermission } = validatePermission(RBAC.Permission.create);

  const MODE = getModeData(location).MODE;

  if (isFeatureCompatible(FEATURES.TEST_THIS_RULE)) {
    return (
      <RQButton
        disabled={MODE !== RULE_EDITOR_CONFIG.MODES.EDIT}
        className="header-test-rule-btn"
        type={isValidPermission ? "transparent" : "primary"}
        icon={<MdOutlineScience />}
        onClick={() => {
          if (sheetPlacement === BottomSheetPlacement.BOTTOM) {
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
