import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { navigateBack, redirectToRules } from "utils/RedirectionUtils";
import { snakeCase } from "lodash";
import { trackRuleEditorClosed } from "modules/analytics/events/common/rules";
import { RQButton } from "lib/design-system-v2/components";
import { FiArrowLeft } from "@react-icons/all-files/fi/FiArrowLeft";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../constants/keyboardShortcuts";

const CloseButton = ({ ruleType, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const closeButtonHandler = useCallback(() => {
    trackRuleEditorClosed("cancel_button", ruleType, snakeCase(mode));
    navigateBack(navigate, location, () => redirectToRules(navigate));
  }, [mode, navigate, ruleType, location]);

  return (
    <Tooltip title="Back to rules (esc)" placement="bottom">
      <RQButton
        hotKey={KEYBOARD_SHORTCUTS.RULES.EDITOR_BACK.hotKey}
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
