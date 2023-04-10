import React, { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row, message } from "antd";
import { getActiveModals, getCurrentlySelectedRuleConfig, getCurrentlySelectedRuleData } from "store/selectors";
import { RQEditorTitle, RQModal } from "lib/design-system/components";
import RulePairs from "components/features/rules/RulePairs";
import AddPairButton from "components/features/rules/RuleBuilder/Body/Columns/AddPairButton";
import CreateRuleButton from "components/features/rules/RuleBuilder/Header/ActionButtons/CreateRuleButton";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { onChangeHandler } from "components/features/rules/RuleBuilder/Body/actions";
import { actions } from "store";
import {
  setCurrentlySelectedRule,
  setCurrentlySelectedRuleConfig,
  initiateBlankCurrentlySelectedRule,
} from "components/features/rules/RuleBuilder/actions";
import { RULE_EDITOR_FIELD_SELECTOR } from "./dom-selectors";
import { prefillRuleData } from "./prefill";
import { Rule, Status } from "types";
import { trackRuleEditorViewed } from "modules/analytics/events/common/rules";
import "./RuleEditorModal.css";
import { redirectToRuleEditor } from "utils/RedirectionUtils";

const getEventObject = (name: string, value: string) => ({
  target: { name, value },
});

interface props {
  isOpen: boolean;
  handleModalClose: () => void;
  analyticEventEditorViewedSource: string;
}

const RuleEditorModal: React.FC<props> = ({ isOpen, handleModalClose, analyticEventEditorViewedSource }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { ruleEditorModal } = useSelector(getActiveModals);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const { ruleData, ruleType = "" } = ruleEditorModal.props;
  const ruleConfig = RULE_TYPES_CONFIG[ruleType];

  useEffect(() => {
    setCurrentlySelectedRuleConfig(dispatch, RULE_TYPES_CONFIG[ruleType], navigate);
    const newRule = initiateBlankCurrentlySelectedRule(
      dispatch,
      currentlySelectedRuleConfig,
      ruleType,
      setCurrentlySelectedRule
    );

    if (newRule) {
      const prefilledRule: Rule = {
        ...prefillRuleData(ruleData, newRule),
        name: `${ruleType}_untitled`,
        description: `${ruleType.toLowerCase()}_untitled`,
        status: Status.ACTIVE,
      };

      setCurrentlySelectedRule(dispatch, prefilledRule);
    }

    return () => {
      dispatch(actions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [dispatch, ruleData, currentlySelectedRuleConfig, ruleType, navigate]);

  useEffect(() => {
    setTimeout(() => {
      const element = document.querySelector(
        //@ts-ignore
        `input[data-selectionid=${RULE_EDITOR_FIELD_SELECTOR[ruleType]}]`
      ) as HTMLInputElement;

      if (element) {
        element.focus();
      }
    }, 0); // finish all the state updates then run this
  }, [ruleType]);

  const handleRuleTitleChange = useCallback(
    (key: "name" | "description", value: string) => {
      const event = getEventObject(key, value);
      onChangeHandler(currentlySelectedRuleData, dispatch, event);
    },
    [dispatch, currentlySelectedRuleData]
  );

  const showRuleCreatedFromModalToast = useCallback(
    (ruleId: string) => {
      message.success({
        key: "rule_editor_modal",
        content: (
          <span>
            Rule created successfully
            <Button
              type="text"
              className="view-rule-toast-btn"
              onClick={() => {
                message.destroy("rule_editor_modal");
                redirectToRuleEditor(navigate, ruleId, "create");
              }}
            >
              View rule
            </Button>
          </span>
        ),
      });
    },
    [navigate]
  );

  const ruleCreatedCallback = useCallback(
    (ruleId: any) => {
      handleModalClose();
      showRuleCreatedFromModalToast(ruleId);
    },
    [handleModalClose, showRuleCreatedFromModalToast]
  );

  useEffect(() => {
    trackRuleEditorViewed(analyticEventEditorViewedSource, ruleType);
  }, [analyticEventEditorViewedSource, ruleType]);

  return (
    <RQModal
      centered
      key={ruleType}
      open={isOpen}
      width="920px"
      maskClosable={false}
      onCancel={handleModalClose}
      className="rule-editor-modal"
    >
      <div className="rq-modal-content">
        <Row align="middle" justify="space-between" className="rule-editor-modal-header">
          <RQEditorTitle
            mode="create"
            name={currentlySelectedRuleData?.name ?? ""}
            nameChangeCallback={(name) => handleRuleTitleChange("name", name)}
            namePlaceholder="Enter rule name"
            description={currentlySelectedRuleData?.description ?? ""}
            descriptionChangeCallback={(description) => handleRuleTitleChange("description", description)}
            descriptionPlaceholder="Add description (optional)"
          />

          <CreateRuleButton
            location={location}
            isRuleEditorModal={true}
            analyticEventRuleCreatedSource={analyticEventEditorViewedSource}
            ruleCreatedFromEditorModalCallback={ruleCreatedCallback}
          />
        </Row>

        <div className="rule-editor-modal-container">
          <RulePairs mode="create" currentlySelectedRuleConfig={ruleConfig} />

          {ruleConfig.ALLOW_ADD_PAIR ? (
            <Row justify="end">
              <Col span={24}>
                <AddPairButton currentlySelectedRuleConfig={ruleConfig} />
              </Col>
            </Row>
          ) : null}
        </div>
      </div>
    </RQModal>
  );
};

export default React.memo(RuleEditorModal);
