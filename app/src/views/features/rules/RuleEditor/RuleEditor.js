import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { unstable_usePrompt, useLocation } from "react-router-dom";
import { Col } from "antd";
import RuleBuilder from "../../../../components/features/rules/RuleBuilder";
import ProCard from "@ant-design/pro-card";
import { getAppMode, getIsCurrentlySelectedRuleHasUnsavedChanges, getIsExtensionEnabled } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import EditorHeader from "./components/Header";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { RuleEditorBottomSheet } from "./components/RuleEditorBottomSheet/RuleEditorBottomSheet";
import "./RuleEditor.css";

const RuleEditor = (props) => {
  const location = useLocation();
  const { state } = location;
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const [isNewRuleCreated, setIsNewRuleCreated] = useState(false);

  const { toggleBottomSheet, isBottomSheetOpen } = useBottomSheetContext();

  const { MODE } = useMemo(() => getModeData(location, props.isSharedListViewRule), [
    location,
    props.isSharedListViewRule,
  ]);

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
      <Col className="overflow-hidden h-full">
        {MODE !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? <EditorHeader mode={MODE} /> : null}

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
              <RuleBuilder />
            </ProCard>
          </BottomSheetLayout>
        )}
      </Col>
    );
  }, [MODE, appMode]);

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
