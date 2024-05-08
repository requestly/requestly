import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { unstable_usePrompt, useLocation } from "react-router-dom";
import { Col } from "antd";
import RuleBuilder from "../../../../components/features/rules/RuleBuilder";
import ProCard from "@ant-design/pro-card";
import {
  getAppMode,
  getCurrentlySelectedRuleConfig,
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
import "./RuleEditor.css";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";

const RuleEditor = (props) => {
  const location = useLocation();
  const { state } = location;
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const [isNewRuleCreated, setIsNewRuleCreated] = useState(false);

  const { toggleBottomSheet, isBottomSheetOpen } = useBottomSheetContext();

  const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;
  const { MODE } = getModeData(location, props.isSharedListViewRule);

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

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message) => {
        console.log("DEBUGG:: Test Rule Report Updated", message);
      }
    );
  }, []);

  const renderRuleEditor = () => {
    return (
      <Col className="overflow-hidden h-full">
        {MODE !== RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
          <EditorHeader
            mode={MODE}
            location={location}
            currentlySelectedRuleData={currentlySelectedRuleData}
            currentlySelectedRuleConfig={currentlySelectedRuleConfig}
          />
        ) : null}
        <BottomSheetLayout bottomSheet={<RuleEditorBottomSheet mode={MODE} />}>
          <ProCard className="rule-editor-procard">
            <RuleBuilder />
          </ProCard>
        </BottomSheetLayout>
      </Col>
    );
  };

  const handleDeviceView = () => {
    switch (appMode) {
      case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
        if (!isExtensionEnabled) {
          return <ExtensionDeactivationMessage />;
        }
        return renderRuleEditor();
      case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      default:
        return renderRuleEditor();
    }
  };

  return handleDeviceView();
};

export default RuleEditor;
