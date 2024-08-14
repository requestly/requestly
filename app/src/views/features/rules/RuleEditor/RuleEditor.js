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
} from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import EditorHeader from "./components/Header";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { RuleEditorBottomSheet } from "./components/RuleEditorBottomSheet/RuleEditorBottomSheet";
import { trackSampleRuleTested } from "features/rules/analytics";
import { RecordStatus } from "features/rules";
import { sampleRuleDetails } from "features/rules/screens/rulesList/components/RulesList/components/RulesTable/constants";
import "./RuleEditor.css";

const RuleEditor = (props) => {
  const location = useLocation();
  const { state } = location;
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const [isNewRuleCreated, setIsNewRuleCreated] = useState(false);
  const [showEnableRuleTooltip, setShowEnableRuleTooltip] = useState(false);
  const tryThisRuleTooltipTimerRef = useRef(null);

  const { toggleBottomSheet, isBottomSheetOpen } = useBottomSheetContext();

  const { MODE, RULE_TYPE_TO_CREATE } = useMemo(
    () => getModeData(location, props.isSharedListViewRule),
    [location, props.isSharedListViewRule]
  );

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
    when: isCurrentlySelectedRuleHasUnsavedChanges,
  });

  useEffect(() => {
    if (isNewRuleCreated) {
      toggleBottomSheet();
      setIsNewRuleCreated(false);
    }
  }, [toggleBottomSheet, isNewRuleCreated]);

  useEffect(() => {
    if (
      MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      state?.source !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE &&
      !isNewRuleCreated
    ) {
      if (isBottomSheetOpen) toggleBottomSheet(false);
    }
  }, [toggleBottomSheet, MODE, state, isNewRuleCreated, isBottomSheetOpen]);

  useEffect(() => {
    if (state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
      setIsNewRuleCreated(true);
    }
  }, [state?.source, MODE]);

  const ruleEditor = useMemo(() => {
    return (
      <Col key={MODE + RULE_TYPE_TO_CREATE} className="overflow-hidden h-full">
        {MODE !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
          <EditorHeader
            mode={MODE}
            showEnableRuleTooltip={showEnableRuleTooltip}
            handleSeeLiveRuleDemoClick={handleSeeLiveRuleDemoClick}
          />
        ) : null}

        {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
          <ProCard
            className={`rule-editor-procard ${
              MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? "rules-edit-mode" : "rules-create-mode"
            }`}
          >
            <RuleBuilder />
          </ProCard>
        ) : (
          <BottomSheetLayout
            bottomSheet={<RuleEditorBottomSheet mode={MODE} />}
            hideBottomSheet={MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE}
          >
            <ProCard
              className={`rule-editor-procard ${
                MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT ? "rules-edit-mode" : "rules-create-mode"
              }`}
            >
              <RuleBuilder handleSeeLiveRuleDemoClick={handleSeeLiveRuleDemoClick} />
            </ProCard>
          </BottomSheetLayout>
        )}
      </Col>
    );
  }, [MODE, RULE_TYPE_TO_CREATE, appMode, showEnableRuleTooltip, handleSeeLiveRuleDemoClick]);

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
