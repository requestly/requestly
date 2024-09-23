import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { navigateBack, redirectToRules } from "utils/RedirectionUtils";
import { snakeCase } from "lodash";
import { trackRuleEditorClosed } from "modules/analytics/events/common/rules";
import { Button } from "lib/design-system-v2/components";
import { FiArrowLeft } from "@react-icons/all-files/fi/FiArrowLeft";
import { RULE_KEYBOARD_SHORTCUTS } from "features/rules";

const CloseButton = ({ ruleType, mode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const closeButtonHandler = useCallback(() => {
    trackRuleEditorClosed("cancel_button", ruleType, snakeCase(mode));
    navigateBack(navigate, location, () => redirectToRules(navigate));
  }, [dispatch, mode, navigate, ruleType]);

  return (
    <Tooltip title="Back to rules (esc)" placement="bottom">
      <Button
        hotKey={RULE_KEYBOARD_SHORTCUTS.EDITOR_BACK.hotKey}
        size="small"
        type="transparent"
        data-dismiss="modal"
        icon={<FiArrowLeft />}
        onClick={closeButtonHandler}
      />
    </Tooltip>
  );
};

export default CloseButton;
