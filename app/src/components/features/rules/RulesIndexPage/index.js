import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
//Components
import RulesListContainer from "../RulesListContainer";
import SpinnerColumn from "../../../misc/SpinnerColumn";
//Externals
import { StorageService } from "../../../../init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
//REDUCER ACTIONS
import { actions } from "../../../../store";
//UTILS
import { submitAttrUtil } from "../../../../utils/AnalyticsUtils";
import {
  getAllRules,
  getAppMode,
  getIsRefreshRulesPending,
  getIsHardRefreshRulesPending,
  getIsRulesListLoading,
  getAllGroups,
} from "../../../../store/selectors";
import { isGroupsSanitizationPassed } from "./actions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import CreateTeamRuleCTA from "../CreateTeamRuleCTA";
import GettingStarted from "../GettingStarted";
import Logger from "lib/logger";
import { useHasChanged } from "hooks";
import MonitorMountedTime from "components/common/SentryMonitoring/MonitorMountedTime";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const RulesIndexPage = () => {
  //Global State
  const dispatch = useDispatch();
  const allRules = useSelector(getAllRules);
  const allGroups = useSelector(getAllGroups);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const isRulesListHardRefreshPending = useSelector(getIsHardRefreshRulesPending);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isRulesListLoading = useSelector(getIsRulesListLoading);

  //Component State
  const [fetchRulesAndGroupsComplete, setFetchRulesAndGroupsComplete] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const hasIsRulesListRefreshPendingChanged = useHasChanged(isRulesListRefreshPending);
  const hasIsRulesListHardRefreshPendingChanged = useHasChanged(isRulesListHardRefreshPending);

  useEffect(() => {
    if (hasIsRulesListHardRefreshPendingChanged) setIsTableLoading(true);
    Logger.log("Reading storage in RulesIndexPage useEffect");
    const groupsPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP);
    Logger.log("Reading storage in RulesIndexPage useEffect");
    const rulesPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);
    Promise.all([groupsPromise, rulesPromise])
      .then(async (data) => {
        const groups = data[0];
        const rules = data[1];

        const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed({ rules, groups, appMode });

        if (isGroupsSanitizationPassedResult.success === false) {
          // Sanitization has updated the storage! but we dont need to fetch again as we have the updated copy
          stableDispatch(
            actions.updateRulesAndGroups({
              rules: isGroupsSanitizationPassedResult.updatedRules,
              groups,
            })
          );
        } else {
          // Sanitization required doing nothing, so continue as it is
          stableDispatch(
            actions.updateRulesAndGroups({
              rules: isGroupsSanitizationPassedResult.updatedRules,
              groups,
            })
          );
        }

        if (!fetchRulesAndGroupsComplete) setFetchRulesAndGroupsComplete(true);
        setIsTableLoading(false);

        const ruleTypes = rules.reduce((result, { ruleType }) => result.add(ruleType), new Set());
        const activePremiumRules = rules.filter(
          (rule) => rule.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE && PREMIUM_RULE_TYPES.includes(rule.ruleType)
        );
        //ANALYTICS
        const numRuleTypes = window.localStorage.getItem("num_rule_types") ?? 0;
        submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES_TRIED, Math.max(numRuleTypes, ruleTypes.size));
        submitAttrUtil(TRACKING.ATTR.NUM_RULES, rules.length);
        submitAttrUtil(TRACKING.ATTR.NUM_PREMIUM_ACTIVE_RULES, activePremiumRules.length);
        submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES, ruleTypes.size);
        window.localStorage.setItem("num_rule_types", ruleTypes.size);
        submitAttrUtil(
          TRACKING.ATTR.NUM_ACTIVE_RULES,
          rules.filter((rule) => rule.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE).length
        );
        submitAttrUtil(TRACKING.ATTR.NUM_GROUPS, groups.length);
        submitAttrUtil(
          TRACKING.ATTR.NUM_ACTIVE_GROUPS,
          groups.filter((group) => group.status === GLOBAL_CONSTANTS.GROUP_STATUS.ACTIVE).length
        );
      })
      .catch((err) => {
        Logger.log(err);
      });
  }, [
    stableDispatch,
    isRulesListRefreshPending,
    appMode,
    fetchRulesAndGroupsComplete,
    hasIsRulesListRefreshPendingChanged,
    hasIsRulesListHardRefreshPendingChanged,
  ]);

  const CreateFirstRule = () => {
    if (isWorkspaceMode) return <CreateTeamRuleCTA />;
    return <GettingStarted />;
  };

  console.log("!!!debug", "rulesIndexPage exact");

  return (
    <React.Fragment>
      {fetchRulesAndGroupsComplete && !isRulesListLoading ? (
        allRules?.length > 0 || allGroups?.length > 0 ? (
          <RulesListContainer isTableLoading={isTableLoading} />
        ) : (
          <CreateFirstRule />
        )
      ) : (
        <>
          <MonitorMountedTime transactionName="rules-list-loading" />
          <br /> <SpinnerColumn message="Getting your rules ready" skeletonType="list" />
        </>
      )}
    </React.Fragment>
  );
};
export default RulesIndexPage;
