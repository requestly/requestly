import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { getCurrentlySelectedRuleData, getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { Button, Tooltip } from "antd";
import { trackRuleEditorHeaderClicked } from "modules/analytics/events/common/rules";
import { AUTH } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import { getModeData } from "../../../actions";

const ShareRuleButton = ({ isRuleEditorModal }) => {
  const { MODE } = getModeData(window.location);
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const shareRuleClickHandler = () => {
    if (user.loggedIn) {
      toggleSharingModal();
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: AUTH.SOURCE.SHARE_RULES,
        })
      );
    }
  };

  const toggleSharingModal = () => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "sharingModal",
        newValue: true,
        newProps: {
          selectedRules: [currentlySelectedRuleData.id],
        },
      })
    );
  };

  return (
    <>
      {isRuleEditorModal ? (
        <Button
          type="text"
          onClick={() => {
            shareRuleClickHandler();
            trackRuleEditorHeaderClicked(
              "share_button",
              currentlySelectedRuleData.ruleType,
              MODE,
              "rule_editor_modal_header"
            );
          }}
        >
          Share rule
        </Button>
      ) : (
        <Tooltip title="Share rule" placement="bottom">
          <RQButton
            type="primary"
            icon={
              <img
                width="13.4px"
                height="10px"
                alt="down arrow"
                src="/assets/icons/share.svg"
                className="rule-header-share-btn-icon"
              />
            }
            onClick={() => {
              shareRuleClickHandler();
              trackRuleEditorHeaderClicked(
                "share_button",
                currentlySelectedRuleData.ruleType,
                MODE,
                "rule_editor_screen_header"
              );
            }}
          />
        </Tooltip>
      )}
    </>
  );
};

export default ShareRuleButton;
