import { useEffect, useState } from "react";
import { Typography, Tooltip } from "antd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineInsertDriveFile } from "@react-icons/all-files/md/MdOutlineInsertDriveFile";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import "./localWorkspaceCreationView.scss";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";

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
  newWorkspace: FolderItem;
}

export const LocalWorkspaceCreationView = () => {
  const [, setWorkspaceName] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [folderPreview, setFolderPreview] = useState<FolderPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folderSelectCallback = (folderPath: string) => {
    setFolderPath(folderPath);
  };

  useEffect(() => {
    const fetchFolderPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result: FolderPreviewResult = await window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(
          "get-folder-preview",
          {
            folderPath: "/Users/parthbhardwaj/Desktop/GQL1",
            workspaceName: "TEST NAME",
          }
        );

        console.log("DBG:: PREVIEW", result);
        setFolderPreview(result);
      } catch (err: any) {
        console.log("DBG:: PREVIEW ERROR", err);
        setError(err?.message || "Failed to load folder preview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolderPreview();
  }, []);

  const renderFolderItem = (item: FolderItem, isNewWorkspace = false) => {
    const Icon = item.type === "directory" ? MdOutlineFolder : MdOutlineInsertDriveFile;

    return (
      <div key={item.path} className={`folder-item ${isNewWorkspace ? "new-workspace-item" : ""}`}>
        <div className="folder-item-content">
          <Icon className="folder-item-icon" />
          <span className="folder-item-name">{item.name}</span>
          {isNewWorkspace && (
            <Tooltip title="This new workspace will be created with the specified structure">
              <MdOutlineInfo className="folder-item-info-icon" />
            </Tooltip>
          )}
        </div>
        {item.contents && item.contents.length > 0 && (
          <div className="folder-item-contents">
            {item.contents.map((content) => (
              <div key={content.path} className="folder-item-nested">
                <Icon className="folder-item-icon" />
                <span className="folder-item-name">{content.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

      <div className="workspace-folder-preview">
        {isLoading ? (
          <div className="preview-loading">
            <Typography.Text>Loading preview...</Typography.Text>
          </div>
        ) : error ? (
          <div className="preview-error">
            <Typography.Text type="danger">{error}</Typography.Text>
          </div>
        ) : folderPreview ? (
          <>
            <div className="preview-header">
              <Typography.Text className="preview-title">PREVIEW:</Typography.Text>
              <Typography.Text className="preview-path">{folderPreview.folderPath}</Typography.Text>
            </div>

            <div className="preview-content">
              {/* New Workspace Section - Highlighted in Green */}
              <div className="new-workspace-section">{renderFolderItem(folderPreview.newWorkspace, true)}</div>

              {/* Existing Contents Section */}
              <div className="existing-contents-section">
                {folderPreview.existingContents.map((item) => renderFolderItem(item))}
              </div>
            </div>
          </>
        ) : null}
      </div>
      <CreateWorkspaceFooter />
    </>
  );
};
