import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input, Tooltip } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { redirectToEnvironment, redirectToNewEnvironment } from "utils/RedirectionUtils";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import PATHS from "config/constants/sub/paths";
import { trackCreateEnvironmentClicked, trackEnvironmentCreated } from "../../analytics";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllEnvironments, getCurrentEnvironment, addNewEnvironment } = useEnvironmentManager();
  const environments = getAllEnvironments();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [searchValue, setSearchValue] = useState("");
  const [isNewEnvironmentInputVisible, setIsNewEnvironmentInputVisible] = useState(false);
  const [newEnvironmentValue, setNewEnvironmentValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { envId } = useParams();

  const handleAddEnvironmentClick = () => {
    trackCreateEnvironmentClicked("environments_list");
    redirectToNewEnvironment(navigate);
  };

  const handleAddNewEnvironment = async () => {
    if (newEnvironmentValue) {
      setIsLoading(true);
      const newEnvironment = await addNewEnvironment(newEnvironmentValue);
      if (newEnvironment) {
        redirectToEnvironment(navigate, newEnvironment.id);
        trackEnvironmentCreated(environments.length, "environments_list");
      }
      setIsLoading(false);
    } else {
      navigate(-1);
    }
    setIsNewEnvironmentInputVisible(false);
    setNewEnvironmentValue("");
  };

  useEffect(() => {
    if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE)) {
      setIsNewEnvironmentInputVisible(true);
    }
  }, [location.pathname]);

  return (
    <div style={{ height: "inherit" }}>
      <SidebarListHeader onAddRecordClick={handleAddEnvironmentClick} onSearch={(value) => setSearchValue(value)} />
      {/* TODO: Use input component from collections support PR */}
      {isNewEnvironmentInputVisible && (
        <Input
          autoFocus
          className="new-environment-input"
          size="small"
          placeholder="New Environment name"
          disabled={isLoading}
          onChange={(e) => setNewEnvironmentValue(e.target.value)}
          onPressEnter={handleAddNewEnvironment}
          onBlur={handleAddNewEnvironment}
        />
      )}
      <div className="environments-list">
        {environments.map((environment) =>
          environment.name.toLowerCase().includes(searchValue.toLowerCase()) ? (
            <div
              key={environment.id}
              className={`environments-list-item ${environment.id === envId ? "active" : ""}`}
              onClick={() => {
                redirectToEnvironment(navigate, environment.id);
              }}
            >
              <span>{environment.name}</span>
              <Tooltip
                overlayClassName="active-environment-tooltip"
                title="Active Environment"
                placement="top"
                showArrow={false}
              >
                <span>{environment.id === currentEnvironmentId ? <MdOutlineCheckCircle /> : ""}</span>
              </Tooltip>
            </div>
          ) : null
        )}
      </div>
      {/* TODO: use empty state component from collections support PR */}
    </div>
  );
};
