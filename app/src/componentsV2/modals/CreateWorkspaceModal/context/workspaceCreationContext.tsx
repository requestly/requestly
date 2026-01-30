import React, { createContext, useContext, useMemo, useState } from "react";

interface WorkspaceCreationContextType {
  workspaceName: string;
  folderPath: string;
  setWorkspaceName: (workspaceName: string) => void;
  setFolderPath: (folderPath: string) => void;
}

const WorkspaceCreationContext = createContext<WorkspaceCreationContextType | undefined>(undefined);

export const WorkspaceCreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [folderPath, setFolderPath] = useState("");

  const value = useMemo(
    () => ({
      workspaceName,
      folderPath,
      setWorkspaceName,
      setFolderPath,
    }),
    [workspaceName, folderPath]
  );

  return <WorkspaceCreationContext.Provider value={value}>{children}</WorkspaceCreationContext.Provider>;
};

export const useWorkspaceCreationContext = () => {
  const context = useContext(WorkspaceCreationContext);
  if (!context) {
    throw new Error("useWorkspaceCreationContext must be used within a WorkspaceCreationProvider");
  }
  return context;
};
