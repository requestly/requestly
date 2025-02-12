import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col } from "antd";
import { Modal } from "antd";
import CreatableReactSelect from "react-select/creatable";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// REDUCER ACTIONS
import { globalActions } from "store/slices/global/slice";
import { getIsRefreshRulesPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
//FUNCTIONS
import { generateObjectId } from "../../../../utils/FormattingHelper";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { trackGroupCreatedEvent } from "features/rules/analytics";
import Logger from "lib/logger";
import syncingHelper from "lib/syncing/helpers/syncingHelper";

const CreateNewRuleGroupModal = (props) => {
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  //Component State
  const [currentValueForReactSelect, setCurrentValueForReactSelect] = useState([]);

  const handleReactSelectOnChange = (newSelectedOption) => {
    setCurrentValueForReactSelect(newSelectedOption.label);
    createNewGroup(newSelectedOption.label);
  };

  const createNewGroup = (newGroupName) => {
    const createdBy = user?.details?.profile?.uid || null;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;
    const newGroupId = `Group_${generateObjectId()}`;
    const newGroup = {
      creationDate: generateObjectCreationDate(),
      description: "",
      id: newGroupId,
      name: newGroupName,
      objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP,
      status: GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE,
      createdBy,
      currentOwner,
      lastModifiedBy,
    };
    Logger.log("Writing storage in createNewGroup");
    syncingHelper.saveRuleOrGroup(newGroup).then(async () => {
      trackGroupCreatedEvent("rules_table");

      dispatch(
        globalActions.updateRefreshPendingStatus({
          type: "rules",
          newValue: !isRulesListRefreshPending,
        })
      );
      props.toggle();
    });
  };

  return (
    <Modal
      className="modal-dialog-centered "
      visible={props.isOpen}
      onCancel={props.toggle}
      footer={null}
      title="Create New Group"
    >
      <div className="modal-body  zero-padding-bottom">
        {/* <Row className="one-padding-bottom  my-auto"> */}
        <Col className="my-auto">
          <span>Enter Group Name</span>
        </Col>
        <br />
        <Col className="my-auto" style={{ fontSize: "0.9em" }}>
          <CreatableReactSelect
            isMulti={false}
            name="select-group"
            placeholder="Enter Group Name"
            onChange={handleReactSelectOnChange}
            value={currentValueForReactSelect}
            theme={(theme) => ({
              ...theme,
              borderRadius: 4,
              colors: {
                ...theme.colors,
                primary: "#141414",
                primary25: "#2b2b2b",
                neutral0: "#141414",
              },
            })}
          />
        </Col>
        {/* </Row> */}
      </div>
    </Modal>
  );
};

export default CreateNewRuleGroupModal;
