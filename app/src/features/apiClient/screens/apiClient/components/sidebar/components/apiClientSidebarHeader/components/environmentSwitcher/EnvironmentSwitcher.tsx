import { useMemo } from "react";
import { Dropdown, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { toast } from "utils/Toast";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import { trackEnvironmentSwitched } from "features/apiClient/screens/environment/analytics";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import "./environmentSwitcher.scss";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

export const EnvironmentSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllEnvironments, getCurrentEnvironment, setCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId, currentEnvironmentName } = getCurrentEnvironment();
  const environments = getAllEnvironments();
  const { openTab } = useTabsLayoutContext();

  const dropdownItems = useMemo(() => {
    return environments
      .filter((env) => !isGlobalEnvironment(env.id))
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
          if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE)) {
            openTab(environment.id, { title: environment.name });
            trackEnvironmentSwitched(environments.length);
            redirectToEnvironment(navigate, environment.id);
          }
          toast.success(`Switched to ${environment.name} environment`);
        },
      }));
  }, [environments, setCurrentEnvironment, currentEnvironmentId, navigate, location.pathname, openTab]);

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
