import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Row, Col } from "antd";
import Split from "react-split";
import RuleBuilder from "../../../../components/features/rules/RuleBuilder";
import ProCard from "@ant-design/pro-card";
import { getAppMode } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import { StorageService } from "init";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import RuleEditorSplitPane from "../../../../components/features/rules/RuleEditorSplitPane";
import Logger from "lib/logger";
import "./RuleEditor.css";

const INITIAL_PANE_SIZES = [92, 8];

const RuleEditor = () => {
  const location = useLocation();
  const { MODE, RULE_TYPE_TO_CREATE } = getModeData(location, null);

  // Component State
  const [rulePaneSizes, setRulePaneSizes] = useState(INITIAL_PANE_SIZES);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);

  //Global State
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      Logger.log("Reading storage in RuleEditor useEffect");
      StorageService(appMode)
        .getRecord(APP_CONSTANTS.RQ_SETTINGS)
        .then((value) => {
          if (value) {
            setIsExtensionEnabled(value.isExtensionEnabled);
          } else {
            setIsExtensionEnabled(true);
          }
        });
    }
  }, [appMode]);

  const expandRulePane = () => setRulePaneSizes([30, 70]);

  const collapseRulesPlane = () => setRulePaneSizes(INITIAL_PANE_SIZES);

  const renderRuleEditor = () => {
    if (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION) {
      // PATCH
      // Sometimes RULE_TYPE_TO_CREATE contains the rule id.
      // For time being, split the string to extract Rule Type. Ex: Redirect_ke4mv -> Redirect
      const CURRENT_RULE_TYPE = RULE_TYPE_TO_CREATE.split("_")[0];

      switch (CURRENT_RULE_TYPE) {
        case GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT:
        case GLOBAL_CONSTANTS.RULE_TYPES.REPLACE:
        case GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM:
        case GLOBAL_CONSTANTS.RULE_TYPES.CANCEL:
        case GLOBAL_CONSTANTS.RULE_TYPES.HEADERS:
        case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
        case GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE:
        case GLOBAL_CONSTANTS.RULE_TYPES.DELAY:
        case GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT:
        case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT:
          return (
            <>
              <Split
                sizes={rulePaneSizes}
                minSize={0}
                gutterSize={20}
                dragInterval={20}
                direction="vertical"
                cursor="row-resize"
                onDragEnd={(paneSizes) => setRulePaneSizes(paneSizes)}
                style={{
                  height: location.pathname.includes("/rules/editor") ? "calc(100vh - 72px)" : "91vh",
                }}
              >
                <Row className="overflow-hidden">
                  <Col span={24}>
                    <ProCard className="rule-editor-procard">
                      <RuleBuilder />
                    </ProCard>
                  </Col>
                </Row>
                <Row className="overflow-hidden">
                  <ProCard className="rule-editor-split-procard">
                    <RuleEditorSplitPane
                      mode={MODE}
                      showExecutionLogs={true}
                      expandRulePane={expandRulePane}
                      collapseRulesPlane={collapseRulesPlane}
                      ruleType={CURRENT_RULE_TYPE}
                    />
                  </ProCard>
                </Row>
              </Split>
            </>
          );

        default:
          break;
      }
    }
    return (
      <>
        <ProCard className="rule-editor-procard">
          <RuleBuilder />
        </ProCard>
      </>
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
