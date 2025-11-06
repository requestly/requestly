import { useMemo } from "react";
import { Dropdown, MenuProps, Typography, Popover } from "antd";
import { useLocation } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { MdOutlineExpandMore } from "@react-icons/all-files/md/MdOutlineExpandMore";
import { toast } from "utils/Toast";
import PATHS from "config/constants/sub/paths";
import { trackEnvironmentSwitched } from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import "./environmentSwitcher.scss";
import { CreateEnvironmentPopup } from "./CreateEnvironmentPopup";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { EnvironmentState } from "features/apiClient/store/environments/environments.store";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment.hook";
import { useContextId } from "features/apiClient/contexts/contextId.context";

function SwitcherListItemLabel(props: { environmentId: EnvironmentState["id"] }) {
  const environmentName = useEnvironment(props.environmentId, (s) => s.name);

  return (
    <Typography.Text
      ellipsis={{
        tooltip: {
          title: environmentName,
          placement: "right",
        },
      }}
    >
      {environmentName}
    </Typography.Text>
  );
}

export const EnvironmentSwitcher = () => {
  const location = useLocation();

  const [environments, setActiveEnvironment] = useAPIEnvironment((s) => [s.environments, s.setActive]);

  const activeEnvironment = useActiveEnvironment();

  const contextId = useContextId();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return environments
      .map((e) => e.getState())
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map((environment) => ({
        key: environment.id,
        label: (
          <div className={`${environment.id === activeEnvironment?.id ? "active-env-item" : ""} env-item`}>
            <SwitcherListItemLabel environmentId={environment.id} />
            {environment.id === activeEnvironment?.id ? <MdOutlineCheckCircleOutline /> : null}
          </div>
        ),
        onClick: (menuInfo) => {
          menuInfo?.domEvent?.stopPropagation?.();
          setActiveEnvironment(environment.id);
          trackEnvironmentSwitched();
          if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE)) {
            openTab(
              new EnvironmentViewTabSource({
                id: environment.id,
                title: environment.name,
                context: {
                  id: contextId,
                },
              })
            );
          }
          toast.success(`Switched to ${environment.name} environment`);
        },
      }));
  }, [environments, activeEnvironment?.id, setActiveEnvironment, location.pathname, openTab, contextId]);

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
    <Dropdown overlayClassName="environment-switcher-dropdown" trigger={["click"]} menu={{ items: dropdownItems }}>
      <RQButton onClick={(e) => e.stopPropagation()} className="environment-switcher-button" size="small">
        <span className="environment-icon">
          <MdHorizontalSplit />
        </span>
        {activeEnvironment ? <SwitcherListItemLabel environmentId={activeEnvironment.id} /> : "No environment"}
        {<MdOutlineExpandMore />}
      </RQButton>
    </Dropdown>
  );
};
