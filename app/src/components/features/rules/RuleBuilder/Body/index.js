import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardBody } from "reactstrap";
import { Row, Col } from "antd";
import RulePairs from "../../RulePairs";
import AddPairButton from "./Columns/AddPairButton";
import APP_CONSTANTS from "../../../../../config/constants";
import FEATURES from "config/constants/sub/features";
import { getAppMode, getCurrentlySelectedRuleData, getCurrentlySelectedRuleErrors } from "store/selectors";
import { RQEditorTitle } from "lib/design-system/components/RQEditorTitle";
import { onChangeHandler } from "./actions";
import RuleInfoBanner from "./RuleInfoBanner";
import { TestThisRuleRow } from "../../TestThisRule";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import "./RuleBuilderBody.css";

const Body = ({ mode, showDocs, currentlySelectedRuleConfig }) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const ruleErrors = useSelector(getCurrentlySelectedRuleErrors);
  const isSharedListView = mode === "shared-list-rule-view";

  const getEventObject = (name, value) => ({ target: { name, value } });

  const handleRuleNameChange = useCallback(
    (name) => {
      const event = getEventObject("name", name);
      onChangeHandler(currentlySelectedRuleData, dispatch, event);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const handleDescriptionChange = useCallback(
    (description) => {
      const event = getEventObject("description", description);
      onChangeHandler(currentlySelectedRuleData, dispatch, event);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const generateRuleName = useCallback((ruleType) => {
    return `${ruleType.toLowerCase()}-${Date.now()}`;
  }, []);

  const defaultRuleName = useMemo(() => generateRuleName(currentlySelectedRuleData.ruleType), [
    generateRuleName,
    currentlySelectedRuleData.ruleType,
  ]);

  return (
    <>
      {!isSharedListView && (
        <RQEditorTitle
          mode={mode}
          errors={ruleErrors}
          showDocs={showDocs}
          defaultName={defaultRuleName}
          name={currentlySelectedRuleData.name}
          namePlaceholder="Enter rule name"
          nameChangeCallback={handleRuleNameChange}
          descriptionPlaceholder="Add description (optional)"
          description={currentlySelectedRuleData.description}
          descriptionChangeCallback={handleDescriptionChange}
        />
      )}
      <Row className="rule-builder-body" id="rule-builder-body">
        <Col
          span={22}
          offset={1}
          md={{
            offset: showDocs ? 1 : 2,
            span: showDocs ? 22 : 20,
          }}
          lg={{
            offset: isSharedListView ? 2 : showDocs ? 1 : 4,
            span: isSharedListView ? 20 : showDocs ? 22 : 16,
          }}
        >
          <CardBody>
            {/* Info for some specific rule types */}
            <RuleInfoBanner appMode={appMode} ruleType={currentlySelectedRuleConfig.TYPE} />

            <RulePairs mode={mode} currentlySelectedRuleConfig={currentlySelectedRuleConfig} />

            {currentlySelectedRuleConfig.ALLOW_ADD_PAIR ? (
              <Row justify="end">
                <Col span={24}>
                  {mode !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
                    <AddPairButton currentlySelectedRuleConfig={currentlySelectedRuleConfig} />
                  ) : null}
                </Col>
              </Row>
            ) : null}
            {mode === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.EDIT && isFeatureCompatible(FEATURES.TEST_THIS_RULE) ? (
              <TestThisRuleRow ruleId={currentlySelectedRuleData.id} />
            ) : null}
          </CardBody>
        </Col>
      </Row>
    </>
  );
};

export default Body;
