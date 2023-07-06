import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import isEmpty from "is-empty";
import { Button, Col, Row } from "antd";
import { actions } from "../../../../../../app/src/store";
import Header from "./Header";
import Body from "./Body";
import ChangeRuleGroupModal from "../ChangeRuleGroupModal";
import SpinnerCard from "../../../misc/SpinnerCard";
import APP_CONSTANTS from "../../../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { StorageService } from "../../../../init";
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
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getIsRuleEditorTourCompleted,
} from "../../../../store/selectors";
import * as RedirectionUtils from "../../../../utils/RedirectionUtils";
import useExternalRuleCreation from "./useExternalRuleCreation";
import Logger from "lib/logger";
import {
  trackRuleEditorViewed,
  trackDesktopRuleViewedOnExtension,
  trackDocsSidebarViewed,
} from "modules/analytics/events/common/rules";
import { getRuleConfigInEditMode, isDesktopOnlyRule } from "utils/rules/misc";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import Help from "./Help";
import "./RuleBuilder.css";

//CONSTANTS
const { RULE_EDITOR_CONFIG, RULE_TYPES_CONFIG } = APP_CONSTANTS;

const RuleBuilder = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { MODE, RULE_TYPE_TO_CREATE, RULE_TO_EDIT_ID } = getModeData(location, props.isSharedListViewRule);

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);

  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const allRules = useSelector(getAllRules);
  const appMode = useSelector(getAppMode);

  const enableDocs = useMemo(() => {
    return !props.isSharedListViewRule;
  }, [props.isSharedListViewRule]);

  const isRuleEditorTourCompleted = useSelector(getIsRuleEditorTourCompleted);

  //References
  const isCleaningUpRef = useRef(false);
  //Component State
  const ruleSelection = {};
  ruleSelection[currentlySelectedRuleData.id] = true;

  const [fetchAllRulesComplete, setFetchAllRulesComplete] = useState(false);
  const [isChangeRuleGroupModalActive, setIsChangeRuleGroupModalActive] = useState(false);
  const [startWalkthrough, setStartWalkthrough] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const isDocsVisible = useMemo(() => {
    return enableDocs && showDocs;
  }, [enableDocs, showDocs]);

  useExternalRuleCreation(MODE);

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
          currentlySelectedRuleConfig,
          RULE_TYPE_TO_CREATE,
          setCurrentlySelectedRule
        );
        stableSetCurrentlySelectedRuleConfig(dispatch, RULE_TYPES_CONFIG[RULE_TYPE_TO_CREATE], navigate);
      } else if (MODE === RULE_EDITOR_CONFIG.MODES.EDIT) {
        Logger.log("Reading to storage in RuleBuilder");
        StorageService(appMode)
          .getRecord(RULE_TO_EDIT_ID)
          .then((rule) => {
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
    location,
  ]);

  //If "all rules" are not already there in state, fetch them.
  if (!fetchAllRulesComplete && isEmpty(allRules)) {
    Logger.log("Reading to storage in RuleBuilder");
    StorageService(appMode)
      .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
      .then((rules) => {
        //Set Flag to prevent loop
        setFetchAllRulesComplete(true);
        dispatch(actions.updateRulesAndGroups({ rules, groups: [] }));
      });
  }

  useEffect(() => {
    if (MODE === RULE_EDITOR_CONFIG.MODES.CREATE && !isRuleEditorTourCompleted && !allRules.length) {
      setStartWalkthrough(true);
    }
  }, [MODE, allRules.length, isRuleEditorTourCompleted]);

  useEffect(() => {
    const source = state?.source ?? null;
    const ruleType = currentlySelectedRuleConfig.TYPE;
    if (!ruleType || !source) return;
    trackRuleEditorViewed(source, ruleType);
  }, [currentlySelectedRuleConfig.TYPE, state]);

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

  useEffect(() => {
    const unloadListener = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };

    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      window.addEventListener("beforeunload", unloadListener);
    } else {
      window.removeEventListener("beforeunload", unloadListener);
    }

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [isCurrentlySelectedRuleHasUnsavedChanges]);

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
    <>
      <ProductWalkthrough
        tourFor={RULE_TYPE_TO_CREATE}
        startWalkthrough={startWalkthrough}
        context={currentlySelectedRuleData}
        onTourComplete={() => dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.RULE_EDITOR }))}
      />
      {MODE !== RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
        <Header
          mode={MODE}
          location={location}
          currentlySelectedRuleData={currentlySelectedRuleData}
          currentlySelectedRuleConfig={currentlySelectedRuleConfig}
        />
      ) : null}

      <Row className="w-full relative">
        <Col span={isDocsVisible ? 17 : 24}>
          <Body mode={MODE} showDocs={isDocsVisible} currentlySelectedRuleConfig={currentlySelectedRuleConfig} />
        </Col>

        {enableDocs ? (
          <>
            {!showDocs ? (
              <Button
                className="rule-editor-help-btn"
                onClick={() => {
                  setShowDocs(true);
                }}
              >
                Help
                <span>
                  <DownArrow />
                </span>
              </Button>
            ) : (
              <Col span={7}>
                <Help setShowDocs={setShowDocs} ruleType={currentlySelectedRuleData.ruleType} />
              </Col>
            )}
          </>
        ) : null}
      </Row>

      {/* Modals */}
      {isChangeRuleGroupModalActive ? (
        <ChangeRuleGroupModal
          isOpen={isChangeRuleGroupModalActive}
          toggle={toggleChangeRuleGroupModal}
          mode="CURRENT_RULE"
        />
      ) : null}
    </>
  );
};

export default RuleBuilder;
