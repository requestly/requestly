import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
//Components
import MigrationCheckModal from "../../../misc/MigrationCheckModal";
import StorageMigrationCheckModal from "components/misc/StorageMigrationCheckModal";
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
  getIsHardRefreshRulesPending,
  getIsRulesListLoading,
  getAllGroups,
} from "../../../../store/selectors";
import { isGroupsSanitizationPassed } from "./actions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import CreateTeamRuleCTA from "../CreateTeamRuleCTA";
import GettingStarted from "../GettingStarted";
import Logger from "lib/logger";

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
    }, [value]);
    return ref.current;
  };

  //Global State
  const dispatch = useDispatch();
  const rules = useSelector(getAllRules);
  const groups = useSelector(getAllGroups);
  const isRulesListHardRefreshPending = useSelector(getIsHardRefreshRulesPending);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isRulesListLoading = useSelector(getIsRulesListLoading);

  //Component State
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSyncAndRecordsLoading, setIsSyncAndRecordsLoading] = useState(false);
  const hasIsRulesListHardRefreshPendingChanged = useHasChanged(isRulesListHardRefreshPending);

  useEffect(() => {
    if (hasIsRulesListHardRefreshPendingChanged) setIsTableLoading(true);

    if (isRulesListLoading) setIsSyncAndRecordsLoading(true);

    Logger.log("Reading storage in RulesIndexPage useEffect");
    const groupsPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP);
    Logger.log("Reading storage in RulesIndexPage useEffect");
    const rulesPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);

    Promise.all([groupsPromise, rulesPromise]).then(async (data) => {
      const groups = data[0];
      const rules = data[1];

      const isGroupsSanitizationPassedResult = await isGroupsSanitizationPassed({ rules, groups, appMode });

      dispatch(
        actions.updateRulesAndGroups({
          rules: isGroupsSanitizationPassedResult.updatedRules,
          groups,
        })
      );

      setIsTableLoading(false);
      if (!isRulesListLoading) setIsSyncAndRecordsLoading(false);

      const ruleTypes = rules.reduce((result, { ruleType }) => result.add(ruleType), new Set());

      //ANALYTICS
      const numRuleTypes = window.localStorage.getItem("num_rule_types") || 0;
      submitAttrUtil(TRACKING.ATTR.NUM_RULE_TYPES_TRIED, Math.max(numRuleTypes, ruleTypes.size));
      submitAttrUtil(TRACKING.ATTR.NUM_RULES, rules.length);
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
    });
  }, [appMode, dispatch, isRulesListLoading, hasIsRulesListHardRefreshPendingChanged]);

  const CreateFirstRule = () => {
    if (isWorkspaceMode) return <CreateTeamRuleCTA />;
    return <GettingStarted />;
  };

  return (
    <React.Fragment>
      <MigrationCheckModal />
      <StorageMigrationCheckModal />
      {isRulesListLoading || isSyncAndRecordsLoading ? (
        <>
          <br /> <SpinnerColumn message="Getting your rules ready" skeletonType="list" />
        </>
      ) : rules?.length > 0 || groups?.length > 0 ? (
        <RulesListContainer isTableLoading={isTableLoading} />
      ) : (
        <CreateFirstRule />
      )}
    </React.Fragment>
  );
};
export default RulesIndexPage;
