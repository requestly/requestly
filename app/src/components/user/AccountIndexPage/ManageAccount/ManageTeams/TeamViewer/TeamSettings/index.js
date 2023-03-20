import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Button, Input, message } from "antd";
import SpinnerColumn from "../../../../../../misc/SpinnerColumn";
import { getFunctions, httpsCallable } from "firebase/functions";
import { redirectToMyTeams } from "../../../../../../../utils/RedirectionUtils";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import SwitchWorkspaceButton from "../SwitchWorkspaceButton";
import LearnMoreAboutWorkspace from "../common/LearnMoreAboutWorkspace";
import WorkspaceStatusSyncing from "./WorkspaceStatusSyncing";
import { toast } from "utils/Toast";
import "./TeamSettings.css";

const TeamSettings = ({ teamId, isTeamAdmin }) => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  if (!teamId) redirectToMyTeams(navigate);
  // Component State
  const [name, setName] = useState("");
  const [originalTeamName, setOriginalTeamName] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [isTeamInfoLoading, setIsTeamInfoLoading] = useState(false);
  const [renameInProgress, setRenameInProgress] = useState(false);
  const [deletInProgress, setDeletInProgress] = useState(false);

  // soft deletes the team
  const deleteTeam = async () => {
    setDeletInProgress(true);
    const functions = getFunctions();
    const softDeleteTeam = httpsCallable(functions, "deleteTeam");

    // add a check for owner of workspace
    // then make a call

    try {
      await softDeleteTeam({ teamId });
      redirectToMyTeams(navigate);
      toast.info("Workspace deleted successfully");

      // switch to private workspace
    } catch (err) {
      toast.error("Only owner can delete the workspace!");
    } finally {
      setDeletInProgress(false);
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
                  autoFocus
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

            <Button
              danger
              type="primary"
              loading={deletInProgress}
              onClick={deleteTeam}
            >
              Delete workspace
            </Button>
            <div>
              {/*
              - on click open modal
              - on modal confirm delete
              - keep showing loader
              - fetch the latest workspaces and then
              - navigate to home manage workspace
            */}
            </div>

            <WorkspaceStatusSyncing />
          </>
        )}
      </div>
    </>
  );
};

export default TeamSettings;
