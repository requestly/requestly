import React, { useCallback } from "react";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineArrowForwardIos } from "@react-icons/all-files/md/MdOutlineArrowForwardIos";
import { Collapse, Dropdown, Typography } from "antd";
import { Conditional } from "components/common/Conditional";
import { useRBAC } from "features/rbac";
import { RQButton } from "lib/design-system-v2/components";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useWorkspace } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import "./workspaceCollapse.scss";

interface WorkspaceCollapseProps {
  workspaceId: string;
  children: React.ReactNode;
}

export const WorkspaceCollapse: React.FC<WorkspaceCollapseProps> = ({ workspaceId, children }) => {
  const contextId = useContextId();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [workspaceName] = useWorkspace(workspaceId, (s) => [s.name]);

  const handleCollapseChange = useCallback((key: string) => {}, []);

  console.log({ contextId });
  return (
    <Collapse
      key={workspaceId}
      // activeKey={activeKey}
      ghost
      onChange={handleCollapseChange}
      collapsible="header"
      className="workspace-collapse-container"
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
                  {/* workspace add icon */}
                  <RQButton size="small" type="transparent" icon={<MdAdd />} onClick={(e) => e.stopPropagation()} />
                  {/* three dots icon */}

                  <Dropdown
                    trigger={["click"]}
                    menu={{ items: [] }}
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
            <div> env switcher</div>
          </div>
        }
      >
        {children}
      </Collapse.Panel>
    </Collapse>
  );
};
