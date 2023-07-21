import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
//Actions
import { RQButton } from "lib/design-system/components";
import { closeBtnOnClickHandler } from "../actions";
import { Tooltip } from "antd";

const CloseButton = ({ ruleType, mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeButtonHandler = useCallback(() => {
    closeBtnOnClickHandler(dispatch, navigate, ruleType, mode);
  }, [dispatch, mode, navigate, ruleType]);

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
