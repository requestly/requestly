import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Button, Input, Space, Modal } from "antd";
import { toast } from "utils/Toast.js";
//SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
//SERVICES
import { StorageService } from "../../../../init";
import { getAppMode, getIsRefreshRulesPending, getUserAuthDetails } from "../../../../store/selectors";
import { actions } from "../../../../store";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import Logger from "lib/logger";

import "./index.scss";

const RenameGroupModal = ({ groupId, isOpen, toggle }) => {
  //Load props
  const groupIdFromProps = groupId.groupId;

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const appMode = useSelector(getAppMode);

  //Component State
  const [originalGroup, setOriginalGroup] = useState({});
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  const renderRenameGroupFeature = () => {
    return (
      <div className="rename-group-modal-content">
        <Row>
          <Input placeholder="New Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        </Row>

        <Row className="rename-group-modal-footer">
          <Space>
            <Button key="cancel" onClick={toggle}>
              Cancel
            </Button>
            <Button key="save" type="primary" onClick={handleSaveRuleNameOnClick} loading={isSavingGroup}>
              Save
            </Button>
          </Space>
        </Row>
      </div>
    );
  };

  const renderLoader = () => {
    return (
      <div className="modal-body one-padding-top zero-padding-bottom">
        <Row className="one-padding-bottom  my-auto">
          <SpinnerColumn />
        </Row>
      </div>
    );
  };

  const handleSaveRuleNameOnClick = (e) => {
    setIsSavingGroup(true);

    let createdBy;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    if (typeof originalGroup.createdBy === "undefined") {
      createdBy = user?.details?.profile?.uid || null;
    } else {
      createdBy = originalGroup.createdBy;
    }

    const newGroup = {
      ...originalGroup,
      name: groupName,
      createdBy,
      currentOwner,
      lastModifiedBy,
      modificationDate: generateObjectCreationDate(),
    };

    Logger.log("Writing to storage in RenameGroupModal");
    StorageService(appMode)
      .saveRuleOrGroup(newGroup)
      .then(async () => {
        //Push Notify
        toast.info(`Renamed Group`);
        //Refresh List
        dispatch(
          actions.updateRefreshPendingStatus({
            type: "rules",
            newValue: !isRulesListRefreshPending,
          })
        );
        toggle();
      });
  };

  useEffect(() => {
    Logger.log("Writing to storage in RenameGroupModal useEffect");
    StorageService(appMode)
      .getRecord(groupIdFromProps)
      .then((group) => {
        if (group && group.name) {
          setOriginalGroup(group);
          setGroupName(group.name);
          setIsLoading(false);
        }
      });
  }, [groupIdFromProps, appMode]);

  return (
    <Modal
      className="rq-modal modal-dialog-centered"
      footer={null}
      open={isOpen}
      onCancel={toggle}
      title="Rename Group"
      wrapClassName="rename-group-modal"
    >
      {isLoading ? renderLoader() : renderRenameGroupFeature()}
    </Modal>
  );
};

export default RenameGroupModal;
