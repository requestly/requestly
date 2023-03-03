import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardBody } from "reactstrap";
import { Row, Col, Alert } from "antd";
//SUB COMPONENTS
import RulePairs from "../../RulePairs";
import AddPairButton from "./Columns/AddPairButton";
import { ReactComponent as QuestionMarkIcon } from "assets/icons/rule-types/queryparam.svg";
//CONSTANTS
import APP_CONSTANTS from "../../../../../config/constants";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isDesktopMode } from "../../../../../utils/AppUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { RQEditorTitle } from "lib/design-system/components/RQEditorTitle";
import { onChangeHandler } from "./actions";
import "./RuleBuilderBody.css";

const Body = ({ mode, currentlySelectedRuleConfig }) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
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
          name={currentlySelectedRuleData.name}
          namePlaceholder="Enter rule name"
          nameChangeCallback={handleRuleNameChange}
          descriptionPlaceholder="Add description (optional)"
          description={currentlySelectedRuleData.description}
          descriptionChangeCallback={handleDescriptionChange}
        />
      )}
      <Row className="rule-builder-body">
        <Col
          span={22}
          offset={1}
          md={{ offset: 2, span: 20 }}
          lg={{
            offset: isSharedListView ? 2 : 4,
            span: isSharedListView ? 20 : 16,
          }}
        >
          <CardBody>
            {/* Info for some specific rule types */}
            {!isDesktopMode() &&
            currentlySelectedRuleConfig.TYPE ===
              GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE ? (
              <>
                <Row style={{ marginBottom: 5 }}>
                  <Col span={24}>
                    <Alert
                      className="rule-alert"
                      message={
                        <>
                          <li className="rule-alert-text">
                            Note: API responses triggered by XHR/fetch can be
                            modified using chrome extension. To modify
                            <br /> response for every request type, use{" "}
                            <a
                              target="_blank"
                              href="https://requestly.io/desktop/"
                              rel="noreferrer"
                            >
                              Desktop App.
                            </a>
                          </li>
                        </>
                      }
                      icon={
                        <div className="rule-alert-icon">
                          <QuestionMarkIcon />
                        </div>
                      }
                      showIcon
                      closable
                    />
                  </Col>
                </Row>
              </>
            ) : null}
            {currentlySelectedRuleConfig.TYPE ===
            GLOBAL_CONSTANTS.RULE_TYPES.DELAY ? (
              <>
                <Row>
                  <Col span={24}>
                    <Alert
                      className="rule-alert"
                      closable
                      showIcon
                      type="info"
                      style={{ marginBottom: "1rem" }}
                      message={
                        <li className="rule-alert-text">
                          Delay is capped automatically to avoid browsing
                          performance degradation.
                          <br />
                          For XHR/Fetch, max delay is $
                          {
                            GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS
                              .MAX_DELAY_VALUE_XHR
                          }
                          ms & for other resources (JS, CSS, Images etc), max
                          delay is $
                          {
                            GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS
                              .MAX_DELAY_VALUE_NON_XHR
                          }
                          ms
                        </li>
                      }
                      icon={
                        <div className="rule-alert-icon">
                          <QuestionMarkIcon />
                        </div>
                      }
                    />
                  </Col>
                </Row>
              </>
            ) : null}
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
