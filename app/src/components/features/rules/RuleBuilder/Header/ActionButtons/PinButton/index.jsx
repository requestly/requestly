import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip, Button } from "antd";
import { RQButton } from "lib/design-system/components";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import { trackRuleEditorHeaderClicked, trackRulePinToggled } from "modules/analytics/events/common/rules";
import "./PinButton.css";
import { getModeData } from "../../../actions";
import { StorageService } from "init";

const PinButton = ({ rule, isRuleEditorModal }) => {
  const { MODE } = getModeData(window.location);
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isPinned = rule.isFavourite;

  const handlePinRuleClick = () => {
    const currentOwner = rule.currentOwner ? user?.details?.profile?.uid || null : rule.currentOwner;

    const updateValue = !rule.isFavourite;
    const updatedRule = {
      ...rule,
      currentOwner,
      isFavourite: updateValue,
    };

    dispatch(actions.updateCurrentlySelectedRuleData(updatedRule));

    StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then(() => {
        trackRulePinToggled(updateValue);
        trackRuleEditorHeaderClicked(
          "pin_button",
          rule.ruleType,
          MODE,
          isRuleEditorModal ? "rule_editor_modal_header" : "rule_editor_screen_header"
        );
      });
  };

  return (
    <>
      {isRuleEditorModal ? (
        <Button type="text" onClick={handlePinRuleClick}>
          {isPinned ? "Unpin rule" : "Pin rule"}
        </Button>
      ) : (
        <Tooltip title={isPinned ? "Unpin rule" : "Pin rule"} placement="bottom">
          <RQButton
            iconOnly
            type="default"
            disabled={MODE === "create"}
            icon={
              isPinned ? (
                <img alt="pin" width="12px" height="14px" src="/assets/icons/pin-filled.svg" />
              ) : (
                <img alt="pin" width="12px" height="14px" src="/assets/icons/pin-outlined.svg" />
              )
            }
            onClick={handlePinRuleClick}
          />
        </Tooltip>
      )}
    </>
  );
};

export default PinButton;
