import { useMemo } from "react";
import { Dropdown, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { toast } from "utils/Toast";
import PATHS from "config/constants/sub/paths";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { trackEnvironmentSwitched } from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import "./environmentSwitcher.scss";

export const EnvironmentSwitcher = () => {
  const location = useLocation();
  const { getAllEnvironments, getCurrentEnvironment, setCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId, currentEnvironmentName } = getCurrentEnvironment();
  const environments = getAllEnvironments();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const dropdownItems = useMemo(() => {
    return environments
      .filter((env) => !isGlobalEnvironment(env.id))
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map((environment) => ({
        key: environment.id,
        label: (
          <div className={`${environment.id === currentEnvironmentId ? "active-env-item" : ""} env-item`}>
            <Typography.Text
              ellipsis={{
                tooltip: {
                  title: environment.name,
                  placement: "right",
                },
              }}
            >
              {environment.name}
            </Typography.Text>{" "}
            {environment.id === currentEnvironmentId ? <MdOutlineCheckCircleOutline /> : null}
          </div>
        ),
        onClick: () => {
          setCurrentEnvironment(environment.id);
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
  }, [environments, setCurrentEnvironment, currentEnvironmentId, location.pathname, openTab]);

  if (environments.length === 0 || (environments.length === 1 && isGlobalEnvironment(environments[0].id))) {
    return (
      <div className="no-environment-container">
        <MdHorizontalSplit /> No environment
      </div>
    );
  }

  return (
    <Dropdown overlayClassName="environment-switcher-dropdown" trigger={["click"]} menu={{ items: dropdownItems }}>
      <RQButton className="environment-switcher-button" size="small">
        {currentEnvironmentName && <MdOutlineSyncAlt />}
        <Typography.Text
          ellipsis={{
            tooltip: {
              title: currentEnvironmentName,
              placement: "right",
            },
          }}
        >
          {currentEnvironmentName || "No environment"}
        </Typography.Text>
      </RQButton>
    </Dropdown>
  );
};
