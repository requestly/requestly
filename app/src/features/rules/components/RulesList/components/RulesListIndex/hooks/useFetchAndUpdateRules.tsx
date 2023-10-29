import { useEffect } from "react";
import { useSelector } from "react-redux";

// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getAppMode, getIsHardRefreshRulesPending, getIsRefreshRulesPending } from "store/selectors";
import { useHasChanged } from "hooks";
import { StorageService } from "init";
import { useDispatch } from "react-redux";
import { isGroupsSanitizationPassed } from "components/features/rules/RulesIndexPage/actions";
import { rulesActions } from "store/features/rules/slice";

interface Props {
  setIsLoading: (isLoading: boolean) => void;
}

const useFetchAndUpdateRules = ({ setIsLoading }: Props) => {
  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const isRulesListHardRefreshPending = useSelector(getIsHardRefreshRulesPending);
  const hasIsRulesListRefreshPendingChanged = useHasChanged(isRulesListRefreshPending);
  const hasIsRulesListHardRefreshPendingChanged = useHasChanged(isRulesListHardRefreshPending);

  const dispatch = useDispatch();

  useEffect(() => {
    if (hasIsRulesListHardRefreshPendingChanged) {
      setIsLoading(true);
    }

    // FIXME: This can be fetched in one call. getRecords([RULE, GROUP]);
    const groupsPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP);
    const rulesPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);
    Promise.all([groupsPromise, rulesPromise]).then(async (data) => {
      const groups = data[0];
      const rules = data[1];

      // FIXME: This can be removed/improved. Move this logic to src/features
      const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed({ rules, groups, appMode });

      const finalRuleObjs = [...isGroupsSanitizationPassedResult.updatedRules, ...groups];

      if (isGroupsSanitizationPassedResult.success === false) {
        // Sanitization has updated the storage! but we dont need to fetch again as we have the updated copy
        dispatch(rulesActions.ruleObjsSetAll(finalRuleObjs));
      } else {
        // Sanitization required doing nothing, so continue as it is
        dispatch(rulesActions.ruleObjsSetAll(finalRuleObjs));
      }

      setIsLoading(false);

      // TODO: Cleanup
      //ANALYTICS
      // const ruleTypes = rules.reduce((result, { ruleType }) => result.add(ruleType), new Set());
      // const numRuleTypes = window.localStorage.getItem("num_rule_types") || 0;
      // submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES_TRIED, Math.max(numRuleTypes, ruleTypes.size));
      // submitAttrUtil(TRACKING.ATTR.NUM_RULES, rules.length);
      // submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES, ruleTypes.size);
      // window.localStorage.setItem("num_rule_types", ruleTypes.size);
      // submitAttrUtil(
      //   TRACKING.ATTR.NUM_ACTIVE_RULES,
      //   rules.filter((rule) => rule.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE).length
      // );
      // submitAttrUtil(TRACKING.ATTR.NUM_GROUPS, groups.length);
      // submitAttrUtil(
      //   TRACKING.ATTR.NUM_ACTIVE_GROUPS,
      //   groups.filter((group) => group.status === GLOBAL_CONSTANTS.GROUP_STATUS.ACTIVE).length
      // );
    });
  }, [
    dispatch,
    setIsLoading,
    isRulesListRefreshPending,
    appMode,
    hasIsRulesListRefreshPendingChanged,
    hasIsRulesListHardRefreshPendingChanged,
  ]);
};

export default useFetchAndUpdateRules;
