import { useState } from "react";
import { Typography } from "antd";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineInsertDriveFile } from "@react-icons/all-files/md/MdOutlineInsertDriveFile";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import Logger from "lib/logger";
import { RQButton } from "lib/design-system-v2/components";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import "./localWorkspaceCreationView.scss";
import { CreateWorkspaceArgs } from "../../CreateWorkspaceModal";
import { WorkspaceType } from "types";

interface FolderItem {
  name: string;
  path: string;
  type: "directory" | "file";
  contents?: FolderItem[];
}

interface FolderPreviewResult {
  success: boolean;
  folderPath: string;
  workspaceName: string;
  existingContents: FolderItem[];
  newAdditions: FolderItem[];
}

const PreviewItem = ({ item, isNewWorkspace = false }: { item: FolderItem; isNewWorkspace?: boolean }) => {
  const Icon = item.type === "directory" ? MdOutlineFolder : MdOutlineInsertDriveFile;

  return (
    <div key={item.path} className={`preview-folder-items__item ${isNewWorkspace ? "new-workspace-item" : ""}`}>
      <div className="preview-folder-item-content">
        <Icon className="preview-folder-item-icon" />
        <span className="preview-folder-item-name">{item.name}</span>
      </div>
    </div>
  );
};

export const LocalWorkspaceCreationView = ({
  onCreateWorkspaceClick,
  isLoading,
}: {
  onCreateWorkspaceClick: (args: CreateWorkspaceArgs) => void;
  isLoading: boolean;
}) => {
  const dispatch = useDispatch();
  const [workspaceName, setWorkspaceName] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [folderPreview, setFolderPreview] = useState<FolderPreviewResult | null>(null);

  const folderSelectCallback = async (folderPath: string) => {
    setFolderPath(folderPath);
    try {
      const result: FolderPreviewResult = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("get-folder-preview", {
        folderPath,
      });
      setFolderPreview(result);
    } catch (err) {
      Logger.log("Could not get workspace folder preview data", err);
      // No OP
    }
  };

  const handleOnCancel = () => {
    dispatch(globalActions.toggleActiveModal({ modalName: "createWorkspaceModal", newValue: false }));
  };

  const handleOnCreateWorkspaceClick = () => {
    onCreateWorkspaceClick({
      workspaceType: WorkspaceType.LOCAL,
      workspaceName,
      folderPath,
    });
  };

  return (
    <>
      <CreateWorkspaceHeader
        title="Create a new local workspace"
        description="The selected folder will be used as the root of your workspace. Your APIs, variables and related metadata will be stored in this."
        onWorkspaceNameChange={setWorkspaceName}
      />
      <div className="workspace-folder-selector">
        <RQButton icon={<MdOutlineFolder />} onClick={() => displayFolderSelector(folderSelectCallback)}>
          Select a folder
        </RQButton>
        {folderPath.length ? (
          <Typography.Text
            ellipsis={{
              tooltip: {
                title: folderPath,
                color: "#000",
              },
            }}
            className="selected-folder-path"
          >
            {folderPath}
          </Typography.Text>
        ) : null}
      </div>

      {folderPreview ? (
        <div className="workspace-folder-preview">
          <>
            <div className="preview-header">
              <div className="preview-title">PREVIEW:</div>
              <div className="preview-path">
                <PiFolderOpen /> {folderPreview.folderPath}
              </div>
            </div>
            <div className="workspace-folder-preview-content">
              <div className="workspace-folder-preview-content__new-additions-section preview-folder-items">
                {folderPreview.newAdditions.map((item) => (
                  <PreviewItem key={item.path} item={item} isNewWorkspace={true} />
                ))}
              </div>
              <div className="preview-folder-items existing-contents-section">
                {folderPreview.existingContents.map((item) => (
                  <PreviewItem key={item.path} item={item} />
                ))}
              </div>
            </div>
          </>
        </div>
      ) : null}
      <CreateWorkspaceFooter
        onCancel={handleOnCancel}
        onCreateWorkspaceClick={handleOnCreateWorkspaceClick}
        isLoading={isLoading}
        disabled={!workspaceName.length || !folderPath.length}
      />
    </>
  );
};
