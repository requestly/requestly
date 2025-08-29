import React, { useCallback } from "react";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { Collapse, Dropdown, MenuProps, Typography } from "antd";
import { Conditional } from "components/common/Conditional";
import { useRBAC } from "features/rbac";
import { RQButton } from "lib/design-system-v2/components";
import {
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

interface WorkspaceCollapseProps {
  workspaceId: string;
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
  const [workspaceName] = useWorkspace(workspaceId, (s) => [s.name]);
  const getAllSelectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.getAllSelectedWorkspaces);
  const { onNewClickV2 } = useApiClientContext();
  const handleCollapseChange = useCallback((key: string) => {}, []);
  const contextId = useContextId();

  const items: MenuProps["items"] = [
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
      disabled: getAllSelectedWorkspaces().length < 2,
      label: "Hide from side panel",
      icon: <FaRegEyeSlash />,
      onClick: () => {
        removeWorkspaceFromView(workspaceId);
        trackMultiWorkspaceDeselected("sidebar_context_menu");
      },
    },
  ];

  return (
    <Collapse
      key={workspaceId}
      ghost
      onChange={handleCollapseChange}
      collapsible="header"
      className="workspace-collapse-container"
      defaultActiveKey={expanded ? workspaceId : ""}
      expandIcon={({ isActive }) => {
        return <MdOutlineArrowForwardIos className={`workspace-collapse-expand-icon ${isActive ? "expanded" : ""}`} />;
      }}
    >
      <Collapse.Panel
        key={workspaceId}
        className="workspace-collapse-panel"
        header={
          <div className="workspace-header-continer">
            <div
              className="workspace-name-container"
              // onClick={(e) => {}}
            >
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
  );
};
