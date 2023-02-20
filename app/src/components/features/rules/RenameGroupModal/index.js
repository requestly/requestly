import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Button, Input } from "antd";
import { Modal } from "antd";
import { toast } from "utils/Toast.js";
//ICONS
import { FaSpinner } from "react-icons/fa";
//SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
//SERVICES
import { StorageService } from "../../../../init";
import {
  getAppMode,
  getIsRefreshRulesPending,
  getUserAuthDetails,
} from "../../../../store/selectors";
import { actions } from "../../../../store";
import { generateObjectCreationDate } from "utils/DateTimeUtils";

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
      <React.Fragment>
        <div className="modal-body one-padding-top zero-padding-bottom">
          {/* <Row className="one-padding-bottom  my-auto"> */}
          {/* <Col className="my-auto" style={{ fontSize: "0.9em" }}> */}
          <Input
            className="has-dark-text"
            placeholder="New Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          {/* </Col> */}
          {/* </Row> */}
        </div>
        <br />
        <div className="modal-footer ">
          <Button
            color="primary"
            type="button"
            onClick={handleSaveRuleNameOnClick}
          >
            {isSavingGroup ? <FaSpinner className="icon-spin" /> : "Save"}
          </Button>
        </div>
      </React.Fragment>
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
      className="modal-dialog-centered "
      visible={isOpen}
      onCancel={toggle}
      footer={null}
      title="Rename Group"
      style={{ textAlign: "center" }}
    >
      {isLoading ? renderLoader() : renderRenameGroupFeature()}
    </Modal>
  );
};

export default RenameGroupModal;
