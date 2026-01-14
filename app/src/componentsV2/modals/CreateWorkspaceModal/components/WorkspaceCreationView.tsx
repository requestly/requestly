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
  callback?: () => void;
  onCancel: () => void;
  analyticEventSource: string;
}

export const WorkspaceCreationView: React.FC<Props> = ({ workspaceType, analyticEventSource, callback, onCancel }) => {
  const [error, setError] = useState<ErrorCode | null>(null);
  const currentSelectedFolderPathRef = useRef<string | null>(null);

  const { isLoading, createWorkspace } = useCreateWorkspace({
    analyticEventSource,
    onCreateWorkspaceCallback: callback,
    onError: (err) => {
      if (err.cause && err.cause.code === ErrorCode.PathIsAlreadyAWorkspace) {
        currentSelectedFolderPathRef.current = err.cause.path;
        setError(ErrorCode.PathIsAlreadyAWorkspace);
        return;
      } else {
        toast.error(err?.message || "Unable to Create Team");
      }
    },
  });

  if (error) {
    switch (error) {
      case ErrorCode.PathIsAlreadyAWorkspace:
        return (
          <ExistingWorkspaceConflictView
            path={currentSelectedFolderPathRef.current as string}
            onChooseAnotherFolder={() => {
              currentSelectedFolderPathRef.current = null;
              setError(null);
            }}
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
        />
      )}
    </>
  );
};
