import { useMemo } from "react";
import { Dropdown, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { RiArrowDropDownLine } from "@react-icons/all-files/ri/RiArrowDropDownLine";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { toast } from "utils/Toast";
import PATHS from "config/constants/sub/paths";
import { trackEnvironmentSwitched } from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment.hook";
import "./environmentSwitcher.scss";

function SwitcherListItemLabel(props: { envId: string }) {
  const environmentName = useEnvironment(props.envId, (s) => s.name);

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

  const [environments, activeEnvironmentStore, setActiveEnvironment] = useAPIEnvironment((s) => [
    s.environments,
    s.activeEnvironment,
    s.setActive,
  ]);

  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const dropdownItems = useMemo(() => {
    return environments
      .map((e) => e.getState())
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map((environment) => ({
        key: environment.id,
        label: (
          <div
            className={`${environment.id === activeEnvironmentStore.getState()?.id ? "active-env-item" : ""} env-item`}
          >
            <SwitcherListItemLabel envId={environment.id} />
            {environment.id === activeEnvironmentStore.getState()?.id ? <MdOutlineCheckCircleOutline /> : null}
          </div>
        ),
        onClick: () => {
          setActiveEnvironment(environment.id);
          trackEnvironmentSwitched();
          if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE)) {
            openTab(
              new EnvironmentViewTabSource({
                id: environment.id,
                title: environment.name,
              })
            );
          }
          toast.success(`Switched to ${environment.name} environment`);
        },
      }));
  }, [environments, activeEnvironmentStore, setActiveEnvironment, location.pathname, openTab]);

  if (environments.length === 0) {
    return (
      <div className="no-environment-container">
        <MdHorizontalSplit /> No environment
      </div>
    );
  }

  return (
    <Dropdown overlayClassName="environment-switcher-dropdown" trigger={["click"]} menu={{ items: dropdownItems }}>
      <RQButton className="environment-switcher-button" size="small">
        {activeEnvironmentStore ? (
          <SwitcherListItemLabel envId={activeEnvironmentStore.getState().id} />
        ) : (
          "No environment"
        )}
        {<RiArrowDropDownLine />}
      </RQButton>
    </Dropdown>
  );
};
