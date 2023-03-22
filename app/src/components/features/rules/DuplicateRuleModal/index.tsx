import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Col, Input, Modal, Row } from "antd";
import type { InputRef } from "antd";
import { StorageService } from "../../../../init";
import { getAppMode } from "store/selectors";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { generateObjectId } from "utils/FormattingHelper";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRuleDuplicatedEvent } from "modules/analytics/events/common/rules";
import { toast } from "utils/Toast";
import { Rule, Status } from "types/rules";
import "./duplicateRuleModal.scss";

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
  const appMode = useSelector(getAppMode);
  const [newRuleName, setNewRuleName] = useState<string>();
  const ruleNameInputRef = useRef<InputRef>(null);

  const onRuleNameChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNewRuleName(evt.target.value);
    },
    []
  );

  const duplicateRule = useCallback(async () => {
    const newRule: Rule = {
      ...rule,
      creationDate: generateObjectCreationDate(),
      name: newRuleName,
      id: rule.ruleType + "_" + generateObjectId(),
      isSample: false,
      isFavourite: false,
      status: Status.INACTIVE,
    };

    await StorageService(appMode).saveRuleOrGroup(newRule);
    toast.success("Duplicated the rule successfully.");
    trackRQLastActivity("rule_duplicated");
    trackRuleDuplicatedEvent(rule.ruleType);
    onDuplicate(newRule);
    close();
  }, [appMode, onDuplicate, rule, close, newRuleName]);

  useEffect(() => {
    if (isOpen) {
      ruleNameInputRef.current!.focus({ cursor: "all" });
    }
  }, [isOpen]);

  useEffect(() => {
    setNewRuleName(generateCopiedRuleName(rule.name));
  }, [rule]);

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
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateRuleModal;
