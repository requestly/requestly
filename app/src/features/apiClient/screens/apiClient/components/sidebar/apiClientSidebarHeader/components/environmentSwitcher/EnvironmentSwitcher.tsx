import { useMemo } from "react";
import { Dropdown } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import "./environmentSwitcher.scss";
import { toast } from "utils/Toast";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";

export const EnvironmentSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllEnvironments, getCurrentEnvironment, setCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId, currentEnvironmentName } = getCurrentEnvironment();
  const environments = getAllEnvironments();

  const dropdownItems = useMemo(() => {
    return environments.map((environment) => ({
      key: environment,
      label: (
        <div className={`${environment.id === currentEnvironmentId ? "active-env-item" : ""} env-item`}>
          {environment.name} {environment.id === currentEnvironmentId ? <MdOutlineCheckCircleOutline /> : null}
        </div>
      ),
      onClick: () => {
        setCurrentEnvironment(environment.id);
        if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE)) {
          redirectToEnvironment(navigate, environment.id);
        }
        toast.success(`Switched to ${environment.name} environment`);
      },
    }));
  }, [environments, setCurrentEnvironment, currentEnvironmentId, navigate, location.pathname]);

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
        <MdOutlineSyncAlt />
        {currentEnvironmentName}
      </RQButton>
    </Dropdown>
  );
};
