import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import React, { useMemo } from "react";
import { TestThisRule } from "components/features/rules/TestThisRule";
import { BottomSheet } from "componentsV2/BottomSheet";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import FEATURES from "config/constants/sub/features";
import APP_CONSTANTS from "config/constants";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS } from "components/misc/ProductWalkthrough/constants";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { SUB_TOUR_TYPES, TOUR_TYPES } from "components/misc/ProductWalkthrough/types";

interface RuleEditorBottomSheetProps {
  mode: string;
}

export const RuleEditorBottomSheet: React.FC<RuleEditorBottomSheetProps> = ({ mode }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isSampleRule = currentlySelectedRuleData?.isSample;

  const BOTTOM_SHEET_TAB_KEYS = {
    TEST_RULE: "TEST_RULE",
  };
  const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;

  const bottomSheetTabItems = useMemo(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) return [];
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
  }, [BOTTOM_SHEET_TAB_KEYS.TEST_RULE, appMode]);

  return isSampleRule ? null : (
    <>
      {mode === RULE_EDITOR_CONFIG.MODES.EDIT && isFeatureCompatible(FEATURES.TEST_THIS_RULE) && (
        <>
          <ProductWalkthrough
            completeTourOnUnmount={false}
            tourFor={MISC_TOURS.APP_ENGAGEMENT.TEST_THIS_RULE}
            onTourComplete={() => {
              dispatch(
                globalActions.updateProductTourCompleted({
                  tour: TOUR_TYPES.MISCELLANEOUS,
                  subTour: SUB_TOUR_TYPES.TEST_THIS_RULE,
                })
              );
            }}
          />

          <BottomSheet
            items={bottomSheetTabItems}
            defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.TEST_RULE}
            tourId={MISC_TOURS.APP_ENGAGEMENT.TEST_THIS_RULE}
          />
        </>
      )}
    </>
  );
};
