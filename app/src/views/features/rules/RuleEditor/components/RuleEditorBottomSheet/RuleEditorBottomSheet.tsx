import React, { useEffect, useMemo } from "react";
import { TestThisRule } from "components/features/rules/TestThisRule";
import { BottomSheet } from "componentsV2/BottomSheet";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import FEATURES from "config/constants/sub/features";
import APP_CONSTANTS from "config/constants";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

interface RuleEditorBottomSheetProps {
  mode: string;
}

export const RuleEditorBottomSheet: React.FC<RuleEditorBottomSheetProps> = ({ mode }) => {
  // const [newTestThisRuleReport, setNewTestThisRuleReport] = useState(null);
  const BOTTOM_SHEET_TAB_KEYS = {
    TEST_RULE: "TEST_RULE",
  };
  const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;

  const bottomSheetTabItems = useMemo(() => {
    return [
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RULE,
        label: (
          <div className="bottom-sheet-tab">
            <MdOutlineScience />
            <span>Test</span>
          </div>
        ),
        children: <TestThisRule />,
        forceRender: true,
      },
    ];
  }, [BOTTOM_SHEET_TAB_KEYS.TEST_RULE]);

  console.log("TEST LOG");

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string; testPageTabId: string; record: boolean; appliedStatus: boolean }) => {
        console.log("Test Rule Report Updated", message);
      }
    );
  }, []);

  return (
    <>
      {mode === RULE_EDITOR_CONFIG.MODES.EDIT && isFeatureCompatible(FEATURES.TEST_THIS_RULE) && (
        <BottomSheet defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.TEST_RULE} items={bottomSheetTabItems} />
      )}
    </>
  );
};
