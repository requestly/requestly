import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Col, Input, Modal, Row, Select } from "antd";
import { StorageService } from "../../../../init";
import { getAppMode } from "store/selectors";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { generateObjectId } from "utils/FormattingHelper";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRuleDuplicatedEvent } from "modules/analytics/events/common/rules";
import { toast } from "utils/Toast";
import type { InputRef } from "antd";
import { Rule, Status } from "types/rules";
import "./duplicateRuleModal.scss";
import {
  getAvailableTeams,
  getCurrentlyActiveWorkspace,
} from "store/features/teams/selectors";
import { TeamWorkspace } from "types/teamWorkspace";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";

interface Props {
  isOpen: boolean;
  close: () => void;
  rule: Rule;
  onDuplicate: (newRule: Rule) => void;
}

const generateCopiedRuleName = (ruleName: string): string => ruleName + " Copy";

const DuplicateRuleModal: React.FC<Props> = ({
  isOpen,
  close,
  rule,
  onDuplicate,
}) => {
  const navigate = useNavigate();
  const availableWorkspaces: TeamWorkspace[] = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const appMode = useSelector(getAppMode);
  const [newRuleName, setNewRuleName] = useState<string>();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(null);
  const ruleNameInputRef = useRef<InputRef>(null);

  const isUsingWorkspaces = useMemo(() => {
    return availableWorkspaces?.length > 0;
  }, [availableWorkspaces?.length]);

  const workspaceOptions = useMemo(() => {
    if (!isUsingWorkspaces) {
      return [];
    }

    return [
      {
        value: null,
        label: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
      },
      ...availableWorkspaces.map(({ id, name }) => ({
        value: id,
        label: name,
      })),
    ];
  }, [availableWorkspaces, isUsingWorkspaces]);

  const onRuleNameChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNewRuleName(evt.target.value);
    },
    []
  );

  const duplicateRule = useCallback(async () => {
    const isOperationInSameWorkspace =
      selectedWorkspaceId === currentlyActiveWorkspace.id;

    const newRule: Rule = {
      ...rule,
      creationDate: generateObjectCreationDate(),
      name: newRuleName,
      id: rule.ruleType + "_" + generateObjectId(),
      isSample: false,
      isFavourite: false,
      status: Status.INACTIVE,
    };

    if (!isOperationInSameWorkspace) {
      newRule.groupId =
        APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;
    }

    try {
      await StorageService(appMode).saveRuleOrGroup(newRule, {
        workspaceId: selectedWorkspaceId,
      });
    } catch (err) {
      toast.error("Something went wrong!");
      return;
    }

    if (isOperationInSameWorkspace) {
      toast.success("Duplicated the rule successfully.");
      redirectToRuleEditor(navigate, newRule.id);
    } else {
      toast.success(
        "Duplicated the rule in the selected workspace successfully."
      );
    }

    trackRQLastActivity("rule_duplicated");
    trackRuleDuplicatedEvent(rule.ruleType);

    onDuplicate(newRule);
    close();
  }, [
    rule,
    newRuleName,
    appMode,
    selectedWorkspaceId,
    currentlyActiveWorkspace.id,
    onDuplicate,
    close,
    navigate,
  ]);

  useEffect(() => {
    if (isOpen) {
      ruleNameInputRef.current!.focus({ cursor: "all" });
    }
  }, [isOpen]);

  useEffect(() => {
    setNewRuleName(generateCopiedRuleName(rule.name));
  }, [rule]);

  useEffect(() => {
    if (isUsingWorkspaces) {
      setSelectedWorkspaceId(currentlyActiveWorkspace.id);
    }
  }, [availableWorkspaces, currentlyActiveWorkspace, isUsingWorkspaces]);

  return !rule ? null : (
    <Modal
      className="modal-dialog-centered modal-danger"
      open={isOpen}
      title="Duplicate rule"
      onCancel={close}
      onOk={duplicateRule}
      okText="Duplicate"
      okButtonProps={{ disabled: !newRuleName }}
    >
      <div className="modal-body">
        <div className="duplicate-rule-modal-body">
          <Row align="middle">
            <Col span={8}>Rule name</Col>
            <Col span={16}>
              <Input
                ref={ruleNameInputRef}
                placeholder="Enter name of the new rule"
                value={newRuleName}
                onChange={onRuleNameChange}
              />
            </Col>
          </Row>
          {isUsingWorkspaces ? (
            <Row align="middle">
              <Col span={8}>Target workspace</Col>
              <Col span={16}>
                <Select
                  className="workspace-selector"
                  value={selectedWorkspaceId}
                  onChange={setSelectedWorkspaceId}
                  options={workspaceOptions}
                />
              </Col>
            </Row>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateRuleModal;
