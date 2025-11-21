import React, { useCallback, useState } from "react";
import "./localWorkspaceSettings.scss";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineTipsAndUpdates } from "@react-icons/all-files/md/MdOutlineTipsAndUpdates";
import { Divider, Checkbox, Button, Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { toast } from "utils/Toast";
import { useNavigate, useLocation } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";
import { removeWorkspace, getAllWorkspaces } from "services/fsManagerServiceAdapter";
import { workspaceActions } from "store/slices/workspaces/slice";

interface LocalWorkspaceSettingsProps {
  workspacePath: string;
  workspaceId: string;
}

export const LocalWorkspaceSettings: React.FC<LocalWorkspaceSettingsProps> = ({ workspacePath, workspaceId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const [deleteDirectory, setDeleteDirectory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!workspaceId || isDeleting) return;
    setIsDeleting(true);
    try {
      const previousPath = (location?.state as any)?.previousPath;
      const isPreviousValid = previousPath && !previousPath.includes(`/teams/${workspaceId}`);

      await removeWorkspace(workspaceId, deleteDirectory ? { deleteDirectory: true } : {});

      try {
        const allLocalWorkspacesResult = await getAllWorkspaces();
        const allLocalWorkspaces = allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];
        const localRecords = allLocalWorkspaces.map((partialWorkspace) => ({
          id: partialWorkspace.id,
          name: partialWorkspace.name,
          owner: "",
          accessCount: 1,
          adminCount: 1,
          members: {},
          appsumo: false,
          workspaceType: "LOCAL",
          rootPath: partialWorkspace.path,
        }));
        const state: any = (window as any).store?.getState?.();
        let shared: any[] = [];
        if (state && state.WORKSPACE && state.WORKSPACE.allWorkspaces && state.WORKSPACE.allWorkspaces.entities) {
          shared = Object.values(state.WORKSPACE.allWorkspaces.entities).filter(
            (w: any) => w && w.workspaceType !== "LOCAL"
          );
        }
        dispatch(workspaceActions.setAllWorkspaces([...shared, ...localRecords] as any));
      } catch (e) {
        /* ignore */
      }
      toast.info("Workspace deleted successfully");
      if (activeWorkspaceId === workspaceId) {
        await clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
      if (isPreviousValid) navigate(previousPath, { replace: true });
      else redirectToRules(navigate);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete workspace");
      if (deleteDirectory) setDeleteDirectory(false);
    } finally {
      setIsDeleting(false);
    }
  }, [workspaceId, deleteDirectory, dispatch, appMode, navigate, isDeleting, location, activeWorkspaceId]);

  return (
    <>
      <Divider />
      <div className="local-workspace-details-container">
        <div className="local-workspace-location-details">
          <div className="local-workspace-location-details-title">Location to store workspace data</div>
          <div className="local-workspace-details-card local-workspace-path-details-card">
            <div className="local-workspace-path-details-card-title">SELECTED LOCATION</div>
            <div className="local-workspace-path-details-card-path">{workspacePath}</div>
            <div className="local-workspace-path-details-card-info">
              <MdInfoOutline />
              Selected location can’t be changed now, but this feature is coming soon! Stay updated on{" "}
              <a href="https://github.com/requestly/requestly/issues/3136" target="_blank" rel="noreferrer">
                Github
              </a>
              .
            </div>
          </div>
        </div>
        <div className="local-workspace-details-card local-workspace-git-card">
          <div className="local-workspace-git-card-title">
            <MdOutlineTipsAndUpdates />
            Collaborate with your team using Git
          </div>
          <div className="local-workspace-git-card-description">
            Work with your team using Git to manage changes in this local file location.
          </div>
        </div>
      </div>
      <div className="local-workspace-delete-section">
        <div className="local-workspace-delete-title">Delete workspace</div>
        <div className="local-workspace-delete-description">
          If you delete this workspace, it will be removed from the Requestly app. Your data will remain on your device
          unless you choose to delete it.
        </div>
        <Checkbox
          checked={deleteDirectory}
          onChange={(e) => setDeleteDirectory(e.target.checked)}
          className="local-workspace-delete-checkbox"
        >
          Also delete all related files and folders from this device
        </Checkbox>
        {deleteDirectory ? (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setDeleteDirectory(false)}
            className="local-workspace-delete-warning"
            message="If you proceed, all workspace data will be permanently deleted and cannot be recovered. Please confirm before continuing."
          />
        ) : null}
        <Button
          danger
          type="primary"
          loading={isDeleting}
          onClick={handleDelete}
          className="local-workspace-delete-button"
        >
          {deleteDirectory ? "Delete workspace and all data" : "Delete workspace"}
        </Button>
      </div>
    </>
  );
};
