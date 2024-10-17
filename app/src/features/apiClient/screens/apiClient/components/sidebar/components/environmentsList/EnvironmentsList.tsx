import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
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
  const [isNewEnvironmentInputVisible, setIsNewEnvironmentInputVisible] = useState(false);
  const [newEnvironmentValue, setNewEnvironmentValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleAddEnvironmentClick = () => {
    setIsNewEnvironmentInputVisible(true);
  };

  const handleAddNewEnvironment = async () => {
    if (newEnvironmentValue) {
      setIsLoading(true);
      await addNewEnvironment(newEnvironmentValue);
      setIsLoading(false);
    }
    setIsNewEnvironmentInputVisible(false);
    setNewEnvironmentValue("");
  };

  return (
    <div style={{ height: "inherit" }}>
      <SidebarListHeader onAddRecordClick={handleAddEnvironmentClick} onSearch={handleSearch} />
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
      {/* TODO: use empty state component from collections support PR */}
    </div>
  );
};
