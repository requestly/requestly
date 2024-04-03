import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { unstable_usePrompt, useLocation } from "react-router-dom";
import { Row, Col } from "antd";
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
import "./RuleEditor.css";
import EditorHeader from "./components/Header";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { BottomSheet, useBottomSheetContext } from "componentsV2/BottomSheet";

const RuleEditor = (props) => {
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);

  const { viewAsPanel } = useBottomSheetContext();

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

  const renderRuleEditor = () => {
    return (
      <Col className="overflow-hidden">
        {MODE !== RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
          <EditorHeader
            mode={MODE}
            location={location}
            currentlySelectedRuleData={currentlySelectedRuleData}
            currentlySelectedRuleConfig={currentlySelectedRuleConfig}
          />
        ) : null}
        <Row>
          <Col
            span={viewAsPanel ? 15 : 24}
            // xxl={{
            //   span: 15,
            // }}
            // xs={{
            //   span: 24,
            // }}
          >
            <ProCard className="rule-editor-procard">
              <RuleBuilder />
            </ProCard>
          </Col>
          <Col
            // style={{
            //   background: "red",
            // }}
            // xxl={{
            //   span: 9,
            // }}
            // xs={{
            //   span: 24,
            // }}
            span={viewAsPanel ? 9 : 24}
          >
            <BottomSheet height={360} />
          </Col>
        </Row>
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
