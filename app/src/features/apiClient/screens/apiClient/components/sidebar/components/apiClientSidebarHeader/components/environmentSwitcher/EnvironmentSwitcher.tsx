import { useEffect, useState, useMemo, useCallback } from "react";
import { Dropdown, MenuProps, Typography, Popover } from "antd";
import { useLocation } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { MdOutlineExpandMore } from "@react-icons/all-files/md/MdOutlineExpandMore";
import { MdNotInterested } from "@react-icons/all-files/md/MdNotInterested";
import { toast } from "utils/Toast";
import PATHS from "config/constants/sub/paths";
import { trackEnvironmentSwitched } from "modules/analytics/events/features/apiClient";
import { useTabActions } from "componentsV2/Tabs/slice";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import "./environmentSwitcher.scss";
import { CreateEnvironmentPopup } from "../CreateEnvironmentPopup/CreateEnvironmentPopup";
import { useAllEnvironments, useActiveEnvironment } from "features/apiClient/slices/environments/environments.hooks";
import { useEnvironmentByIdMemoized } from "features/apiClient/slices/environments/environments.hooks";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { environmentsActions } from "features/apiClient/slices/environments/slice";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";

function SwitcherListItemLabel(props: { environmentId: string }) {
  const environment = useEnvironmentByIdMemoized(props.environmentId);

  return (
    <Typography.Text
      ellipsis={{
        tooltip: {
          title: environment?.name || "",
          placement: "right",
        },
      }}
    >
      {environment?.name || ""}
    </Typography.Text>
  );
}

export const EnvironmentSwitcher = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const environments = useAllEnvironments();
  const activeEnvironment = useActiveEnvironment();
  const dispatch = useApiClientDispatch();

  const workspaceId = useWorkspaceId();
  const { openBufferedTab } = useTabActions();

  const setActiveEnvironment = useCallback(
    (id: string | undefined) => {
      dispatch(environmentsActions.setActiveEnvironment(id || null));
    },
    [dispatch]
  );

  useEffect(() => {
    const handleEvent = (event: any) => {
      const eventContextId = event.detail?.contextId;
      if (eventContextId === workspaceId) {
        setIsDropdownOpen(true);
      }
    };

    window.addEventListener("trigger-env-switcher", handleEvent);
    return () => window.removeEventListener("trigger-env-switcher", handleEvent);
  }, [workspaceId]);

  const dropdownItems: MenuProps["items"] = useMemo(() => {
    const sorted = [...environments].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    const noEnvItem = {
      key: "__no_environment__",
      label: (
        <div className={`${!activeEnvironment?.id ? "active-env-item" : ""} env-item no-env-item`}>
          <span className="no-env-icon">
            <MdNotInterested />
          </span>
          <Typography.Text>No environment</Typography.Text>
          {!activeEnvironment?.id ? <MdOutlineCheckCircleOutline /> : null}
        </div>
      ),
      onClick: (menuInfo: any) => {
        menuInfo?.domEvent?.stopPropagation?.();
        setIsDropdownOpen(false);
        setActiveEnvironment(undefined); // Clear active environment
        trackEnvironmentSwitched();
        toast.success("No environment selected");
      },
    };

    const environmentItems: MenuProps["items"] = sorted.map((environment) => ({
      key: environment.id,
      label: (
        <div className={`${environment.id === activeEnvironment?.id ? "active-env-item" : ""} env-item`}>
          <SwitcherListItemLabel environmentId={environment.id} />
          {environment.id === activeEnvironment?.id ? <MdOutlineCheckCircleOutline /> : null}
        </div>
      ),
      onClick: (menuInfo: any) => {
        menuInfo?.domEvent?.stopPropagation?.();
        setIsDropdownOpen(false);
        setActiveEnvironment(environment.id);
        trackEnvironmentSwitched();
        if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE)) {
          openBufferedTab({
            source: new EnvironmentViewTabSource({
              id: environment.id,
              title: environment.name,
              context: {
                id: workspaceId,
              },
              isGlobal: environment.id === GLOBAL_ENVIRONMENT_ID,
            }),
          });
        }
        toast.success(`Switched to ${environment.name} environment`);
      },
    }));

    const dividerItem = { type: "divider", key: "__divider__" } as const;

    return [noEnvItem, dividerItem, ...environmentItems];
  }, [environments, activeEnvironment?.id, setActiveEnvironment, location.pathname, openBufferedTab, workspaceId]);

  if (environments.length === 0) {
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        showArrow={false}
        overlayStyle={{ padding: 0, margin: 0 }}
        align={{ offset: [-17, -6] }}
        overlayClassName="create-environment-popup-wrapper"
        content={<CreateEnvironmentPopup />}
      >
        <RQButton onClick={(e) => e.stopPropagation()} className="environment-switcher-button" size="small">
          <div className="no-environment-container">
            <MdHorizontalSplit /> No environment
          </div>
        </RQButton>
      </Popover>
    );
  }

  return (
    <Dropdown
      overlayClassName="environment-switcher-dropdown"
      trigger={["click"]}
      menu={{ items: dropdownItems }}
      open={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
    >
      <RQButton onClick={(e) => e.stopPropagation()} className="environment-switcher-button" size="small">
        {activeEnvironment ? (
          <>
            <span className="environment-icon">
              <MdHorizontalSplit />
            </span>
            <SwitcherListItemLabel environmentId={activeEnvironment.id} />
          </>
        ) : (
          <span className="no-environment-button-label">
            <span className="no-environment-icon">
              <MdNotInterested />
            </span>
            No environment
          </span>
        )}
        <MdOutlineExpandMore />
      </RQButton>
    </Dropdown>
  );
};
