import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row, message, Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
  getActiveModals,
  getAppMode,
  getCurrentlySelectedRuleConfig,
  getCurrentlySelectedRuleData,
} from "store/selectors";
import { RQButton, RQEditorTitle, RQModal } from "lib/design-system/components";
import RulePairs from "components/features/rules/RulePairs";
import AddPairButton from "components/features/rules/RuleBuilder/Body/Columns/AddPairButton";
import CreateRuleButton from "components/features/rules/RuleBuilder/Header/ActionButtons/CreateRuleButton";
import DeleteButton from "components/features/rules/RuleBuilder/Header/ActionButtons/DeleteButton";
import ExportButton from "components/features/rules/RuleBuilder/Header/ActionButtons/ExportButton";
import PinButton from "components/features/rules/RuleBuilder/Header/ActionButtons/PinButton";
import RuleStatusButton from "components/features/rules/RuleBuilder/Header/ActionButtons/Status";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import SpinnerColumn from "components/misc/SpinnerColumn";
import { onChangeHandler } from "components/features/rules/RuleBuilder/Body/actions";
import { actions } from "store";
import {
  setCurrentlySelectedRule,
  setCurrentlySelectedRuleConfig,
  initiateBlankCurrentlySelectedRule,
} from "components/features/rules/RuleBuilder/actions";
import { RULE_EDITOR_FIELD_SELECTOR } from "./dom-selectors";
import { StorageService } from "init";
import { prefillRuleData } from "./prefill";
import { generateRuleDescription, getEventObject } from "./utils";
import { getRuleConfigInEditMode } from "utils/rules/misc";
import { redirectTo404, redirectToRuleEditor } from "utils/RedirectionUtils";
import { Rule, Status } from "types";
import { trackRuleEditorViewed } from "modules/analytics/events/common/rules";
import "./RuleEditorModal.css";
import ShareRuleButton from "components/features/rules/RuleBuilder/Header/ActionButtons/ShareRuleButton";

enum EditorMode {
  EDIT = "edit",
  CREATE = "create",
}

interface props {
  isOpen: boolean;
  handleModalClose: () => void;
  analyticEventEditorViewedSource: string;
}

const RuleEditorModal: React.FC<props> = ({ isOpen, handleModalClose, analyticEventEditorViewedSource }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const { ruleEditorModal } = useSelector(getActiveModals);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const { ruleData, ruleType = "", ruleId = "", mode = EditorMode.CREATE } = ruleEditorModal.props;

  const ruleMenuOptions = useMemo(
    () => (
      <Menu className="editor-rule-options-menu">
        <Menu.Item key="1" className="editor-rule-options-menu-item" onClick={() => setIsOptionsVisible(false)}>
          <PinButton rule={currentlySelectedRuleData} isRuleEditorModal={true} />
        </Menu.Item>
        <Menu.Item key="2" className="editor-rule-options-menu-item" onClick={() => setIsOptionsVisible(false)}>
          <ExportButton rule={currentlySelectedRuleData} isDisabled={false} />
        </Menu.Item>
        <Menu.Item key="3" className="editor-rule-options-menu-item" onClick={() => setIsOptionsVisible(false)}>
          <ShareRuleButton isRuleEditorModal={true} />
        </Menu.Item>
      </Menu>
    ),
    [currentlySelectedRuleData]
  );

  useEffect(() => {
    if (mode === EditorMode.CREATE || !ruleId) return;

    setIsLoading(true);
    StorageService(appMode)
      .getRecord(ruleId)
      .then((rule) => {
        if (rule === undefined) {
          redirectTo404(navigate);
        } else {
          setCurrentlySelectedRule(dispatch, rule);
          setCurrentlySelectedRuleConfig(dispatch, getRuleConfigInEditMode(rule), navigate);
        }
      })
      .finally(() => setIsLoading(false));

    return () => {
      dispatch(actions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [mode, appMode, ruleId, dispatch, navigate]);

  useEffect(() => {
    if (mode === EditorMode.EDIT) return;

    const ruleConfig = RULE_TYPES_CONFIG[ruleType];
    const newRule = initiateBlankCurrentlySelectedRule(dispatch, ruleConfig, ruleType, setCurrentlySelectedRule);
    setCurrentlySelectedRuleConfig(dispatch, ruleConfig, navigate);

    if (newRule) {
      const prefilledRule: Rule = {
        ...prefillRuleData(ruleData, newRule),
        name: `${ruleType}_untitled`,
        description: generateRuleDescription(ruleType, ruleData),
        status: Status.ACTIVE,
      };

      setCurrentlySelectedRule(dispatch, prefilledRule);
    }

    return () => {
      dispatch(actions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [mode, dispatch, ruleData, ruleType, navigate]);

  useEffect(() => {
    if (mode === EditorMode.EDIT) return;

    setTimeout(() => {
      const element = document.querySelector(
        //@ts-ignore
        `input[data-selectionid=${RULE_EDITOR_FIELD_SELECTOR[ruleType]}]`
      ) as HTMLInputElement;

      if (element) {
        element.focus();
      }
    }, 0); // finish all the state updates then run this
  }, [mode, ruleType]);

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
    (ruleId: string) => {
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
        {isLoading ? (
          <SpinnerColumn skeletonCount={2} />
        ) : (
          <>
            <Row align="middle" justify="space-between" className="rule-editor-modal-header">
              <RQEditorTitle
                mode={mode}
                name={currentlySelectedRuleData?.name ?? ""}
                nameChangeCallback={(name) => handleRuleTitleChange("name", name)}
                namePlaceholder="Enter rule name"
                description={currentlySelectedRuleData?.description ?? ""}
                descriptionChangeCallback={(description) => handleRuleTitleChange("description", description)}
                descriptionPlaceholder="Add description (optional)"
              />

              <Col span={7}>
                <Row align="middle" justify="space-evenly" wrap={false}>
                  <RuleStatusButton location={window.location} />
                  {mode === EditorMode.EDIT && (
                    <>
                      <DeleteButton
                        rule={currentlySelectedRuleData}
                        isDisabled={mode === EditorMode.CREATE}
                        isRuleEditorModal={true}
                        ruleDeletedCallback={() => handleModalClose()}
                      />

                      <Dropdown
                        overlay={ruleMenuOptions}
                        open={isOptionsVisible}
                        trigger={["click"]}
                        onOpenChange={setIsOptionsVisible}
                      >
                        <RQButton iconOnly type="default" icon={<MoreOutlined />} />
                      </Dropdown>
                    </>
                  )}

                  <CreateRuleButton
                    location={location}
                    isRuleEditorModal={true}
                    ruleEditorModalMode={mode}
                    analyticEventRuleCreatedSource={analyticEventEditorViewedSource}
                    ruleCreatedFromEditorModalCallback={ruleCreatedCallback}
                  />
                </Row>
              </Col>
            </Row>

            <div className="rule-editor-modal-container">
              <RulePairs mode={mode} currentlySelectedRuleConfig={currentlySelectedRuleConfig} />

              {currentlySelectedRuleConfig?.ALLOW_ADD_PAIR ? (
                <Row justify="end">
                  <Col span={24}>
                    <AddPairButton currentlySelectedRuleConfig={currentlySelectedRuleConfig} />
                  </Col>
                </Row>
              ) : null}
            </div>
          </>
        )}
      </div>
    </RQModal>
  );
};

export default React.memo(RuleEditorModal);
