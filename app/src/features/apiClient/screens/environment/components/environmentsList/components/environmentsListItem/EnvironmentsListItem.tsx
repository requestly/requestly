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
  const { getCurrentEnvironment, renameEnvironment, duplicateEnvironment, deleteEnvironment } = useEnvironmentManager();
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
      { key: EnvironmentMenuKey.DUPLICATE, label: "Duplicate", onClick: () => handleEnvironmentDuplicate() },
      { key: EnvironmentMenuKey.DELETE, label: "Delete", danger: true, onClick: () => handleEnvironmentDelete() },
    ];
  }, []);

  const handleEnvironmentRename = useCallback(async () => {
    if (newEnvironmentName === environment.name) {
      setIsRenameInputVisible(false);
      return;
    }
    setIsRenaming(true);
    renameEnvironment(environment.id, newEnvironmentName)
      .then(() => {
        toast.success("Environment renamed successfully");
      })
      .catch(() => {
        toast.error("Failed to rename environment");
      })
      .finally(() => {
        setIsRenaming(false);
        setIsRenameInputVisible(false);
      });
  }, [newEnvironmentName, environment.id]);

  const handleEnvironmentDuplicate = useCallback(async () => {
    toast.loading("Duplicating environment...");
    duplicateEnvironment(environment.id)
      .then(() => {
        toast.success("Environment duplicated successfully");
      })
      .catch(() => {
        toast.error("Failed to duplicate environment");
      });
  }, [environment.id]);

  const handleEnvironmentDelete = useCallback(() => {
    toast.loading("Deleting environment...");
    deleteEnvironment(environment.id)
      .then(() => {
        toast.success("Environment deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete environment");
      });
  }, [environment.id]);

  if (isRenameInputVisible) {
    return (
      <Input
        className="environment-input"
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
      <div className="environments-list-item__label">
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
