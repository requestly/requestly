import React, { useMemo } from "react";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { Collapse, Dropdown, MenuProps, Typography } from "antd";
import { Conditional } from "components/common/Conditional";
import { useRBAC } from "features/rbac";
import { RQButton } from "lib/design-system-v2/components";
import {
  useGetAllSelectedWorkspaces,
  useViewMode,
  useWorkspaceViewActions,
} from "features/apiClient/slices/workspaceView/hooks";
import { getWorkspaceInfo } from "features/apiClient/slices/workspaceView/utils";
import { getWorkspaceById } from "store/slices/workspaces/selectors";
import { useSelector } from "react-redux";
import { EnvironmentSwitcher } from "../../../components/apiClientSidebarHeader/components/environmentSwitcher/EnvironmentSwitcher";
import "./workspaceCollapse.scss";
import { MdOutlineSettings } from "@react-icons/all-files/md/MdOutlineSettings";
import { FaRegEyeSlash } from "@react-icons/all-files/fa/FaRegEyeSlash";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import {
  NewApiRecordDropdown,
  NewRecordDropdownItemType,
} from "../../../components/NewApiRecordDropdown/NewApiRecordDropdown";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import { ApiClientSidebarTabKey } from "../../MultiWorkspaceSidebar";
import { trackManageWorkspaceClicked, trackMultiWorkspaceDeselected } from "modules/analytics/events/common/teams";
import LoadingModal from "layouts/DashboardLayout/MenuHeader/WorkspaceSelector/components/LoadingModal";
import { useWorkspaceSwitcher } from "../useWorkspaceSwitcher";
import { ApiClientViewMode, WorkspaceInfo, apiClientContextRegistry } from "features/apiClient/slices";

interface WorkspaceCollapseProps {
  workspaceId: WorkspaceInfo["id"];
  children: React.ReactNode;
  showEnvSwitcher: boolean;
  showNewRecordBtn?: boolean;
  type?: string;
  expanded?: boolean;
}

export const WorkspaceCollapse: React.FC<WorkspaceCollapseProps> = ({
  workspaceId,
  children,
  showEnvSwitcher,
  type,
  expanded = false,
  showNewRecordBtn = true,
}) => {
  const navigate = useNavigate();

  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const rawWorkspace = useSelector(getWorkspaceById(workspaceId));
  const workspaceName = rawWorkspace?.name ?? "Workspace";
  const viewMode = useViewMode();
  const selectedWorkspaces = useGetAllSelectedWorkspaces();
  const { workspaceViewManager } = useWorkspaceViewActions();
  const user = useSelector(getUserAuthDetails);
  const userId = user?.details?.profile?.uid;

  const {
    handleWorkspaceSwitch,
    confirmWorkspaceSwitch,
    isWorkspaceLoading,
    setIsWorkspaceLoading,
  } = useWorkspaceSwitcher();

  const { onNewClickV2 } = useApiClientContext();

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
        onClick: async () => {
          if (viewMode === ApiClientViewMode.MULTI && selectedWorkspaces.length === 1) {
            confirmWorkspaceSwitch(() => handleWorkspaceSwitch(rawWorkspace!));
          } else if (rawWorkspace) {
            await workspaceViewManager({
              workspaces: [getWorkspaceInfo(rawWorkspace)],
              action: "remove",
              userId,
            });
          }

          trackMultiWorkspaceDeselected("sidebar_context_menu");
        },
      },
    ];
  }, [
    confirmWorkspaceSwitch,
    selectedWorkspaces.length,
    viewMode,
    handleWorkspaceSwitch,
    navigate,
    rawWorkspace,
    workspaceId,
    workspaceViewManager,
    userId,
  ]);

  return (
    <>
      {isWorkspaceLoading ? (
        <LoadingModal isModalOpen={isWorkspaceLoading} closeModal={() => setIsWorkspaceLoading(false)} />
      ) : null}

      <Collapse
        ghost
        key={workspaceId}
        collapsible="header"
        className="workspace-collapse-container"
        defaultActiveKey={expanded ? workspaceId || "" : ""}
        expandIcon={({ isActive }) => {
          return (
            <MdOutlineArrowForwardIos className={`workspace-collapse-expand-icon ${isActive ? "expanded" : ""}`} />
          );
        }}
      >
        <Collapse.Panel
          key={workspaceId || ""}
          className="workspace-collapse-panel"
          header={
            <div className="workspace-header-container">
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
                    {showNewRecordBtn ? (
                      <>
                        {type === ApiClientSidebarTabKey.ENVIRONMENTS ? (
                          <RQButton
                            size="small"
                            type="transparent"
                            icon={<MdAdd />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNewClickV2({
                                contextId: workspaceId,
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
                              apiClientContextRegistry.setLastUsedContext(workspaceId);
                              //FIXME: fix the analytics here
                              onNewClickV2({
                                contextId: workspaceId,
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
                      </>
                    ) : null}

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

              {showEnvSwitcher ? <EnvironmentSwitcher /> : null}
            </div>
          }
        >
          {children}
        </Collapse.Panel>
      </Collapse>
    </>
  );
};
