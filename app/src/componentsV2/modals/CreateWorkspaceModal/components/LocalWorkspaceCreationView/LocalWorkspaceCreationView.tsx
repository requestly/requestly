import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "antd";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineInsertDriveFile } from "@react-icons/all-files/md/MdOutlineInsertDriveFile";
import { CreateWorkspaceHeader } from "../CreateWorkspaceHeader/CreateWorkspaceHeader";
import { CreateWorkspaceFooter } from "../CreateWorkspaceFooter/CreateWorkspaceFooter";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { PiFolderOpen } from "@react-icons/all-files/pi/PiFolderOpen";
import Logger from "lib/logger";
import { RQButton } from "lib/design-system-v2/components";
import { CreateWorkspaceArgs } from "features/workspaces/hooks/useCreateWorkspace";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import "./localWorkspaceCreationView.scss";
import { WorkspaceType } from "features/workspaces/types";
import { useDebounce } from "hooks/useDebounce";
import { WorkspacePathEllipsis } from "features/workspaces/components/WorkspacePathEllipsis";
import { LocalWorkspaceCreateOptions } from "./components/LocalWorkspaceCreateOptions/LocalWorkspaceCreateOptions";
import { useOpenLocalWorkspace } from "features/workspaces/hooks/useOpenLocalWorkspace";
import { FileSystemError } from "features/apiClient/helpers/modules/sync/local/services/types";
import { OpenWorkspaceErrorView } from "./components/OpenWorkspaceErrorView";
import { useWorkspaceCreationContext } from "../../context";
import { checkIsWorkspacePathAvailable } from "services/fsManagerServiceAdapter";
import { ExistingWorkspaceConflictView } from "./components/ExistingWorkspaceConflictView";

type FolderItem = {
  name: string;
  path: string;
} & (
  | {
      type: "directory";
      contents: FolderItem[];
    }
  | { type: "file" }
);

interface FolderPreview {
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

// eslint-disable-next-line no-control-regex
const INVALID_FS_NAME_CHARACTERS = /[<>:"/\\|?*\x00-\x1f]/g;

export const LocalWorkspaceCreationView = ({
  onCreateWorkspaceClick,
  onCancel,
  onSuccessCallback,
  isLoading,
  isOpenedInModal,
  analyticEventSource,
}: {
  onCreateWorkspaceClick: (args: CreateWorkspaceArgs) => void;
  onCancel: () => void;
  onSuccessCallback?: () => void;
  isLoading: boolean;
  isOpenedInModal?: boolean;
  analyticEventSource: string;
}) => {
  const { workspaceName, folderPath, setWorkspaceName, setFolderPath } = useWorkspaceCreationContext();

  const [folderPreview, setFolderPreview] = useState<FolderPreview | null>(null);
  const [hasDuplicateWorkspaceName, setHasDuplicateWorkspaceName] = useState(false);
  const [isCreationOptionsVisible, setIsCreationOptionsVisible] = useState(isOpenedInModal ?? false);
  const [openWorkspaceError, setOpenWorkspaceError] = useState<FileSystemError | null>(null);

  const [isSelectedFolderAvailable, setIsSelectedFolderAvailable] = useState(true);

  const { openWorkspace, isLoading: isOpenWorkspaceLoading } = useOpenLocalWorkspace({
    analyticEventSource: "create_workspace_modal",
    onOpenWorkspaceCallback: () => {
      onSuccessCallback?.();
    },
    onError: (error) => {
      setOpenWorkspaceError(error);
    },
  });

  const workspaceNameRef = useRef<string>(workspaceName);

  const folderSelectCallback = async (folderPath: string) => {
    setFolderPath(folderPath);
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
        {item.type === "directory" && item.contents.length > 0 && (
          <div className="workspace-folder-preview-content preview-folder-items">
            {renderPreviewItems(item.contents)}
          </div>
        )}
      </div>
    ));
  };

  const checkForDuplicateWorkspaceName = useCallback(
    (value: string) => {
      const workspaceName = value.replace(INVALID_FS_NAME_CHARACTERS, "-");
      const isDuplicate = folderPreview?.existingContents.find((item) => item.name === workspaceName);
      setHasDuplicateWorkspaceName(!!isDuplicate);
    },
    [folderPreview]
  );

  const debouncedCheckForDuplicateWorkspaceName = useDebounce(checkForDuplicateWorkspaceName);

  const handleWorkspaceNameChange = useCallback(
    (value: string) => {
      const newName = value.replace(INVALID_FS_NAME_CHARACTERS, "-");
      setWorkspaceName(newName);
      workspaceNameRef.current = newName;
      debouncedCheckForDuplicateWorkspaceName(newName);
    },
    [debouncedCheckForDuplicateWorkspaceName, setWorkspaceName]
  );

  useEffect(() => {
    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain("get-workspace-folder-preview", {
      folderPath,
    })
      .then((result: FolderPreview) => {
        if (result.success) {
          setFolderPreview(result);
          setFolderPath(result.folderPath);
          checkIsWorkspacePathAvailable(result.folderPath)
            .then((isEligible) => {
              setIsSelectedFolderAvailable(isEligible);
            })
            .catch(() => {
              setIsSelectedFolderAvailable(false);
            });
        }
      })
      .catch((err: unknown) => {
        Logger.log("Could not get workspace folder preview data", err);
        // No OP
      });
  }, [folderPath, setFolderPreview, setFolderPath]);

  useEffect(() => {
    if (folderPreview) {
      checkForDuplicateWorkspaceName(workspaceNameRef.current);
    }
  }, [folderPreview, checkForDuplicateWorkspaceName]);

  if (openWorkspaceError) {
    return (
      <OpenWorkspaceErrorView
        path={openWorkspaceError.error.path}
        onNewWorkspaceClick={() => {
          setOpenWorkspaceError(null);
          setIsCreationOptionsVisible(false);
        }}
        openWorkspace={openWorkspace}
        isOpeningWorkspaceLoading={isOpenWorkspaceLoading}
        analyticEventSource="create_workspace_modal"
      />
    );
  }

  if (!isSelectedFolderAvailable) {
    return (
      <ExistingWorkspaceConflictView
        path={folderPath}
        onFolderSelectionCallback={() => {
          setIsSelectedFolderAvailable(true);
        }}
        analyticEventSource={analyticEventSource}
      />
    );
  }

  if (isCreationOptionsVisible) {
    return (
      <>
        <div className="create-workspace-header">
          <div className="create-workspace-header__title">Add a local workspace</div>
        </div>
        <div style={{ padding: "12px 0" }}>
          <LocalWorkspaceCreateOptions
            analyticEventSource="create_workspace_modal"
            onCreateWorkspaceClick={() => {
              setOpenWorkspaceError(null);
              setIsCreationOptionsVisible(false);
            }}
            openWorkspace={openWorkspace}
            isOpeningWorkspaceLoading={isOpenWorkspaceLoading}
            isOpenedInModal
          />
        </div>
      </>
    );
  }

  return (
    <>
      <CreateWorkspaceHeader
        title="Create a new local workspace"
        description=""
        name={workspaceName}
        onWorkspaceNameChange={handleWorkspaceNameChange}
        hasDuplicateWorkspaceName={hasDuplicateWorkspaceName}
      />
      <div className="workspace-folder-selector">
        <RQButton icon={<MdOutlineFolder />} onClick={() => displayFolderSelector(folderSelectCallback)}>
          Select a folder
        </RQButton>
        {folderPath.length ? <WorkspacePathEllipsis path={folderPath} className="selected-folder-path" /> : null}
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
                    item={{
                      name: workspaceName || "{{Your workspace name}}",
                      path: folderPath,
                      type: "directory",
                      contents: [],
                    }}
                    isNewWorkspace={true}
                  />
                  <div className="workspace-folder-preview-content preview-folder-items">
                    {folderPreview.newAdditions.type === "directory" &&
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
        disabled={!workspaceName.length || !folderPath.length || hasDuplicateWorkspaceName}
      />
    </>
  );
};
