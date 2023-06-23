import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Button, Input, message, Col, Tooltip } from "antd";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import SpinnerColumn from "../../../../../../misc/SpinnerColumn";
import { getFunctions, httpsCallable } from "firebase/functions";
import { redirectToRules, redirectToMyTeams } from "../../../../../../../utils/RedirectionUtils";
import { clearCurrentlyActiveWorkspace, showSwitchWorkspaceSuccessToast } from "actions/TeamWorkspaceActions";
import LearnMoreAboutWorkspace from "../common/LearnMoreAboutWorkspace";
import WorkspaceStatusSyncing from "./WorkspaceStatusSyncing";
import DeleteWorkspaceModal from "./DeleteWorkspaceModal";
import LoadingModal from "../../../../../../../layouts/DashboardLayout/MenuHeader/WorkspaceSelector/LoadingModal";
import { toast } from "utils/Toast";
import { trackWorkspaceDeleted, trackWorkspaceDeleteClicked } from "modules/analytics/events/common/teams";
import "./TeamSettings.css";
import { renameWorkspace } from "backend/workspace";

const TeamSettings = ({ teamId, isTeamAdmin, isTeamArchived, teamOwnerId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userId = user?.details?.profile?.uid;
  const isLoggedInUserOwner = userId === teamOwnerId;

  if (!teamId) redirectToMyTeams(navigate);

  // Component State
  const [name, setName] = useState("");
  const [originalTeamName, setOriginalTeamName] = useState("");
  const [isTeamInfoLoading, setIsTeamInfoLoading] = useState(false);
  const [renameInProgress, setRenameInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);
  const [isTeamSwitchModalActive, setIsTeamSwitchModalActive] = useState(false);

  const handleDeleteModalOpen = () => {
    setIsDeleteModalActive(true);
    trackWorkspaceDeleteClicked();
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalActive(false);
  };

  const handleSwitchToPrivateWorkspace = async () => {
    setIsTeamSwitchModalActive(true);
    await clearCurrentlyActiveWorkspace(dispatch, appMode);
    setTimeout(() => {
      setIsTeamSwitchModalActive(false);
      showSwitchWorkspaceSuccessToast();
    }, 2 * 1000);
  };

  const deleteTeam = async () => {
    if (!isLoggedInUserOwner) {
      toast.error("Only owner can delete the workspace!");
      return;
    }

    const functions = getFunctions();
    const archiveTeam = httpsCallable(functions, "teams-archiveTeam");

    try {
      setDeleteInProgress(true);
      await archiveTeam({ teamId });
      trackWorkspaceDeleted();
      toast.info("Workspace deletion scheduled");
      redirectToRules(navigate);
      handleSwitchToPrivateWorkspace();
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

    setRenameInProgress(true);
    setOriginalTeamName(name);

    renameWorkspace(teamId, name)
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

  return (
    <>
      <div className="team-settings-container">
        {isTeamInfoLoading ? (
          <SpinnerColumn message="Fetching workspace settings" />
        ) : !isTeamAdmin ? (
          <>
            <WorkspaceStatusSyncing />
            <div>Only admins can view rest of the workspace settings.</div>
          </>
        ) : (
          <>
            <Row align="middle" justify="space-between">
              <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
            </Row>

            <div className="title team-settings-title">Workspace settings</div>
            <form onSubmit={handleTeamRename} className="team-settings-form">
              <div className="team-settings-form-item">
                <label htmlFor="name" className="team-settings-name-input-label">
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

              <div style={{ display: "none" }} className="team-settings-form-item">
                <label htmlFor="description" className="team-settings-description-label">
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

                <Tooltip
                  placement="right"
                  overlayInnerStyle={{ width: "270px" }}
                  title={
                    isTeamArchived
                      ? "Team is already archived"
                      : isLoggedInUserOwner
                      ? ""
                      : "Only owner can delete the workspace. Please contact owner of this workspace."
                  }
                >
                  <Button
                    danger
                    className="delete-team-btn"
                    loading={deleteInProgress}
                    onClick={handleDeleteModalOpen}
                    disabled={!isLoggedInUserOwner || !!isTeamArchived}
                  >
                    Delete entire workspace
                  </Button>
                </Tooltip>
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

      {isTeamSwitchModalActive ? (
        <LoadingModal isModalOpen={isTeamSwitchModalActive} closeModal={() => setIsTeamSwitchModalActive(false)} />
      ) : null}
    </>
  );
};

export default TeamSettings;
