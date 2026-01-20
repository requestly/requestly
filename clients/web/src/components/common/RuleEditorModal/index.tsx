import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row, message, Dropdown, Menu, Typography } from "antd";
import { MoreOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getAppMode, getCurrentlySelectedRuleConfig, getCurrentlySelectedRuleData } from "store/selectors";
import { getActiveModals } from "store/slices/global/modals/selectors";
import { RQButton, RQEditorTitle, RQModal } from "lib/design-system/components";
import RulePairs from "components/features/rules/RulePairs";
import AddPairButton from "components/features/rules/RuleBuilder/Body/Columns/AddPairButton";
import CreateRuleButton from "views/features/rules/RuleEditor/components/Header/ActionButtons/CreateRuleButton";
import DeleteButton from "views/features/rules/RuleEditor/components/Header/ActionButtons/DeleteButton";
import PinButton from "views/features/rules/RuleEditor/components/Header/ActionButtons/PinButton";
import RuleStatusButton from "views/features/rules/RuleEditor/components/Header/ActionButtons/Status";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import SpinnerColumn from "components/misc/SpinnerColumn";
import { onChangeHandler } from "components/features/rules/RuleBuilder/Body/actions";
import { globalActions } from "store/slices/global/slice";
import {
  setCurrentlySelectedRule,
  setCurrentlySelectedRuleConfig,
  initiateBlankCurrentlySelectedRule,
} from "components/features/rules/RuleBuilder/actions";
import { RULE_EDITOR_FIELD_SELECTOR } from "./dom-selectors";
import { prefillRuleData } from "./prefill";
import { generateRuleDescription, getEventObject } from "./utils";
import { getRuleConfigInEditMode } from "utils/rules/misc";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { RecordStatus, Rule, ResponseRule, RuleType, RuleSourceOperator } from "@requestly/shared/types/entities/rules";
import ShareRuleButton from "views/features/rules/RuleEditor/components/Header/ActionButtons/ShareRuleButton";
import { RoleBasedComponent, useRBAC } from "features/rbac";
import "./RuleEditorModal.css";
import clientRuleStorageService from "services/clientStorageService/features/rule";

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
  const appMode = useSelector(getAppMode);
  const { ruleEditorModal } = useSelector(getActiveModals);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isRuleNotFound, setIsRuleNotFound] = useState(false);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");
  const { ruleData, ruleType = "", ruleId = "", mode = EditorMode.CREATE } = ruleEditorModal.props;

  const ruleMenuOptions = useMemo(
    () => (
      <Menu className="editor-rule-options-menu">
        <Menu.Item key="1" className="editor-rule-options-menu-item">
          <PinButton rule={currentlySelectedRuleData} isRuleEditorModal={true} />
        </Menu.Item>
        <Menu.Item key="3" className="editor-rule-options-menu-item">
          <ShareRuleButton isRuleEditorModal={true} />
        </Menu.Item>
      </Menu>
    ),
    [currentlySelectedRuleData]
  );

  useEffect(() => {
    if (mode === EditorMode.CREATE || !ruleId) return;

    setIsLoading(true);
    clientRuleStorageService
      .getRecordById(ruleId)
      .then((rule) => {
        if (rule === undefined) {
          setIsRuleNotFound(true);
        } else {
          setCurrentlySelectedRule(dispatch, rule);
          setCurrentlySelectedRuleConfig(dispatch, getRuleConfigInEditMode(rule), navigate);
        }
      })
      .finally(() => setIsLoading(false));

    return () => {
      dispatch(globalActions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [mode, appMode, ruleId, dispatch, navigate]);

  const initializeEditorWithPrefilledData = useCallback(() => {
    const ruleConfig = RULE_TYPES_CONFIG[ruleType];
    const newRule: any = initiateBlankCurrentlySelectedRule(dispatch, ruleConfig, ruleType, setCurrentlySelectedRule);
    setCurrentlySelectedRuleConfig(dispatch, ruleConfig, navigate);

    if (newRule) {
      const prefilledRule: Rule = {
        ...prefillRuleData(ruleData, newRule),
        name: `${ruleType}_untitled`,
        description: generateRuleDescription(ruleType, ruleData),
        status: RecordStatus.ACTIVE,
      };

      if (ruleType === RuleType.RESPONSE && prefilledRule.ruleType === RuleType.RESPONSE) {
        // Handling prefill for graphql resource type response rule
        const { GQLDetails } = ruleData.metadata || {};
        const pair = prefilledRule.pairs[0];
        const sourceFilters = pair.source.filters;
        if (GQLDetails?.operationName) {
          pair.response.resourceType = ResponseRule.ResourceType.GRAPHQL_API;
          pair.source.filters = [
            ...sourceFilters,
            {
              requestPayload: {
                key: "operationName",
                operator: RuleSourceOperator.EQUALS,
                value: GQLDetails.operationName,
              },
            },
          ];
          prefilledRule.pairs[0] = pair;
        } else if (GQLDetails?.query) {
          pair.response.resourceType = ResponseRule.ResourceType.GRAPHQL_API;
          pair.source.filters = [
            ...sourceFilters,
            {
              requestPayload: {
                key: "query",
                operator: RuleSourceOperator.CONTAINS,
                value: GQLDetails.query,
              },
            },
          ];
          prefilledRule.pairs[0] = pair;
        }
      }

      setCurrentlySelectedRule(dispatch, prefilledRule);
    }
  }, [ruleData, ruleType, dispatch, navigate]);

  useEffect(() => {
    if (mode === EditorMode.EDIT) return;
    initializeEditorWithPrefilledData();

    return () => {
      dispatch(globalActions.clearCurrentlySelectedRuleAndConfig());
    };
  }, [mode, initializeEditorWithPrefilledData, dispatch]);

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

  return (
    <RQModal
      centered
      key={ruleType}
      open={isOpen}
      width={isRuleNotFound ? "350px" : "920px"}
      maskClosable={isRuleNotFound}
      onCancel={handleModalClose}
      className="rule-editor-modal"
    >
      <div className="rq-modal-content">
        {isLoading ? (
          <SpinnerColumn skeletonCount={2} />
        ) : isRuleNotFound ? (
          <>
            <CloseCircleOutlined className="error-icon display-row-center w-full" />
            <Typography.Text className="header display-row-center mt-1">Rule not found</Typography.Text>
          </>
        ) : (
          <>
            <Row align="middle" justify="space-between" className="rule-editor-modal-header">
              <RQEditorTitle
                mode={mode}
                name={currentlySelectedRuleData?.name ?? ""}
                disabled={!isValidPermission}
                nameChangeCallback={(name) => handleRuleTitleChange("name", name)}
                namePlaceholder="Enter rule name"
                description={currentlySelectedRuleData?.description ?? ""}
                descriptionChangeCallback={(description) => handleRuleTitleChange("description", description)}
                descriptionPlaceholder="Add description (optional)"
              />

              <RoleBasedComponent resource="http_rule" permission="create">
                <Col span={7}>
                  <Row align="middle" justify="end" wrap={false} className="rule-editor-modal-actions">
                    <RuleStatusButton isRuleEditorModal={true} mode={mode} />
                    {mode === EditorMode.EDIT && (
                      <>
                        <DeleteButton
                          rule={currentlySelectedRuleData}
                          isDisabled={mode === EditorMode.CREATE}
                          isRuleEditorModal={true}
                          ruleDeletedCallback={() => handleModalClose()}
                        />

                        <Dropdown overlay={ruleMenuOptions} trigger={["click"]} placement="bottomRight">
                          <RQButton iconOnly type="default" icon={<MoreOutlined />} />
                        </Dropdown>
                      </>
                    )}

                    <CreateRuleButton
                      isRuleEditorModal={true}
                      ruleEditorModalMode={mode}
                      analyticEventRuleCreatedSource={"rule_editor_modal_header"}
                      ruleCreatedFromEditorModalCallback={ruleCreatedCallback}
                    />
                  </Row>
                </Col>
              </RoleBasedComponent>
            </Row>

            <div className="rule-editor-modal-container">
              <RulePairs mode={mode} currentlySelectedRuleConfig={currentlySelectedRuleConfig} />

              {currentlySelectedRuleConfig?.ALLOW_ADD_PAIR ? (
                <Row justify="end">
                  <Col span={24}>
                    <AddPairButton
                      disabled={!isValidPermission}
                      currentlySelectedRuleConfig={currentlySelectedRuleConfig}
                    />
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
