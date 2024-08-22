import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
//Actions
import { RQButton } from "lib/design-system/components";
import { Tooltip } from "antd";
import { navigateBack, redirectToRules } from "utils/RedirectionUtils";
import { snakeCase } from "lodash";
import { trackRuleEditorClosed } from "modules/analytics/events/common/rules";

const CloseButton = ({ ruleType, mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const closeButtonHandler = useCallback(() => {
    trackRuleEditorClosed("cancel_button", ruleType, snakeCase(mode));
    navigateBack(navigate, location, () => redirectToRules(navigate));
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
