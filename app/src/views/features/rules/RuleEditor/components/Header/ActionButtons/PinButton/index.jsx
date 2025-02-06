import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "antd";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import { trackRuleEditorHeaderClicked, trackRulePinToggled } from "modules/analytics/events/common/rules";
import "./PinButton.css";
import { getModeData } from "../../../../../../../../components/features/rules/RuleBuilder/actions";
import { StorageService } from "init";
import { RQButton } from "lib/design-system-v2/components";

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

    dispatch(globalActions.updateCurrentlySelectedRuleData(updatedRule));

    StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then(() => {
        trackRulePinToggled(updatedRule.id, updatedRule.ruleType, updateValue);
        trackRuleEditorHeaderClicked(
          "pin_button",
          rule.ruleType,
          MODE,
          isRuleEditorModal ? "rule_editor_modal_header" : "rule_editor_screen_header"
        );
      });
  };

  const commonProps = {
    type: "transparent",
    onClick: handlePinRuleClick,
  };

  return (
    <>
      {isRuleEditorModal ? (
        <RQButton {...commonProps} block>
          {isPinned ? "Unpin rule" : "Pin rule"}
        </RQButton>
      ) : (
        <Tooltip title={isPinned ? "Unpin rule" : "Pin rule"} placement="bottom">
          <RQButton
            {...commonProps}
            disabled={MODE === "create"}
            icon={
              isPinned ? (
                <img
                  alt="pin"
                  width="12px"
                  height="14px"
                  src="/assets/media/components/pin-filled.svg" // TODO: replace icon with react-icon
                  style={{ width: "12px", height: "14px" }}
                />
              ) : (
                <img
                  alt="pin"
                  width="12px"
                  height="14px"
                  src="/assets/media/components/pin-outlined.svg" // TODO: replace icon with react-icon
                  style={{ width: "12px", height: "14px" }}
                />
              )
            }
          />
        </Tooltip>
      )}
    </>
  );
};

export default PinButton;
