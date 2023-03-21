import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardBody } from "reactstrap";
import { Row, Col, Alert } from "antd";
import RulePairs from "../../RulePairs";
import AddPairButton from "./Columns/AddPairButton";
import APP_CONSTANTS from "../../../../../config/constants";
import {
  getAppMode,
  getCurrentlySelectedRuleData,
  getCurrentlySelectedRuleErrors,
} from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { RQEditorTitle } from "lib/design-system/components/RQEditorTitle";
import { onChangeHandler } from "./actions";
import RuleInfoBanner from "./RuleInfoBanner";
import "./RuleBuilderBody.css";

const Body = ({
  mode,
  isRedirectRuleWithABTest,
  currentlySelectedRuleConfig,
}) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const ruleErrors = useSelector(getCurrentlySelectedRuleErrors);
  const isSharedListView = mode === "shared-list-rule-view";

  const getEventObject = (name, value) => ({ target: { name, value } });

  const handleRuleNameChange = (name) => {
    const event = getEventObject("name", name);
    onChangeHandler(currentlySelectedRuleData, dispatch, event);
  };

  const handleDescriptionChange = (description) => {
    const event = getEventObject("description", description);
    onChangeHandler(currentlySelectedRuleData, dispatch, event);
  };

  const renderWarning = () => {
    switch (currentlySelectedRuleConfig.TYPE) {
      case GLOBAL_CONSTANTS.RULE_TYPES.REQUEST:
        return isFeatureCompatible(FEATURES.MODIFY_REQUEST_BODY) ? null : (
          <>
            <Row className="margin-top-one margin-bottom-one">
              <Col span={24}>
                <Alert
                  type="info"
                  showIcon
                  message={
                    appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ? (
                      <>
                        This Rule type is currently available only in the
                        desktop app. Download now{" "}
                        <a href="https://requestly.io/desktop/">
                          https://requestly.io/desktop/
                        </a>
                        .
                      </>
                    ) : (
                      <>
                        Please update your app to use this rule. Download latest
                        version at{" "}
                        <a href="https://requestly.io/desktop/">
                          https://requestly.io/desktop/
                        </a>
                        .
                      </>
                    )
                  }
                ></Alert>
              </Col>
            </Row>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {!isSharedListView && (
        <RQEditorTitle
          mode={mode}
          errors={ruleErrors}
          name={currentlySelectedRuleData.name}
          namePlaceholder="Enter rule name"
          nameChangeCallback={handleRuleNameChange}
          descriptionPlaceholder="Add description (optional)"
          description={currentlySelectedRuleData.description}
          descriptionChangeCallback={handleDescriptionChange}
          isRedirectRuleWithABTest={isRedirectRuleWithABTest}
        />
      )}
      <Row className="rule-builder-body">
        <Col
          span={22}
          offset={1}
          md={{
            offset: isRedirectRuleWithABTest ? 1 : 2,
            span: isRedirectRuleWithABTest ? 22 : 20,
          }}
          lg={{
            offset: isSharedListView ? 2 : isRedirectRuleWithABTest ? 1 : 4,
            span: isSharedListView ? 20 : isRedirectRuleWithABTest ? 22 : 16,
          }}
        >
          <CardBody>
            {/* Info for some specific rule types */}
            <RuleInfoBanner
              appMode={appMode}
              ruleType={currentlySelectedRuleConfig.TYPE}
            />
            {renderWarning()}

            <RulePairs
              mode={mode}
              currentlySelectedRuleConfig={currentlySelectedRuleConfig}
            />

            {currentlySelectedRuleConfig.ALLOW_ADD_PAIR ? (
              <Row justify="end">
                <Col span={24}>
                  {mode !==
                  APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES
                    .SHARED_LIST_RULE_VIEW ? (
                    <AddPairButton
                      currentlySelectedRuleConfig={currentlySelectedRuleConfig}
                    />
                  ) : null}
                </Col>
              </Row>
            ) : null}
          </CardBody>
        </Col>
      </Row>
    </>
  );
};

export default Body;
