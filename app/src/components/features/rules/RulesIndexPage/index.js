import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
//Components
import MigrationCheckModal from "../../../misc/MigrationCheckModal";
import StorageMigrationCheckModal from "components/misc/StorageMigrationCheckModal";
import RulesListContainer from "../RulesListContainer";
import SpinnerCard from "../../../misc/SpinnerCard";
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
} from "../../../../store/selectors";
import { isGroupsSanitizationPassed } from "./actions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import CreateTeamRuleCTA from "../CreateTeamRuleCTA";
import GettingStarted from "../GettingStarted";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const RulesIndexPage = () => {
  const useHasChanged = (val) => {
    const prevVal = usePrevious(val);
    return prevVal !== val;
  };

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  //Global State
  const dispatch = useDispatch();
  const rules = useSelector(getAllRules);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const isRulesListHardRefreshPending = useSelector(
    getIsHardRefreshRulesPending
  );
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  //Component State
  const [
    fetchRulesAndGroupsComplete,
    setFetchRulesAndGroupsComplete,
  ] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const hasIsRulesListRefreshPendingChanged = useHasChanged(
    isRulesListRefreshPending
  );
  const hasIsRulesListHardRefreshPendingChanged = useHasChanged(
    isRulesListHardRefreshPending
  );

  useEffect(() => {
    if (hasIsRulesListHardRefreshPendingChanged) setIsTableLoading(true);
    const groupsPromise = StorageService(appMode).getRecords(
      GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP
    );
    const rulesPromise = StorageService(appMode).getRecords(
      GLOBAL_CONSTANTS.OBJECT_TYPES.RULE
    );
    Promise.all([groupsPromise, rulesPromise]).then(async (data) => {
      const groups = data[0];
      const rules = data[1];

      const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed(
        { rules, groups, appMode }
      );

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

      const ruleTypes = rules.reduce(
        (result, { ruleType }) => result.add(ruleType),
        new Set()
      );

      //ANALYTICS
      submitAttrUtil(TRACKING.ATTR.NUM_RULES, rules.length);
      submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES, ruleTypes.size);
      window.localStorage.setItem("num_rule_types", ruleTypes.size);
      submitAttrUtil(
        TRACKING.ATTR.NUM_ACTIVE_RULES,
        rules.filter(
          (rule) => rule.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
        ).length
      );
      submitAttrUtil(TRACKING.ATTR.NUM_GROUPS, groups.length);
      submitAttrUtil(
        TRACKING.ATTR.NUM_ACTIVE_GROUPS,
        groups.filter(
          (group) => group.status === GLOBAL_CONSTANTS.GROUP_STATUS.ACTIVE
        ).length
      );
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

  return (
    <React.Fragment>
      <MigrationCheckModal />
      <StorageMigrationCheckModal />
      {fetchRulesAndGroupsComplete ? (
        rules.length !== 0 ? (
          <RulesListContainer isTableLoading={isTableLoading} />
        ) : (
          <CreateFirstRule />
        )
      ) : (
        <SpinnerCard customLoadingMessage="Loading Rules" skeletonType="list" />
      )}
    </React.Fragment>
  );
};
export default RulesIndexPage;
