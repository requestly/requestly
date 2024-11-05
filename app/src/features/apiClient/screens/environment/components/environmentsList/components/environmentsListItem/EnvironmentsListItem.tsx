import { MoreOutlined } from "@ant-design/icons";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { Dropdown, Input, Tooltip, Typography } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToEnvironment } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";

interface EnvironmentsListItemProps {
  environment: {
    id: string;
    name: string;
  };
}

export enum EnvironmentMenuKey {
  RENAME = "rename",
  DUPLICATE = "duplicate",
  DELETE = "delete",
}

export const EnvironmentsListItem: React.FC<EnvironmentsListItemProps> = ({ environment }) => {
  const navigate = useNavigate();
  const { envId } = useParams();
  const { getCurrentEnvironment, renameEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [isRenameInputVisible, setIsRenameInputVisible] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState(environment.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const menuItems = useMemo(() => {
    return [
      {
        key: EnvironmentMenuKey.RENAME,
        label: "Rename",
        onClick: () => setIsRenameInputVisible(true),
      },
      { key: EnvironmentMenuKey.DUPLICATE, label: "Duplicate" },
      { key: EnvironmentMenuKey.DELETE, label: "Delete" },
    ];
  }, []);

  const handleEnvironmentRename = useCallback(async () => {
    if (newEnvironmentName === environment.name) {
      setIsRenameInputVisible(false);
      return;
    }
    setIsRenaming(true);
    await renameEnvironment(environment.id, newEnvironmentName);
    toast.success("Environment renamed successfully");
    setIsRenaming(false);
    setIsRenameInputVisible(false);
  }, [newEnvironmentName, environment]);

  if (isRenameInputVisible) {
    return (
      <Input
        className="environment-rename-input"
        autoFocus
        value={newEnvironmentName}
        onChange={(e) => setNewEnvironmentName(e.target.value)}
        onPressEnter={handleEnvironmentRename}
        onBlur={handleEnvironmentRename}
        disabled={isRenaming}
      />
    );
  }

  return (
    <div
      key={environment.id}
      className={`environments-list-item ${environment.id === envId ? "active" : ""}`}
      onClick={() => {
        redirectToEnvironment(navigate, environment.id);
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
        <Typography.Text
          ellipsis={{
            tooltip: environment.name,
          }}
        >
          {environment.name}
        </Typography.Text>
        <Tooltip
          overlayClassName="active-environment-tooltip"
          title="Active Environment"
          placement="top"
          showArrow={false}
        >
          <span>
            {environment.id === currentEnvironmentId ? <MdOutlineCheckCircle className="active-env-icon" /> : ""}
          </span>
        </Tooltip>
      </div>

      <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
        <RQButton
          size="small"
          type="transparent"
          icon={<MoreOutlined />}
          className="environment-list-item-dropdown-button"
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};
