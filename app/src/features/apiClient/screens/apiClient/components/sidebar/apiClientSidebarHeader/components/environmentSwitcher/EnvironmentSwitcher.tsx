import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdOutlineCheckCircleOutline } from "@react-icons/all-files/md/MdOutlineCheckCircleOutline";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import "./environmentSwitcher.scss";

export const EnvironmentSwitcher = () => {
  const navigate = useNavigate();
  const { getAllEnvironments, getCurrentEnvironmentName, setCurrentEnvironment } = useEnvironmentManager();
  const currentEnvironment = getCurrentEnvironmentName();
  const environments = getAllEnvironments();

  const dropdownItems = useMemo(() => {
    return environments.map((environment) => ({
      key: environment,
      label: (
        <div className={`${environment === currentEnvironment ? "active-env-item" : ""} env-item`}>
          {environment} {environment === currentEnvironment ? <MdOutlineCheckCircleOutline /> : null}
        </div>
      ),
      onClick: () => {
        setCurrentEnvironment(environment);
        redirectToEnvironment(navigate, environment);
      },
    }));
  }, [environments, setCurrentEnvironment, currentEnvironment, navigate]);

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
        {currentEnvironment}
      </RQButton>
    </Dropdown>
  );
};
