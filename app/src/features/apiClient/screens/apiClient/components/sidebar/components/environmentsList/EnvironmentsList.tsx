import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../sidebarListHeader/SidebarListHeader";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const navigate = useNavigate();
  const { getAllEnvironments, getCurrentEnvironment, addNewEnvironment } = useEnvironmentManager();
  const environments = getAllEnvironments();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleAddEnvironment = (environmentName: string) => {
    addNewEnvironment(environmentName);
  };

  return (
    <div>
      <SidebarListHeader onAdd={handleAddEnvironment} onSearch={handleSearch} />
      <div className="environments-list">
        {environments.map((environment) =>
          environment.name.toLowerCase().includes(searchValue.toLowerCase()) ? (
            <div
              key={environment.id}
              className={`environments-list-item ${environment.id === currentEnvironmentId ? "active" : ""}`}
              onClick={() => {
                redirectToEnvironment(navigate, environment.id);
              }}
            >
              {/* TODO: ADD ACTIVE BADGE */}
              {environment.name}
            </div>
          ) : null
        )}
      </div>
      {/* TODO: use emoy state compnenet from collections support PR */}
    </div>
  );
};
