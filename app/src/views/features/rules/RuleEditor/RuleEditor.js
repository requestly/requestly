import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { unstable_usePrompt, useLocation } from "react-router-dom";
import { Col } from "antd";
import RuleBuilder from "../../../../components/features/rules/RuleBuilder";
import ProCard from "@ant-design/pro-card";
import {
  getAppMode,
  getCurrentlySelectedRuleData,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getIsExtensionEnabled,
  getIsWorkspaceSwitchConfirmationActive,
} from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import EditorHeader from "./components/Header";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { RuleEditorBottomSheet } from "./components/RuleEditorBottomSheet/RuleEditorBottomSheet";
import { trackSampleRuleTested } from "features/rules/analytics";
import { RecordStatus } from "@requestly/shared/types/entities/rules";
import { sampleRuleDetails } from "features/rules/screens/rulesList/components/RulesList/constants";
import { SheetLayout } from "componentsV2/BottomSheet/types";
import "./RuleEditor.scss";

const RuleEditor = (props) => {
  const location = useLocation();
  const { state } = location;
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const isWorkspaceSwitchConfirmationActive = useSelector(getIsWorkspaceSwitchConfirmationActive);
  const [isNewRuleCreated, setIsNewRuleCreated] = useState(false);
  const [showEnableRuleTooltip, setShowEnableRuleTooltip] = useState(false);
  const tryThisRuleTooltipTimerRef = useRef(null);
  const [isSampleRule, setIsSampleRule] = useState(false);

  const { toggleBottomSheet, isBottomSheetOpen } = useBottomSheetContext();

  const { MODE, RULE_TYPE_TO_CREATE } = useMemo(() => getModeData(location, props.isSharedListViewRule), [
    location,
    props.isSharedListViewRule,
  ]);

  const handleSeeLiveRuleDemoClick = useCallback(() => {
    trackSampleRuleTested(currentlySelectedRuleData?.name, currentlySelectedRuleData.status);

    if (currentlySelectedRuleData.status === RecordStatus.INACTIVE) {
      setShowEnableRuleTooltip(true);

      if (tryThisRuleTooltipTimerRef.current) {
        clearTimeout(tryThisRuleTooltipTimerRef.current);
      }

      tryThisRuleTooltipTimerRef.current = setTimeout(() => {
        setShowEnableRuleTooltip(false);
      }, 3 * 1000);

      return;
    }

    window.open(sampleRuleDetails[currentlySelectedRuleData.sampleId].demoLink, "_blank");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlySelectedRuleData?.name, currentlySelectedRuleData?.status]);

  useEffect(() => {
    const unloadListener = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };

    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      window.addEventListener("beforeunload", unloadListener);
    }

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [isCurrentlySelectedRuleHasUnsavedChanges]);

  unstable_usePrompt({
    message: "Discard changes? Changes you made may not be saved.",
    when: isCurrentlySelectedRuleHasUnsavedChanges && !isWorkspaceSwitchConfirmationActive,
  });

  useEffect(() => {
    if (isNewRuleCreated) {
      toggleBottomSheet({ isOpen: false, isTrack: false, action: "new_rule_created" });
      setIsNewRuleCreated(false);
    }
  }, [toggleBottomSheet, isNewRuleCreated]);

  useEffect(() => {
    if (
      MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      state?.source !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      !isNewRuleCreated
    ) {
      if (isBottomSheetOpen) toggleBottomSheet({ isOpen: false, isTrack: false, action: "new_rule_created" });
    }
  }, [toggleBottomSheet, MODE, state, isNewRuleCreated, isBottomSheetOpen]);

  useEffect(() => {
    if (state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
      setIsNewRuleCreated(true);
    }
  }, [state?.source, MODE]);

  useEffect(() => {
    /*
    HOTIFIX FOR INFINITE RERENDER:
    This is a temporary fix to handle the case where bottom sheet should not be visible for sample rules
    TODO: REMOVE THIS WHEN REFACTORING RULE EDITOR
    */
    if (currentlySelectedRuleData?.isSample) {
      setIsSampleRule(true);
    }
  }, [currentlySelectedRuleData?.isSample]);

  const ruleEditor = useMemo(() => {
    return (
      <Col key={MODE + RULE_TYPE_TO_CREATE} className="overflow-hidden h-full rule-editor-container">
        {MODE !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
          <EditorHeader
            mode={MODE}
            showEnableRuleTooltip={showEnableRuleTooltip}
            handleSeeLiveRuleDemoClick={handleSeeLiveRuleDemoClick}
          />
        ) : null}

        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
          <ProCard className="rule-editor-procard rule-editor-body-scroll">
            {/* TODO: rename "isSharedListViewRule" prop to view only mode */}
            <RuleBuilder />
          </ProCard>
        ) : (
          <BottomSheetLayout
            bottomSheet={<RuleEditorBottomSheet mode={MODE} />}
            hideBottomSheet={MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE || isSampleRule}
            initialSizes={[60, 40]}
            layout={SheetLayout.SPLIT}
          >
            <ProCard
              className={`rule-editor-procard ${
                MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT && !isSampleRule
                  ? "rules-edit-mode"
                  : "rules-create-mode"
              }`}
            >
              <RuleBuilder handleSeeLiveRuleDemoClick={handleSeeLiveRuleDemoClick} />
            </ProCard>
          </BottomSheetLayout>
        )}
      </Col>
    );
  }, [MODE, RULE_TYPE_TO_CREATE, appMode, showEnableRuleTooltip, handleSeeLiveRuleDemoClick, isSampleRule]);

  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      if (!isExtensionEnabled) {
        return <ExtensionDeactivationMessage />;
      }
      return ruleEditor;
    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
    default:
      return ruleEditor;
  }
};

export default RuleEditor;
