import React, { useEffect, useMemo } from "react";
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
import EditorHeader from "./components/Header";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { BottomSheet, useBottomSheetContext } from "componentsV2/BottomSheet";
import { TestThisRule } from "components/features/rules/TestThisRule";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import "./RuleEditor.css";

const RuleEditor = (props) => {
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);

  const { isSheetPlacedAtBottom } = useBottomSheetContext();

  const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;
  const { MODE } = getModeData(location, props.isSharedListViewRule);

  const BOTTOM_SHEET_TAB_KEYS = {
    TEST_RULE: "TEST_RULE",
  };

  const bottomSheetTabItems = useMemo(() => {
    return [
      {
        key: BOTTOM_SHEET_TAB_KEYS.TEST_RULE,
        label: (
          <div className="bottom-sheet-tab">
            <MdOutlineScience />
            <span>Test</span>
          </div>
        ),
        children: <TestThisRule />,
        forceRender: true,
      },
    ];
  }, [BOTTOM_SHEET_TAB_KEYS.TEST_RULE]);

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
      <Col className="overflow-hidden h-full">
        {MODE !== RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
          <EditorHeader
            mode={MODE}
            location={location}
            currentlySelectedRuleData={currentlySelectedRuleData}
            currentlySelectedRuleConfig={currentlySelectedRuleConfig}
          />
        ) : null}
        <Row style={{ height: "inherit", position: "relative" }}>
          <Col span={isSheetPlacedAtBottom ? 24 : 13}>
            <ProCard className="rule-editor-procard">
              <RuleBuilder />
            </ProCard>
          </Col>
          {MODE === RULE_EDITOR_CONFIG.MODES.EDIT && isFeatureCompatible(FEATURES.TEST_THIS_RULE) && (
            <BottomSheet defaultActiveKey={BOTTOM_SHEET_TAB_KEYS.TEST_RULE} items={bottomSheetTabItems} />
          )}
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
