import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import isEmpty from "is-empty";
import { Col, Row } from "antd";
import { globalActions } from "store/slices/global/slice";
import Body from "./Body";
import ChangeRuleGroupModal from "../ChangeRuleGroupModal";
import SpinnerCard from "../../../misc/SpinnerCard";
import APP_CONSTANTS from "../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import {
  cleanup,
  getModeData,
  setCurrentlySelectedRule,
  initiateBlankCurrentlySelectedRule,
  setCurrentlySelectedRuleConfig,
} from "./actions";
import {
  getAppMode,
  getAllRules,
  getCurrentlySelectedRuleData,
  getCurrentlySelectedRuleConfig,
  getIsCurrentlySelectedRuleDetailsPanelShown,
} from "../../../../store/selectors";
import * as RedirectionUtils from "../../../../utils/RedirectionUtils";
import useExternalRuleCreation from "./useExternalRuleCreation";
import Logger from "lib/logger";
import { trackDesktopRuleViewedOnExtension, trackDocsSidebarViewed } from "modules/analytics/events/common/rules";
import { getRuleConfigInEditMode, isDesktopOnlyRule } from "utils/rules/misc";
import { useHasChanged } from "hooks";
import { m } from "framer-motion";
import { RuleDetailsPanel } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";
import { RuleEditorMode } from "features/rules";
import { RULE_DETAILS } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/constants";
import { sampleRuleDetails } from "features/rules/screens/rulesList/components/RulesList/constants";
import "./RuleBuilder.css";
import clientRuleStorageService from "services/clientStorageService/features/rule";
import { RecordType } from "@requestly/shared/types/entities/rules";

//CONSTANTS
const { RULE_EDITOR_CONFIG, RULE_TYPES_CONFIG } = APP_CONSTANTS;

const RuleBuilder = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ruleGroupId = searchParams.get("groupId") ?? undefined;
  const { MODE, RULE_TYPE_TO_CREATE, RULE_TO_EDIT_ID } = getModeData(location, props.isSharedListViewRule);

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const isDetailsPanelShown = useSelector(getIsCurrentlySelectedRuleDetailsPanelShown);

  const allRules = useSelector(getAllRules);
  const appMode = useSelector(getAppMode);

  const isSampleRule = currentlySelectedRuleData?.isSample;
  const isReadOnly = currentlySelectedRuleData?.isReadOnly;

  const enableDocs = useMemo(() => {
    return !props.isSharedListViewRule;
  }, [props.isSharedListViewRule]);

  //References
  const isCleaningUpRef = useRef(false);
  //Component State
  const [fetchAllRulesComplete, setFetchAllRulesComplete] = useState(false);
  const [isChangeRuleGroupModalActive, setIsChangeRuleGroupModalActive] = useState(false);
  const [showDocs] = useState(false);
  const isDocsVisible = useMemo(() => {
    return enableDocs && showDocs;
  }, [enableDocs, showDocs]);

  useExternalRuleCreation(MODE);

  useEffect(() => {
    if (isDocsVisible) {
      trackDocsSidebarViewed(currentlySelectedRuleData.ruleType);
    }
  }, [isDocsVisible, currentlySelectedRuleData.ruleType]);

  const hasRuleToEditIdChanged = useHasChanged(RULE_TO_EDIT_ID);

  const toggleChangeRuleGroupModal = () => {
    setIsChangeRuleGroupModalActive(isChangeRuleGroupModalActive ? false : true);
  };

  const stableSetCurrentlySelectedRuleConfig = useCallback(setCurrentlySelectedRuleConfig, [
    setCurrentlySelectedRuleConfig,
  ]);

  const stableSetCurrentlySelectedRule = useCallback(setCurrentlySelectedRule, [setCurrentlySelectedRule]);

  const stableInitiateBlankCurrentlySelectedRule = useCallback(initiateBlankCurrentlySelectedRule, [
    currentlySelectedRuleConfig,
  ]);

  useEffect(() => {
    if (
      currentlySelectedRuleData === false ||
      (MODE === RULE_EDITOR_CONFIG.MODES.CREATE && currentlySelectedRuleData.ruleType !== RULE_TYPE_TO_CREATE) ||
      (MODE === RULE_EDITOR_CONFIG.MODES.CREATE && currentlySelectedRuleConfig.TYPE !== RULE_TYPE_TO_CREATE) ||
      (MODE === RULE_EDITOR_CONFIG.MODES.CREATE &&
        currentlySelectedRuleConfig.TYPE !== currentlySelectedRuleData.ruleType)
    ) {
      if (MODE === RULE_EDITOR_CONFIG.MODES.CREATE) {
        stableInitiateBlankCurrentlySelectedRule(
          dispatch,
          RULE_TYPES_CONFIG[RULE_TYPE_TO_CREATE],
          RULE_TYPE_TO_CREATE,
          setCurrentlySelectedRule,
          ruleGroupId
        );
        stableSetCurrentlySelectedRuleConfig(dispatch, RULE_TYPES_CONFIG[RULE_TYPE_TO_CREATE], navigate);
      } else if (MODE === RULE_EDITOR_CONFIG.MODES.EDIT) {
        Logger.log("Reading to storage in RuleBuilder");
        clientRuleStorageService.getRecordById(RULE_TO_EDIT_ID).then((rule) => {
          if (rule === undefined) {
            RedirectionUtils.redirectTo404(navigate);
          } else {
            //Prevent updating state when component is about to unmount
            if (!isCleaningUpRef.current) {
              stableSetCurrentlySelectedRule(dispatch, rule);
              stableSetCurrentlySelectedRuleConfig(dispatch, getRuleConfigInEditMode(rule), navigate);
            }
          }
        });
      } else if (MODE === RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW) {
        //View only
        if (props.rule) {
          //Prevent updating state when component is about to unmount
          if (!isCleaningUpRef.current) {
            stableSetCurrentlySelectedRule(dispatch, props.rule);
            stableSetCurrentlySelectedRuleConfig(dispatch, RULE_TYPES_CONFIG[props.rule.ruleType], navigate);
          }
        }
      } else {
        RedirectionUtils.redirectTo404(navigate);
      }
    }
  }, [
    currentlySelectedRuleConfig,
    currentlySelectedRuleData,
    MODE,
    stableInitiateBlankCurrentlySelectedRule,
    stableSetCurrentlySelectedRule,
    RULE_TO_EDIT_ID,
    RULE_TYPE_TO_CREATE,
    dispatch,
    navigate,
    stableSetCurrentlySelectedRuleConfig,
    props.rule,
    appMode,
    ruleGroupId,
  ]);

  //If "all rules" are not already there in state, fetch them.
  if (!fetchAllRulesComplete && isEmpty(allRules)) {
    Logger.log("Reading to storage in RuleBuilder");
    clientRuleStorageService.getRecordsByObjectType(RecordType.RULE).then((rules) => {
      //Set Flag to prevent loop
      setFetchAllRulesComplete(true);
      dispatch(globalActions.updateRulesAndGroups({ rules, groups: [] }));
    });
  }

  useEffect(() => {
    if (
      MODE === RULE_EDITOR_CONFIG.MODES.EDIT &&
      isDesktopOnlyRule(currentlySelectedRuleData) &&
      appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP
    ) {
      if (currentlySelectedRuleConfig.TYPE === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT)
        trackDesktopRuleViewedOnExtension("map_local");
    }
  }, [MODE, appMode, currentlySelectedRuleConfig.TYPE, currentlySelectedRuleData]);

  useEffect(() => {
    return () => {
      //Flag to prevent future state update when component is about to unmount
      isCleaningUpRef.current = true;
      cleanup(dispatch);
    };
  }, [dispatch]);

  useEffect(() => {
    if (hasRuleToEditIdChanged && MODE === RULE_EDITOR_CONFIG.MODES.EDIT) {
      cleanup(dispatch);
    }
  }, [MODE, dispatch, hasRuleToEditIdChanged]);

  // Clear currently-selected-rule when URL is changed.
  // This is imp since changing url from http://localhost:3000/rules/editor/edit/Redirect_s8g1y to http://localhost:3000/rules/editor/create/Redirect won't cause the parent component to re-render, so we need to handle it specifically.
  useEffect(() => {
    // https://stackoverflow.com/questions/39288915/detect-previous-path-in-react-router
    // prevPath will be sent by ProLayout navigation menu item
    if (
      location &&
      location.pathname.includes("/rules/editor/create/") &&
      location.state &&
      location.state.prevPath &&
      location.state.prevPath.includes("/rules/editor/edit/")
    )
      cleanup(dispatch);
  }, [dispatch, location]);

  if (
    currentlySelectedRuleConfig === false ||
    currentlySelectedRuleConfig === undefined ||
    currentlySelectedRuleConfig.NAME === undefined ||
    currentlySelectedRuleData.name === undefined ||
    (MODE === RULE_EDITOR_CONFIG.MODES.CREATE && currentlySelectedRuleData.ruleType !== RULE_TYPE_TO_CREATE)
  ) {
    return <SpinnerCard renderHeader />;
  }

  return (
    <m.div layout transition={{ type: "linear", duration: 0.2 }} style={{ height: "inherit" }}>
      {/* TODO: NEEDS REFACTORING */}
      <Row className="w-full relative rule-builder-container">
        <Col span={24} className="rule-builder-body-wrapper">
          {(isSampleRule && appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) ||
          (MODE === RuleEditorMode.CREATE && isDetailsPanelShown) ? (
            <RuleDetailsPanel
              isSample={isSampleRule}
              source="new_rule_editor"
              handleSeeLiveRuleDemoClick={props.handleSeeLiveRuleDemoClick}
              ruleDetails={
                isSampleRule && isReadOnly
                  ? sampleRuleDetails[currentlySelectedRuleData.sampleId].details
                  : RULE_DETAILS[currentlySelectedRuleData?.ruleType]
              }
            />
          ) : null}

          <Body
            mode={MODE}
            showDocs={isDocsVisible}
            currentlySelectedRuleData={currentlySelectedRuleData}
            currentlySelectedRuleConfig={currentlySelectedRuleConfig}
          />
        </Col>
      </Row>

      {/* Modals */}
      {isChangeRuleGroupModalActive ? (
        <ChangeRuleGroupModal
          isOpen={isChangeRuleGroupModalActive}
          toggle={toggleChangeRuleGroupModal}
          mode="CURRENT_RULE"
        />
      ) : null}
    </m.div>
  );
};

export default RuleBuilder;
