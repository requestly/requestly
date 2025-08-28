import { useEffect, useState } from "react";
import { Tooltip, Typography } from "antd";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineInsertDriveFile } from "@react-icons/all-files/md/MdOutlineInsertDriveFile";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import Logger from "lib/logger";
import { RQButton } from "lib/design-system-v2/components";
import { CreateWorkspaceArgs } from "../WorkspaceCreationView";
import { WorkspaceType } from "types";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import "./localWorkspaceCreationView.scss";

interface FolderItem {
  name: string;
  path: string;
  type: "directory" | "file";
  contents?: FolderItem[];
}

interface FolderPreviewResult {
  success: boolean;
  folderPath: string;
  existingContents: FolderItem[];
  newAdditions: FolderItem;
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
  onCancel,
}: {
  onCreateWorkspaceClick: (args: CreateWorkspaceArgs) => void;
  isLoading: boolean;
  onCancel: () => void;
}) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [folderPreview, setFolderPreview] = useState<FolderPreviewResult | null>(null);

  const folderSelectCallback = async (folderPath: string) => {
    setFolderPath(folderPath);
    try {
      const result: FolderPreviewResult = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(
        "get-workspace-folder-preview",
        {
          folderPath,
        }
      );
      if (result.success) {
        setFolderPreview(result);
      }
    } catch (err) {
      Logger.log("Could not get workspace folder preview data", err);
      // No OP
    }
  };

  const handleOnCreateWorkspaceClick = () => {
    onCreateWorkspaceClick({
      workspaceType: WorkspaceType.LOCAL,
      workspaceName,
      folderPath,
    });
  };

  const renderPreviewItems = (items: FolderItem[], isNewAddition = false) => {
    return items.map((item) => (
      <div key={item.path}>
        <PreviewItem item={item} isNewWorkspace={isNewAddition} />
        {item.contents && item.contents.length > 0 && (
          <div className="workspace-folder-preview-content preview-folder-items">
            {renderPreviewItems(item.contents)}
          </div>
        )}
      </div>
    ));
  };

  useEffect(() => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("get-workspace-folder-preview", {
      folderPath: "",
    })
      .then((result: FolderPreviewResult) => {
        if (result.success) {
          setFolderPreview(result);
          setFolderPath(result.folderPath);
        }
      })
      .catch((err: unknown) => {
        Logger.log("Could not get workspace folder preview data", err);
        // No OP
      });
  }, []);

  return (
    <>
      <CreateWorkspaceHeader
        title="Create a new local workspace"
        description=""
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
        <>
          <div className="workspace-folder-preview-description">
            The selected folder will be used as the root of your workspace. Your APIs, variables and related metadata
            will be stored in this.
          </div>
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
                  <Tooltip
                    title="This is a preview of the files that will be added to your selected workspace folder."
                    color="#000"
                  >
                    <MdOutlineInfo className="preview-info-icon" />
                  </Tooltip>
                  <PreviewItem
                    item={{ name: workspaceName || "{{Your workspace name}}", path: folderPath, type: "directory" }}
                    isNewWorkspace={true}
                  />
                  <div className="workspace-folder-preview-content preview-folder-items">
                    {folderPreview.newAdditions.contents &&
                      renderPreviewItems(folderPreview.newAdditions.contents, true)}
                  </div>
                </div>
                <div className="preview-folder-items existing-contents-section">
                  {renderPreviewItems(folderPreview.existingContents)}
                </div>
              </div>
            </>
          </div>
        </>
      ) : null}
      <CreateWorkspaceFooter
        onCancel={onCancel}
        onCreateWorkspaceClick={handleOnCreateWorkspaceClick}
        isLoading={isLoading}
        disabled={!workspaceName.length || !folderPath.length}
      />
    </>
  );
};
