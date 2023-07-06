import React from "react";
import { trackSidebarClicked } from "modules/analytics/events/common/onboarding/sidebar";
import { Link } from "react-router-dom";
import { ReactComponent as InviteIcon } from "assets/icons/invite.svg";
import { getAvailableTeams, getIsWorkspaceMode } from "store/features/teams/selectors";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { actions } from "store";
import { useCallback } from "react";

const InviteButton: React.FC = () => {
  const dispatch = useDispatch();
  const availableTeams = useSelector(getAvailableTeams);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleInviteClick = useCallback(() => {
    if (availableTeams?.length === 0) {
      dispatch(actions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: true }));
      return;
    }
    if (isWorkspaceMode) {
      dispatch(actions.toggleActiveModal({ modalName: "inviteMembersModal", newValue: true }));
      return;
    }
  }, [availableTeams?.length, dispatch, isWorkspaceMode]);

  return (
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
  );
};

export default InviteButton;
