import React, { useCallback } from "react";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import { Link } from "react-router-dom";
import { ReactComponent as InviteIcon } from "assets/icons/invite.svg";
import { getAvailableTeams, getIsWorkspaceMode } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";

const InviteButton: React.FC = () => {
  const dispatch = useDispatch();
  const availableTeams = useSelector(getAvailableTeams);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const user = useSelector(getUserAuthDetails);

  const handleInviteClick = useCallback(() => {
    if (!user?.loggedIn) {
      dispatch(actions.toggleActiveModal({ modalName: "authModal", newValue: true }));
      return;
    }

    if (isWorkspaceMode) {
      dispatch(actions.toggleActiveModal({ modalName: "inviteMembersModal", newValue: true }));
    } else if (availableTeams?.length === 0) {
      dispatch(actions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: true }));
    } else {
      dispatch(actions.toggleActiveModal({ modalName: "switchWorkspaceModal", newValue: true }));
    }
  }, [availableTeams?.length, dispatch, isWorkspaceMode, user?.loggedIn]);

  return (
    <>
      <Link
        to={"#"}
        onClick={() => {
          handleInviteClick();
          trackSidebarClicked("invite");
        }}
        className={`primary-sidebar-link`}
      >
        <span className="icon__wrapper">{<InviteIcon />}</span>
        <span className="link-title">{"Invite"}</span>
      </Link>
    </>
  );
};

export default InviteButton;
