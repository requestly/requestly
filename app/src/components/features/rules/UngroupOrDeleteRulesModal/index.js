import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Space, Typography } from "antd";
import { StorageService } from "../../../../init";
import { getAppMode, getGroupwiseRulesToPopulate, getIsRefreshRulesPending, getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { toast } from "utils/Toast.js";
import { deleteGroup } from "../RulesListContainer/RulesTable/actions";
import { deleteGroupsFromStorage, deleteRulesFromStorage } from "../DeleteRulesModal/actions";
import { addRecordsToTrash } from "utils/trash/TrashUtils";
import { AUTH } from "modules/analytics/events/common/constants";
import Logger from "lib/logger";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { deleteTestReportByRuleId } from "../TestThisRule/helpers";

const UNGROUPED_GROUP_ID = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;

const UngroupOrDeleteRulesModal = ({ isOpen, toggle, groupIdToDelete, groupRuleIds: groupRules, callback }) => {
  console.log("UngroupOrDeleteRulesModal", groupIdToDelete, groupRules);
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);

  // Component State
  const [loadingSomething, setLoadingSomething] = useState(false);

  const doMoveToUngrouped = () => {
    return new Promise((resolve) => {
      // Fetch all records to get rule data
      Logger.log("Reading storage in doMoveToUngrouped");
      StorageService(appMode)
        .getAllRecords()
        .then((allRecords) => {
          const updatedRules = groupRules.map((rule) => {
            return {
              ...allRecords[rule.id],
              modificationDate: generateObjectCreationDate(),
              groupId: UNGROUPED_GROUP_ID,
            };
          });

          Logger.log("Writing storage in doMoveToUngrouped");
          console.log("updatedRules", updatedRules);
          StorageService(appMode)
            .saveMultipleRulesOrGroups(updatedRules)
            .then(() => resolve());
        });
    });
  };

  const moveToUngrouped = () => {
    setLoadingSomething(true);
    doMoveToUngrouped()
      .then(() => {
        // Now delete the Group
        deleteGroup(appMode, groupIdToDelete, groupwiseRulesToPopulate, true)
          .then(() => {
            callback && callback();
            // Refresh the rules list
            dispatch(
              actions.updateRefreshPendingStatus({
                type: "rules",
                newValue: !isRulesListRefreshPending,
              })
            );
            // Notify user
            toast.success("Group deleted");
            // STFU and close the modal!
            toggle();
          })
          .catch(() => {
            setLoadingSomething(false);
          });
      })
      .catch(() => {
        setLoadingSomething(false);
      });
  };
  const ruleIdsToDelete = useMemo(() => groupRules.map((rule) => rule.id), [groupRules]);

  const handleRulesDeletion = async (uid) => {
    if (!uid) return;

    return addRecordsToTrash(uid, groupRules).then((result) => {
      return new Promise((resolve, reject) => {
        if (result.success) {
          deleteRulesFromStorage(appMode, ruleIdsToDelete, () => resolve(true));
        } else {
          reject();
        }
      });
    });
  };

  const handleRecordsDeletion = async (uid) => {
    await handleRulesDeletion(uid);
    await deleteGroupsFromStorage(appMode, [groupIdToDelete]);
    deleteTestReportByRuleId(appMode, ruleIdsToDelete);
  };

  const promptUserToSignup = (source) => {
    const signInSuccessCallback = (uid) => {
      deleteRulesAndThenGroup();
    };

    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          callback: signInSuccessCallback,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const deleteRulesAndThenGroup = () => {
    // Login is mandatory since we have move Rules to the Trash
    if (!user.loggedIn) {
      promptUserToSignup(AUTH.SOURCE.DELETE_RULE);
      return;
    }

    setLoadingSomething(true);

    handleRecordsDeletion(user?.details?.profile?.uid).then(() => {
      //Refresh List
      dispatch(actions.updateHardRefreshPendingStatus({ type: "rules" }));
      // Notify user
      toast.success("Group deleted");
      // STFU and close the modal!
      toggle();
    });
  };

  if (!groupIdToDelete) return null;

  return (
    <Modal open={isOpen} title="Delete Group" confirmLoading={loadingSomething} onCancel={toggle} footer={null}>
      <Row>
        <Col>
          <Typography.Title level={5}>This group contains one or more rules</Typography.Title>
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={24} align="end">
          <Space>
            <Button
              color="secondary"
              data-dismiss="modal"
              type="button"
              onClick={moveToUngrouped}
              loading={loadingSomething}
            >
              Keep the rules
            </Button>
            <Button type="danger" loading={loadingSomething} data-dismiss="modal" onClick={deleteRulesAndThenGroup}>
              <DeleteOutlined /> Delete rules
            </Button>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default UngroupOrDeleteRulesModal;
