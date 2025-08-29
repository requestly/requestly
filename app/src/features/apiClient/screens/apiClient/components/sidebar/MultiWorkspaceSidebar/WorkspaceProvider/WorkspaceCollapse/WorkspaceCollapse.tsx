import React, { useCallback, useMemo, useState } from "react";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { Collapse, Dropdown, MenuProps, Typography } from "antd";
import { Conditional } from "components/common/Conditional";
import { useRBAC } from "features/rbac";
import { RQButton } from "lib/design-system-v2/components";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
  useWorkspace,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { EnvironmentSwitcher } from "../../../components/apiClientSidebarHeader/components/environmentSwitcher/EnvironmentSwitcher";
import "./workspaceCollapse.scss";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { FaRegEyeSlash } from "@react-icons/all-files/fa/FaRegEyeSlash";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { removeWorkspaceFromView } from "features/apiClient/commands/multiView";
import {
  NewApiRecordDropdown,
  NewRecordDropdownItemType,
} from "../../../components/NewApiRecordDropdown/NewApiRecordDropdown";
import { useApiClientContext } from "features/apiClient/contexts";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { setLastUsedContextId } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { ApiClientSidebarTabKey } from "../../MultiWorkspaceSidebar";
import { trackManageWorkspaceClicked, trackMultiWorkspaceDeselected } from "modules/analytics/events/common/teams";
import LoadingModal from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector/components/LoadingModal";
import { Workspace, WorkspaceType } from "features/workspaces/types";
import { useDispatch, useSelector } from "react-redux";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { toast } from "utils/Toast";
import { showSwitchWorkspaceSuccessToast, switchWorkspace } from "actions/TeamWorkspaceActions";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAppMode } from "store/selectors";

interface WorkspaceCollapseProps {
  workspaceId: string;
  children: React.ReactNode;
  showEnvSwitcher: boolean;
  type?: string;
}

export const WorkspaceCollapse: React.FC<WorkspaceCollapseProps> = ({
  workspaceId,
  children,
  showEnvSwitcher,
  type,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);

  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const [workspaceName, rawWorkspace] = useWorkspace(workspaceId, (s) => [s.name, s.rawWorkspace]);
  const [getViewMode, getAllSelectedWorkspaces] = useApiClientMultiWorkspaceView((s) => [
    s.getViewMode,
    s.getAllSelectedWorkspaces,
  ]);

  const { onNewClickV2 } = useApiClientContext();
  const contextId = useContextId();

  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

  const handleWorkspaceSwitch = useCallback(
    async (workspace: Workspace) => {
      const viewMode = getViewMode();

      if (viewMode === ApiClientViewMode.SINGLE) {
        if (activeWorkspace?.id === workspace.id) {
          toast.info("Workspace already selected!");
          return;
        }
      }

      setIsLoadingModalOpen(true);
      switchWorkspace(
        {
          teamId: workspace.id,
          teamName: workspace.name,
          teamMembersCount: workspace.accessCount,
          workspaceType: workspace.workspaceType,
        },
        dispatch,
        {
          isSyncEnabled: user?.details?.isSyncEnabled,
          isWorkspaceMode: workspace.workspaceType === WorkspaceType.SHARED,
        },
        appMode,
        undefined,
        "workspaces_dropdown"
      )
        .then(() => {
          if (!isLoadingModalOpen) {
            showSwitchWorkspaceSuccessToast(workspace.name);
          }

          setIsLoadingModalOpen(false);
        })
        .catch((error) => {
          setIsLoadingModalOpen(false);
          toast.error(
            "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
          );
        });
    },
    [activeWorkspace?.id, appMode, dispatch, getViewMode, isLoadingModalOpen, user?.details?.isSyncEnabled]
  );

  const items: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "1",
        label: "Manage Workspace",
        icon: <MdOutlineSettings />,
        onClick: () => {
          trackManageWorkspaceClicked("sidebar_context_menu");
          redirectToTeam(navigate, workspaceId);
        },
      },
      {
        key: "2",
        label: "Hide from side panel",
        icon: <FaRegEyeSlash />,
        onClick: () => {
          if (getViewMode() === ApiClientViewMode.MULTI && getAllSelectedWorkspaces().length === 1) {
            handleWorkspaceSwitch(rawWorkspace);
          } else {
            removeWorkspaceFromView(workspaceId);
          }

          trackMultiWorkspaceDeselected("sidebar_context_menu");
        },
      },
    ];
  }, [getAllSelectedWorkspaces, getViewMode, handleWorkspaceSwitch, navigate, rawWorkspace, workspaceId]);

  return (
    <>
      {isLoadingModalOpen ? (
        <LoadingModal isModalOpen={isLoadingModalOpen} closeModal={() => setIsLoadingModalOpen(false)} />
      ) : null}

      <Collapse
        key={workspaceId}
        ghost
        collapsible="header"
        className="workspace-collapse-container"
        expandIcon={({ isActive }) => {
          return (
            <MdOutlineArrowForwardIos className={`workspace-collapse-expand-icon ${isActive ? "expanded" : ""}`} />
          );
        }}
      >
        <Collapse.Panel
          key={workspaceId}
          className="workspace-collapse-panel"
          header={
            <div className="workspace-header-continer">
              <div className="workspace-name-container">
                <Typography.Text
                  ellipsis={{
                    tooltip: {
                      title: workspaceName,
                      placement: "right",
                      color: "#000",
                      mouseEnterDelay: 0.5,
                    },
                  }}
                  className="workspace-name"
                >
                  {workspaceName}
                </Typography.Text>

                <Conditional condition={isValidPermission}>
                  <div className="workspace-options">
                    {type === ApiClientSidebarTabKey.ENVIRONMENTS ? (
                      <RQButton
                        size="small"
                        type="transparent"
                        icon={<MdAdd />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNewClickV2({
                            contextId: contextId,
                            analyticEventSource: "api_client_sidebar_header",
                            recordType: RQAPI.RecordType.ENVIRONMENT,
                            collectionId: undefined,
                          });
                        }}
                      />
                    ) : (
                      <NewApiRecordDropdown
                        invalidActions={[NewRecordDropdownItemType.ENVIRONMENT]}
                        onSelect={(params) => {
                          setLastUsedContextId(contextId);
                          //FIXME: fix the analytics here
                          onNewClickV2({
                            contextId: contextId,
                            analyticEventSource: "api_client_sidebar_header",
                            recordType: params.recordType,
                            collectionId: undefined,
                            entryType: params.entryType,
                          });
                        }}
                      >
                        <RQButton
                          size="small"
                          type="transparent"
                          icon={<MdAdd />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </NewApiRecordDropdown>
                    )}

                    <Dropdown
                      menu={{ items }}
                      trigger={["click"]}
                      placement="bottomRight"
                      overlayClassName="collection-dropdown-menu"
                    >
                      <RQButton
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        size="small"
                        type="transparent"
                        icon={<MdOutlineMoreHoriz />}
                      />
                    </Dropdown>
                  </div>
                </Conditional>
              </div>

              {showEnvSwitcher ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <EnvironmentSwitcher />
                </div>
              ) : null}
            </div>
          }
        >
          {children}
        </Collapse.Panel>
      </Collapse>
    </>
  );
};
