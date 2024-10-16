import { useNavigate } from "react-router-dom";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../sidebarListHeader/SidebarListHeader";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import "./environmentsList.scss";
import { useState } from "react";

export const EnvironmentsList = () => {
  const navigate = useNavigate();
  const { getAllEnvironments } = useEnvironmentManager();
  const environments = getAllEnvironments();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div>
      <SidebarListHeader onAdd={() => {}} onSearch={handleSearch} />
      <div className="environments-list">
        {environments.map((environment) =>
          environment.name.toLowerCase().includes(searchValue.toLowerCase()) ? (
            <div
              key={environment.id}
              className="environments-list-item"
              onClick={() => {
                redirectToEnvironment(navigate, environment.name);
              }}
            >
              {/* TODO: ADD ACTIVE BADGE */}
              {environment.name}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};
