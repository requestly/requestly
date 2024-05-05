import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getIsHardRefreshRulesPending, getIsRefreshRulesPending } from "store/selectors";
import { useHasChanged } from "hooks";
import { StorageService } from "init";
import { useDispatch } from "react-redux";
import { isGroupsSanitizationPassed } from "components/features/rules/RulesIndexPage/actions";
import { recordsActions } from "store/features/rules/slice";
import { Group, Rule, RecordStatus, RecordType } from "features/rules/types/rules";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import Logger from "../../../../../../../../../common/logger";
import { trackRulesListLoaded } from "features/rules/analytics";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

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
    Logger.log(
      "DBG: Fetching rules and groups triggered",
      JSON.stringify({ hasIsRulesListHardRefreshPendingChanged, isRulesListRefreshPending })
    );
    if (hasIsRulesListHardRefreshPendingChanged) {
      setIsLoading(true);
    }

    // FIXME: This can be fetched in one call. getRecords([RULE, GROUP]);
    const groupsPromise = StorageService(appMode).getRecords(RecordType.GROUP);
    const rulesPromise = StorageService(appMode).getRecords(RecordType.RULE);
    Promise.all([groupsPromise, rulesPromise])
      .then(async (data) => {
        const groups = data[0] as Group[];
        const rules = data[1] as Rule[];

        Logger.log("DBG: fetched data", JSON.stringify({ rules, groups }));

        // FIXME: This can be removed/improved. Move this logic to src/features
        const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed({ rules, groups, appMode });

        const finalRecords = [...isGroupsSanitizationPassedResult.updatedRules, ...groups];

        dispatch(recordsActions.setAllRecords(finalRecords));

        setIsLoading(false);

        // TODO: Cleanup
        //ANALYTICS

        Logger.log("DBG: submitting num_rules as - ", rules.length);

        const ruleTypes = rules.reduce((result, { ruleType }) => result.add(ruleType), new Set());
        const activePremiumRules = rules.filter(
          (rule) => rule.status === RecordStatus.ACTIVE && PREMIUM_RULE_TYPES.includes(rule.ruleType)
        );
        const numRuleTypes = parseInt(window.localStorage.getItem("num_rule_types") || "0");
        const activeRulesCount = rules.filter((rule) => rule.status === RecordStatus.ACTIVE).length;
        submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES_TRIED, Math.max(numRuleTypes, ruleTypes.size));
        submitAttrUtil(TRACKING.ATTR.NUM_RULES, rules.length);
        submitAttrUtil(TRACKING.ATTR.NUM_PREMIUM_ACTIVE_RULES, activePremiumRules.length);
        submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES, ruleTypes.size);
        window.localStorage.setItem("num_rule_types", JSON.stringify(ruleTypes.size));
        submitAttrUtil(TRACKING.ATTR.NUM_ACTIVE_RULES, activeRulesCount);
        submitAttrUtil(TRACKING.ATTR.NUM_GROUPS, groups.length);
        submitAttrUtil(TRACKING.ATTR.NUM_RULES_PINNED, rules.filter((rule) => rule.isFavourite).length);
        submitAttrUtil(
          TRACKING.ATTR.NUM_ACTIVE_GROUPS,
          groups.filter((group) => group.status === RecordStatus.ACTIVE).length
        );
        trackRulesListLoaded(rules.length, activeRulesCount, activePremiumRules.length, groups.length);
      })
      .catch((err) => {
        Logger.error("DBG: Error in fetching rules and groups", err);
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
