import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
//Actions
import { RQButton } from "lib/design-system/components";
import { closeBtnOnClickHandler } from "../actions";
import { Modal, Tooltip } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";

const CloseButton = ({ ruleType, mode }) => {
  //Constants
  const navigate = useNavigate();
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);

  //Global State
  const dispatch = useDispatch();

  const showConfirmModal = useCallback(() => {
    Modal.confirm({
      title: "Discard changes?",
      icon: <ExclamationCircleFilled />,
      content: "Changes you made may not be saved.",
      okText: "Discard",
      onOk() {
        closeBtnOnClickHandler(dispatch, navigate, ruleType, mode);
      },
    });
  }, [dispatch, mode, navigate, ruleType]);

  const closeButtonHandler = useCallback(() => {
    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      showConfirmModal();
    } else {
      closeBtnOnClickHandler(dispatch, navigate, ruleType, mode);
    }
  }, [dispatch, isCurrentlySelectedRuleHasUnsavedChanges, mode, navigate, ruleType, showConfirmModal]);

  return (
    <Tooltip title="Back to rules" placement="bottom">
      <RQButton
        iconOnly
        type="default"
        data-dismiss="modal"
        icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
        onClick={closeButtonHandler}
      />
    </Tooltip>
  );
};

export default CloseButton;
