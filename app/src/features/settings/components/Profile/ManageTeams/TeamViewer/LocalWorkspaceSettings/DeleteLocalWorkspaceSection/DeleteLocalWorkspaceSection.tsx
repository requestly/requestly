import * as Sentry from "@sentry/react";
import { Alert, Button, Checkbox } from "antd";
import { ErrorCode } from "errors/types";
import { WorkspaceType } from "features/workspaces/types";
import { trackWorkspaceDeleteClicked, trackWorkspaceDeleted } from "modules/analytics/events/common/teams";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAllWorkspaces as getAllLocalWorkspaces, removeWorkspace } from "services/fsManagerServiceAdapter";
import { getAppMode } from "store/selectors";
import {
  dummyPersonalWorkspace,
  getActiveWorkspaceId,
  getNonLocalWorkspaces,
  getWorkspaceById,
} from "store/slices/workspaces/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";
import { redirectToRules } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import DeleteWorkspaceModal from "../../TeamSettings/DeleteWorkspaceModal";
import "./deleteLocalWorkspaceSection.scss";

import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { useWorkspaceViewActions } from "features/apiClient/slices";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const DeleteLocalWorkspaceSection: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId: workspaceId } = useParams();
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const sharedWorkspaces = useSelector(getNonLocalWorkspaces);
  const currentWorkspace = useSelector(getWorkspaceById(workspaceId));
  const user = useSelector(getUserAuthDetails);
  const { switchContext } = useWorkspaceViewActions();

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
        Sentry.captureException(e);
        toast.error("Could not refresh workspaces");
      }
    },
    [dispatch, navigate, sharedWorkspaces]
  );

  const handleDelete = useCallback(async () => {
    if (!workspaceId || isDeleting) return;
    setIsDeleting(true);
    try {
      let hadPermissionIssue = false;
      const previousPath = location?.state?.previousPath;
      const canNavigateToPreviousPath = previousPath && !previousPath.includes(`/teams/${workspaceId}`);

      const result = await removeWorkspace(workspaceId, deleteDirectory ? { deleteDirectory: true } : {});
      if (result.type === "error") {
        const err = result.error;
        const isPermissionIssue = err.code === ErrorCode.PermissionDenied || err.code === ErrorCode.NotPermitted;
        if (isPermissionIssue) {
          hadPermissionIssue = true;
          Sentry.withScope((scope) => {
            scope.setTag("error_type", "workspace_delete_permission_issue");
            scope.setContext("workspace_delete_details", {
              workspaceId,
              deleteDirectory,
              error: err,
            });
            Sentry.captureException(new Error(`Permission issue during file operation: ${err.message}`));
          });
        } else {
          throw err;
        }
      }

      if (activeWorkspaceId === workspaceId) {
        await clearCurrentlyActiveWorkspace(dispatch, appMode);
        await switchContext({
          workspace: {
            id: dummyPersonalWorkspace.id,
            meta: { type: WorkspaceType.PERSONAL },
          },
          userId: user?.details?.profile?.uid,
        });
      }
      if (hadPermissionIssue) {
        toast.info("Workspace deleted, but failed to delete files. Please retry or delete manually.");
      } else {
        toast.info("Workspace deleted successfully");
      }

      await refreshAndNavigate(previousPath, canNavigateToPreviousPath);
    } catch (err: any) {
      toast.error("Failed to delete workspace");
      Sentry.withScope((scope) => {
        scope.setTag("error_type", "workspace_delete_failed");
        scope.setContext("workspace_delete_details", {
          workspaceId,
          deleteDirectory,
          error: err,
        });
        Sentry.captureException(new Error(err?.message || "Failed to delete workspace"));
      });
      if (deleteDirectory) setDeleteDirectory(false);
    } finally {
      setIsDeleting(false);
    }
  }, [
    workspaceId,
    isDeleting,
    location?.state?.previousPath,
    deleteDirectory,
    activeWorkspaceId,
    refreshAndNavigate,
    dispatch,
    appMode,
    switchContext,
    user?.details?.profile?.uid,
  ]);

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
