import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Col, Input, Modal, Row, Select, Space } from "antd";
import { StorageService } from "../../../../init";
import { getAppMode, getIsRefreshRulesPending, getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { transformAndValidateRuleFields } from "views/features/rules/RuleEditor/components/Header/ActionButtons/CreateRuleButton/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { submitAttrUtil, trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRuleDuplicatedEvent, trackGroupDuplicatedEvent } from "modules/analytics/events/common/rules";
import { toast } from "utils/Toast";
import type { InputRef } from "antd";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { RQButton } from "lib/design-system/components";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { getAllRulesOfGroup } from "utils/rules/misc";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import "./duplicateRuleModal.scss";
import { Group, RecordStatus, Rule, StorageRecord } from "@requestly/shared/types/entities/rules";
import { isGroup, isRule } from "features/rules";
import { getActiveWorkspaceId, getAllWorkspaces } from "store/slices/workspaces/selectors";

interface Props {
  isOpen: boolean;
  close: () => void;
  record: StorageRecord;
  onDuplicate: (newRule: Rule) => void;
  analyticEventSource?: string;
}

const generateCopiedRuleName = (recordName: string): string => recordName + " Copy";

const DuplicateRecordModal: React.FC<Props> = ({ isOpen, close, record, onDuplicate, analyticEventSource = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userAttributes = useSelector(getUserAttributes);
  const [newRecordName, setNewRecordName] = useState<string>();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(null);
  const isRecordRule = useMemo(() => isRule(record), [record]);
  const isDuplicationInSameWorkspace = useMemo(() => selectedWorkspaceId === activeWorkspaceId, [
    selectedWorkspaceId,
    activeWorkspaceId,
  ]);
  const recordNameInputRef = useRef<InputRef>(null);

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

  const onRecordNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNewRecordName(evt.target.value);
  }, []);

  const getNewDuplicatedRule = useCallback(
    async (rule: Rule, groupId?: string, isGroupBeingDuplicated: boolean = false): Promise<Rule> => {
      const parsedRuleData = await transformAndValidateRuleFields(rule);
      const finalRuleData = (parsedRuleData.success ? parsedRuleData.ruleData : rule) as Rule;

      const newRule = {
        ...finalRuleData,
        creationDate: generateObjectCreationDate(),
        createdBy: user?.details?.profile?.uid || null,
        name: isGroupBeingDuplicated ? generateCopiedRuleName(rule.name) : newRecordName,
        id: rule.ruleType + "_" + generateObjectId(),
        isFavourite: false,
        status: RecordStatus.INACTIVE,
      };
      if (groupId && isGroupBeingDuplicated) {
        newRule.groupId = groupId;
      }

      return newRule;
    },
    [user?.details?.profile?.uid, newRecordName]
  );

  const handleDuplicateRule = useCallback(async () => {
    if (isRule(record)) {
      const newRule = await getNewDuplicatedRule(record);

      if (!isDuplicationInSameWorkspace) {
        newRule.groupId = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;
      }

      try {
        await StorageService(appMode).saveRuleOrGroup(newRule, {
          workspaceId: selectedWorkspaceId,
        });
      } catch (err) {
        toast.error("Something went wrong!");
        return;
      }

      if (isDuplicationInSameWorkspace) {
        toast.success("Duplicated the rule successfully.");
        redirectToRuleEditor(navigate, newRule.id, analyticEventSource);
      } else {
        toast.success("Duplicated the rule in the selected workspace successfully.");
      }

      trackRQLastActivity("rule_duplicated");
      trackRuleDuplicatedEvent(
        record.ruleType,
        isDuplicationInSameWorkspace ? "same" : "different",
        analyticEventSource
      );
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_RULES, userAttributes.num_rules + 1);
      onDuplicate(newRule);
      close();
    }
  }, [
    record,
    appMode,
    onDuplicate,
    close,
    navigate,
    userAttributes.num_rules,
    analyticEventSource,
    getNewDuplicatedRule,
    isDuplicationInSameWorkspace,
    selectedWorkspaceId,
  ]);

  const handleDuplicateGroup = useCallback(async () => {
    if (isGroup(record)) {
      const newGroup: Group = {
        ...record,
        id: "Group_" + generateObjectId(),
        name: newRecordName,
        creationDate: generateObjectCreationDate(),
        createdBy: user?.details?.profile?.uid || null,
        status: RecordStatus.INACTIVE,
        isFavourite: false,
      };

      const groupRules = await getAllRulesOfGroup(appMode, record.id);
      const duplicatedGroupRulesPromise = groupRules.map(async (rule: Rule) => {
        const newRule = await getNewDuplicatedRule(rule, newGroup.id, true);
        return newRule;
      });

      Promise.all(duplicatedGroupRulesPromise).then((duplicatedGroupRules) => {
        StorageService(appMode)
          .saveMultipleRulesOrGroups([newGroup, ...duplicatedGroupRules], {
            workspaceId: selectedWorkspaceId,
          })
          .then(() => {
            if (isDuplicationInSameWorkspace) {
              toast.success("Duplicated the group successfully.");
              dispatch(
                globalActions.updateRefreshPendingStatus({
                  type: "rules",
                  newValue: !isRulesListRefreshPending,
                })
              );
            } else {
              toast.success("Duplicated the group in the selected workspace successfully.");
            }
            trackRQLastActivity("group_duplicated");
            trackGroupDuplicatedEvent(
              duplicatedGroupRules.length,
              isDuplicationInSameWorkspace ? "same" : "different",
              analyticEventSource
            );
            submitAttrUtil(
              APP_CONSTANTS.GA_EVENTS.ATTR.NUM_RULES,
              userAttributes.num_rules + duplicatedGroupRules.length + 1
            );
            close();
          })
          .catch((err) => {
            toast.error("Something went wrong!");
            Logger.error("Error while duplicating group", err);
          });
      });
    }
  }, [
    dispatch,
    user?.details?.profile?.uid,
    record,
    appMode,
    newRecordName,
    getNewDuplicatedRule,
    close,
    userAttributes.num_rules,
    isRulesListRefreshPending,
    selectedWorkspaceId,
    isDuplicationInSameWorkspace,
    analyticEventSource,
  ]);

  useEffect(() => {
    if (isOpen) {
      recordNameInputRef.current!.focus({ cursor: "all" });
    }
  }, [isOpen]);

  useEffect(() => {
    setNewRecordName(generateCopiedRuleName(record.name));
  }, [record]);

  useEffect(() => {
    if (isUsingWorkspaces) {
      setSelectedWorkspaceId(activeWorkspaceId);
    }
  }, [availableWorkspaces, activeWorkspaceId, isUsingWorkspaces, isRecordRule]);

  return (
    <Modal
      className="modal-dialog-centered modal-danger"
      open={isOpen}
      title={isRecordRule ? "Duplicate rule" : "Duplicate group"}
      onCancel={close}
      footer={
        <Row justify="end" align="middle">
          <Space size={8}>
            <RQButton type="default" onClick={close}>
              Cancel
            </RQButton>
            <PremiumFeature
              popoverPlacement="top"
              onContinue={isRecordRule ? handleDuplicateRule : handleDuplicateGroup}
              features={[FeatureLimitType.num_rules]}
              source="duplicate_rule"
            >
              <RQButton disabled={!newRecordName} type="primary">
                Duplicate
              </RQButton>
            </PremiumFeature>
          </Space>
        </Row>
      }
    >
      <div className="modal-body">
        <div className="duplicate-rule-modal-body">
          <Row align="middle">
            <Col span={8}>{isRecordRule ? "Rule name" : "Group name"}</Col>
            <Col span={16}>
              <Input
                ref={recordNameInputRef}
                placeholder="Enter name of the new rule"
                value={newRecordName}
                onChange={onRecordNameChange}
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

export default DuplicateRecordModal;
