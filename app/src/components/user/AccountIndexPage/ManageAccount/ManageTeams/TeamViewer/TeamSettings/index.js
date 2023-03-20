import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Row, Button, Input, message, Col, Tooltip } from "antd";
import { getUserAuthDetails } from "store/selectors";
import SpinnerColumn from "../../../../../../misc/SpinnerColumn";
import { getFunctions, httpsCallable } from "firebase/functions";
import { redirectToMyTeams } from "../../../../../../../utils/RedirectionUtils";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import SwitchWorkspaceButton from "../SwitchWorkspaceButton";
import LearnMoreAboutWorkspace from "../common/LearnMoreAboutWorkspace";
import WorkspaceStatusSyncing from "./WorkspaceStatusSyncing";
import DeleteWorkspaceModal from "./DeleteWorkspaceModal";
import { toast } from "utils/Toast";
import {
  trackWorkspaceDeleted,
  trackWorkspaceDeleteClicked,
} from "modules/analytics/events/common/teams";
import "./TeamSettings.css";

const TeamSettings = ({ teamId, isTeamAdmin, isTeamArchived, teamOwnerId }) => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const user = useSelector(getUserAuthDetails);
  const userId = user?.details?.profile?.uid;
  const isLoggedInUserOwner = userId === teamOwnerId;

  if (!teamId) redirectToMyTeams(navigate);

  // Component State
  const [name, setName] = useState("");
  const [originalTeamName, setOriginalTeamName] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [isTeamInfoLoading, setIsTeamInfoLoading] = useState(false);
  const [renameInProgress, setRenameInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);

  const handleDeleteModalOpen = () => {
    setIsDeleteModalActive(true);
    trackWorkspaceDeleteClicked();
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalActive(false);
  };

  const deleteTeam = async () => {
    if (!isLoggedInUserOwner) {
      toast.error("Only owner can delete the workspace!");
      return;
    }

    const functions = getFunctions();
    const deleteTeamForm = httpsCallable(functions, "deleteTeamForm");

    try {
      setDeleteInProgress(true);
      await deleteTeamForm({ teamId, userId });
      toast.info("Workspace deletion scheduled");
      trackWorkspaceDeleted();
    } catch (err) {
      toast.error("Only owner can delete the workspace!");
    } finally {
      setDeleteInProgress(false);
      handleDeleteModalClose();
    }
  };

  const fetchTeamInfo = () => {
    setIsTeamInfoLoading(true);
    const functions = getFunctions();
    const getTeamInfo = httpsCallable(functions, "getTeamInfo");

    getTeamInfo({ teamId: teamId })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (!response.success) throw new Error(response.message);
        const teamInfo = response.data;
        setName(teamInfo.name);
        setOriginalTeamName(teamInfo.name);
        setMembersCount(teamInfo.accessCount);
      })
      .catch(() => redirectToMyTeams(navigate))
      .finally(() => setIsTeamInfoLoading(false));
  };

  const stableFetchTeamInfo = useCallback(fetchTeamInfo, [navigate, teamId]);

  const handleTeamNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTeamRename = (e) => {
    e.preventDefault();

    if (name.length === 0) {
      toast.error("Team name cannot be empty");
      return;
    }

    const db = getFirestore();
    const teamRef = doc(db, "teams", teamId);

    setRenameInProgress(true);
    setOriginalTeamName(name);

    updateDoc(teamRef, {
      name: name,
    })
      .catch((err) => {
        message.error("Only owner can change the team name");
        setName(originalTeamName);
      })
      .finally(() => setRenameInProgress(false));
  };

  useEffect(() => {
    stableFetchTeamInfo();

    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchTeamInfo, teamId]);

  const deleteButtonProps = {
    danger: true,
    className: "delete-team-btn",
    loading: deleteInProgress,
    disabled: !isLoggedInUserOwner || !!isTeamArchived,
    onClick: handleDeleteModalOpen,
  };

  return (
    <>
      <div className="team-settings-container">
        {isTeamInfoLoading ? (
          <SpinnerColumn message="Fetching workspace settings" />
        ) : !isTeamAdmin ? (
          <div>Only admins can view the workspace settings.</div>
        ) : (
          <>
            <Row align="middle" justify="space-between">
              <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
              <SwitchWorkspaceButton
                teamName={name}
                selectedTeamId={teamId}
                teamMembersCount={membersCount}
              />
            </Row>

            <div className="title team-settings-title">Workspace settings</div>
            <form onSubmit={handleTeamRename} className="team-settings-form">
              <div className="team-settings-form-item">
                <label
                  htmlFor="name"
                  className="team-settings-name-input-label"
                >
                  Workspace name
                </label>
                <Input
                  id="name"
                  autoComplete="off"
                  value={name}
                  disabled={renameInProgress || isTeamInfoLoading}
                  onChange={handleTeamNameChange}
                  className="team-settings-name-input"
                  placeholder="Name of your company or organization"
                />
              </div>

              <div
                style={{ display: "none" }}
                className="team-settings-form-item"
              >
                <label
                  htmlFor="description"
                  className="team-settings-description-label"
                >
                  Description
                </label>
                <Input.TextArea
                  rows={4}
                  id="description"
                  className="team-settings-description"
                  placeholder="Details about your workspace"
                  disabled={isTeamInfoLoading}
                />
              </div>

              <div>
                <Button
                  type="primary"
                  loading={renameInProgress}
                  onClick={handleTeamRename}
                  disabled={isTeamInfoLoading || name === originalTeamName}
                >
                  Save changes
                </Button>
              </div>
            </form>

            <WorkspaceStatusSyncing />

            <Row className="w-full">
              <Col span={24}>
                <div className="title team-delete-title">Delete workspace</div>
                {isLoggedInUserOwner ? (
                  <Button {...deleteButtonProps}>
                    Delete entire workspace
                  </Button>
                ) : (
                  <Tooltip
                    placement="right"
                    overlayInnerStyle={{ width: "270px" }}
                    title="Only owner can delete the workspace. Please contact owner of this workspace."
                  >
                    <Button {...deleteButtonProps}>
                      Delete entire workspace
                    </Button>
                  </Tooltip>
                )}
              </Col>
            </Row>
          </>
        )}
      </div>

      {isDeleteModalActive ? (
        <DeleteWorkspaceModal
          name={name}
          isOpen={isDeleteModalActive}
          deleteInProgress={deleteInProgress}
          handleDeleteTeam={deleteTeam}
          handleModalClose={handleDeleteModalClose}
        />
      ) : null}
    </>
  );
};

export default TeamSettings;
