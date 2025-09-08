import React, { useCallback } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { RQButton } from "lib/design-system/components";
import { trackInviteTeammatesClicked } from "modules/analytics/events/common/teams";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getAllWorkspaces, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import inviteIcon from "/assets/media/common/feature_invite.svg";

const InviteButton: React.FC = () => {
  const dispatch = useDispatch();
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const user = useSelector(getUserAuthDetails);

  const handleInviteClick = useCallback(() => {
    trackInviteTeammatesClicked(SOURCE.SIDEBAR_INVITE_BUTTON);
    if (!user?.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: { eventSource: SOURCE.SIDEBAR_INVITE_BUTTON },
        })
      );
      return;
    }

    if (isSharedWorkspaceMode) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "inviteMembersModal",
          newValue: true,
          newProps: { source: SOURCE.SIDEBAR_INVITE_BUTTON },
        })
      );
    } else if (availableWorkspaces?.length === 0) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { source: SOURCE.SIDEBAR_INVITE_BUTTON },
        })
      );
    } else {
      dispatch(globalActions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true }));
    }
  }, [availableWorkspaces?.length, dispatch, isSharedWorkspaceMode, user?.loggedIn]);

  return (
    <>
      <RQButton
        type="text"
        onClick={() => {
          handleInviteClick();
        }}
        className="primary-sidebar-link w-full"
      >
        <img src={inviteIcon} alt="invite" />
        <span className="link-title">{"Invite"}</span>
      </RQButton>
    </>
  );
};

export default InviteButton;
