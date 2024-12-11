import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { useDispatch } from "react-redux";
import { isGroupsSanitizationPassed } from "components/features/rules/RulesIndexPage/actions";
import { recordsActions } from "store/features/rules/slice";
import { Group, RecordStatus, Rule } from "features/rules/types/rules";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import Logger from "../../../../../../../../../common/logger";
import { trackRulesListLoaded } from "features/rules/analytics";
import { migrateAllRulesToMV3 } from "modules/extension/utils";
import { sendIndividualRuleTypesCountAttributes } from "../utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RuleStorageModel, syncEngine } from "requestly-sync-engine";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";
import { getActiveWorkspaceId } from "features/workspaces/utils";
import { LocalStorageService } from "services/localStorageService";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

interface Props {
  setIsLoading: (isLoading: boolean) => void;
}

const useFetchAndUpdateRules = ({ setIsLoading }: Props) => {
  const appMode = useSelector(getAppMode);

  const userAuthDetails = useSelector(getUserAuthDetails);
  const userId = userAuthDetails.loggedIn && userAuthDetails.details?.profile?.uid;
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);
  const activeWorkspaceId = getActiveWorkspaceId(activeWorkspaceIds);

  const dispatch = useDispatch();

  const updateRulesAndGroups = useCallback(
    async (rules: Rule[], groups: Group[]) => {
      console.log("!!!debug", { groups, rules });
      //@ts-ignore
      rules = migrateAllRulesToMV3(rules, activeWorkspaceId);

      Logger.log("DBG: fetched data", JSON.stringify({ rules, groups }));

      // FIXME: This can be removed/improved. Move this logic to src/features
      const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed({ rules, groups, appMode });

      const finalRecords = [...isGroupsSanitizationPassedResult.updatedRules, ...groups];

      dispatch(recordsActions.setAllRecords(finalRecords));

      setIsLoading(false);

      // TODO: Cleanup
      //ANALYTICS

      // Remove sample rules and groups
      rules = rules.filter((rule) => !rule.isSample);
      groups = groups.filter((group) => !group.isSample);

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
      sendIndividualRuleTypesCountAttributes(rules);
      trackRulesListLoaded(rules.length, activeRulesCount, activePremiumRules.length, groups.length);
    },
    [appMode, dispatch, setIsLoading]
  );

  useEffect(() => {
    // let subscription: any;
    async function initRulesListener() {
      console.log("initRulesListener");
      // TODO-Syncing: This is a temporary solution to wait for the sync engine to initialize
      if (!syncEngine.initialized) {
        setTimeout(() => {
          initRulesListener();
        }, 1000);
        return;
      }
      // FIXME-syncing: Improvements Required
      console.log("subscribe RuleStorageModels", activeWorkspaceId);
      unsubscribe = await RuleStorageModel.subscribe(async (ruleStorageModels: RuleStorageModel[]) => {
        console.log("!!!debug", { ruleStorageModels });

        let rulesAndGroups = ruleStorageModels.map((ruleStorageModel) => {
          return ruleStorageModel.data;
        });
        let groups = rulesAndGroups.filter((val) => val.objectType === "group") as Group[];
        let rules = rulesAndGroups.filter((val) => val.objectType === "rule") as Rule[];
        updateRulesAndGroups(rules, groups);

        // TODO-syncing: THese are triggered multiple times
        await LocalStorageService(appMode).resetRulesAndGroups();
        await LocalStorageService(appMode).saveMultipleRulesOrGroups(rulesAndGroups);
      });
    }

    let unsubscribe: (() => void) | undefined;
    console.log("workspace changed", activeWorkspaceId, userId);
    initRulesListener();

    // Cleanup subscription on component unmount
    return () => {
      console.log("[Debug] Unsubbing explicit subscribers");
      unsubscribe?.();
    };
  }, [userId, activeWorkspaceId, appMode, updateRulesAndGroups]);
};

export default useFetchAndUpdateRules;
