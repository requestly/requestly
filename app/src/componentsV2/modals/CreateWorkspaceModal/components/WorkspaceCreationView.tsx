import React, { useRef, useState } from "react";
import { SharedWorkspaceCreationView } from "./SharedWorkspaceCreationView/SharedWorkspaceCreationView";
import { LocalWorkspaceCreationView } from "./LocalWorkspaceCreationView/LocalWorkspaceCreationView";
import { WorkspaceType } from "features/workspaces/types";
import { ErrorCode } from "errors/types";
import { ExistingWorkspaceConflictView } from "./LocalWorkspaceCreationView/components/ExistingWorkspaceConflictView";
import { useCreateWorkspace } from "features/workspaces/hooks/useCreateWorkspace";
import { toast } from "utils/Toast";

interface Props {
  workspaceType: WorkspaceType;
  analyticEventSource: string;
  isOpenedInModal?: boolean;
  callback?: () => void;
  onCancel: () => void;
}

export const WorkspaceCreationView: React.FC<Props> = ({
  workspaceType,
  analyticEventSource,
  callback,
  onCancel,
  isOpenedInModal,
}) => {
  const [error, setError] = useState<ErrorCode | null>(null);
  const currentSelectedFolderPathRef = useRef<string | null>(null);

  const { isLoading, createWorkspace } = useCreateWorkspace({
    analyticEventSource,
    onCreateWorkspaceCallback: callback,
    onError: (err) => {
      if (err.cause && err.cause.code === ErrorCode.WorkspacePathAlreadyInUse) {
        currentSelectedFolderPathRef.current = err.cause.path;
        setError(ErrorCode.WorkspacePathAlreadyInUse);
        return;
      } else {
        toast.error(err?.message || "Unable to Create Team");
      }
    },
  });

  if (error) {
    switch (error) {
      case ErrorCode.WorkspacePathAlreadyInUse:
        return (
          <ExistingWorkspaceConflictView
            path={currentSelectedFolderPathRef.current as string}
            onFolderSelectionCallback={() => {
              currentSelectedFolderPathRef.current = null;
              setError(null);
            }}
            analyticEventSource={analyticEventSource}
          />
        );
    }
  }

  return (
    <>
      {workspaceType === WorkspaceType.SHARED ? (
        <SharedWorkspaceCreationView
          onCreateWorkspaceClick={createWorkspace}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      ) : (
        <LocalWorkspaceCreationView
          onCreateWorkspaceClick={createWorkspace}
          isLoading={isLoading}
          onCancel={onCancel}
          isOpenedInModal={isOpenedInModal}
          onSuccessCallback={callback}
          analyticEventSource={analyticEventSource}
        />
      )}
    </>
  );
};
