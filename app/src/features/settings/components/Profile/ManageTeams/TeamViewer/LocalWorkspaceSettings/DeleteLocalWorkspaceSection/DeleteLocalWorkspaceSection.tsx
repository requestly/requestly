import React, { useCallback, useState } from "react";
import DeleteWorkspaceModal from "../../TeamSettings/DeleteWorkspaceModal";
import "./deleteLocalWorkspaceSection.scss";
import { Alert, Button, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "utils/Toast";
import { getAppMode } from "store/selectors";
import { getActiveWorkspaceId, getNonLocalWorkspaces, getWorkspaceById } from "store/slices/workspaces/selectors";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { removeWorkspace, getAllWorkspaces as getAllLocalWorkspaces } from "services/fsManagerServiceAdapter";
import { workspaceActions } from "store/slices/workspaces/slice";
import { redirectToRules } from "utils/RedirectionUtils";
import { captureException } from "@sentry/react";
import { WorkspaceType } from "features/workspaces/types";
import { trackWorkspaceDeleteClicked, trackWorkspaceDeleted } from "modules/analytics/events/common/teams";

export const DeleteLocalWorkspaceSection: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId: workspaceId } = useParams();
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const sharedWorkspaces = useSelector(getNonLocalWorkspaces);
  const currentWorkspace = useSelector(getWorkspaceById(workspaceId));

  const [deleteDirectory, setDeleteDirectory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshAndNavigate = useCallback(
    async (previousPath?: string, canNavigateToPreviousPath?: boolean) => {
      try {
        const allLocalWorkspacesResult = await getAllLocalWorkspaces();
        const allLocalWorkspaces = allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];
        const localRecords = allLocalWorkspaces.map((partialWorkspace) => ({
          id: partialWorkspace.id,
          name: partialWorkspace.name,
          owner: "",
          accessCount: 1,
          adminCount: 1,
          members: {},
          appsumo: false,
          workspaceType: WorkspaceType.LOCAL,
          rootPath: partialWorkspace.path,
        }));
        dispatch(workspaceActions.setAllWorkspaces([...sharedWorkspaces, ...localRecords] as any));
        if (canNavigateToPreviousPath) navigate(previousPath as string, { replace: true });
        else redirectToRules(navigate);
      } catch (e) {
        captureException(e);
        toast.error("Could not refresh workspaces");
      }
    },
    [dispatch, navigate, sharedWorkspaces]
  );

  const handleDelete = useCallback(async () => {
    if (!workspaceId || isDeleting) return;
    setIsDeleting(true);
    try {
      let hadRmdirPermissionError = false;
      let hadScandirPermissionError = false;
      const previousPath = location?.state?.previousPath;
      const canNavigateToPreviousPath = previousPath && !previousPath.includes(`/teams/${workspaceId}`);

      const result = await removeWorkspace(workspaceId, deleteDirectory ? { deleteDirectory: true } : {});
      if (result.type === "error") {
        const err = result.error;
        const message = err?.message || "";
        const code = String(err?.code).toLowerCase();
        const isPermissionDenied = code === "permission_denied";
        const isRmdirPermissionError = isPermissionDenied && (/eacces/i.test(message) || /rmdir/i.test(message));
        const isEpermScandirError = /eperm/i.test(message) && /scandir/i.test(message);
        if (isRmdirPermissionError) {
          hadRmdirPermissionError = true;
          captureException(new Error(`Permission denied during rmdir: ${message}`));
        } else if (isEpermScandirError) {
          hadScandirPermissionError = true;
          captureException(new Error(`EPERM during scandir: ${message}`));
        } else {
          throw new Error(result.error.message || "Failed to delete workspace");
        }
      }

      if (activeWorkspaceId === workspaceId) {
        await clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
      if (hadScandirPermissionError) {
        toast.info("Workspace deleted, but failed to delete files. Please retry or delete manually.");
      } else if (hadRmdirPermissionError) {
        toast.info("Workspace deleted, but failed to delete files. Please delete manually.");
      } else {
        toast.info("Workspace deleted successfully");
      }

      await refreshAndNavigate(previousPath, canNavigateToPreviousPath);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete workspace");
      captureException(err?.message || "Failed to delete workspace");
      if (deleteDirectory) setDeleteDirectory(false);
    } finally {
      setIsDeleting(false);
    }
  }, [workspaceId, deleteDirectory, isDeleting, location, activeWorkspaceId, dispatch, appMode, refreshAndNavigate]);

  return (
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
        onClick={() => {
          trackWorkspaceDeleteClicked();
          setIsModalOpen(true);
        }}
        className="local-workspace-delete-button"
      >
        {deleteDirectory ? "Delete workspace and all data" : "Delete workspace"}
      </Button>
      <DeleteWorkspaceModal
        name={currentWorkspace?.name || "Workspace"}
        isOpen={isModalOpen}
        deleteInProgress={isDeleting}
        handleModalClose={() => setIsModalOpen(false)}
        handleDeleteTeam={async () => {
          await handleDelete();
          trackWorkspaceDeleted({ device_data_deleted: deleteDirectory });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default DeleteLocalWorkspaceSection;
