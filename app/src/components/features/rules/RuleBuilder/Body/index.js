import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardBody } from "reactstrap";
import { Row, Col } from "antd";
import RulePairs from "../../RulePairs";
import AddPairButton from "./Columns/AddPairButton";
import APP_CONSTANTS from "../../../../../config/constants";
import { getAppMode, getCurrentlySelectedRuleErrors } from "store/selectors";
import { RQEditorTitle } from "lib/design-system/components/RQEditorTitle";
import { onChangeHandler } from "./actions";
import RuleInfoBanner from "./RuleInfoBanner";
import { useRBAC } from "features/rbac";
import "./RuleBuilderBody.css";

const Body = ({ mode, showDocs, currentlySelectedRuleData, currentlySelectedRuleConfig }) => {
  //Global State
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const ruleErrors = useSelector(getCurrentlySelectedRuleErrors);
  const isSharedListView = mode === "shared-list-rule-view";
  const isSampleRule = currentlySelectedRuleData?.isSample;
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const getEventObject = (name, value) => ({ target: { name, value } });

  const handleRuleNameChange = useCallback(
    (name, warnForUnsavedChanges = true) => {
      const event = getEventObject("name", name);
      onChangeHandler(currentlySelectedRuleData, dispatch, event, warnForUnsavedChanges);
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
      <div className="rule-editor-title-container">
        {!isSharedListView && (
          <RQEditorTitle
            isSampleRule={isSampleRule}
            disabled={isSampleRule || !isValidPermission}
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
      </div>
      <Row
        className={`rule-builder-body ${isSharedListView ? "preview-rule-builder-body" : ""}`}
        id="rule-builder-body"
      >
        {isSampleRule && (
          <div className="sample-rule-overlay">
            <div className="view-only-message">Sample rules are view only</div>
          </div>
        )}
        <Col span={24} style={{ minWidth: "300px" }} className={`${isSampleRule ? "sample-rule-card-body" : ""}`}>
          <CardBody>
            {/* Info for some specific rule types */}
            <RuleInfoBanner appMode={appMode} ruleType={currentlySelectedRuleConfig.TYPE} />

            <RulePairs mode={mode} currentlySelectedRuleConfig={currentlySelectedRuleConfig} />

            {currentlySelectedRuleConfig.ALLOW_ADD_PAIR ? (
              <Row justify="end">
                <Col span={24}>
                  {mode !== APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.SHARED_LIST_RULE_VIEW ? (
                    <AddPairButton
                      disabled={isSampleRule || !isValidPermission}
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
