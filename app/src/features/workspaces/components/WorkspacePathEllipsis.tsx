import React from "react";
import { Typography } from "antd";

interface WorkspacePathEllipsisProps {
  path: string;
  className?: string;
}

export const WorkspacePathEllipsis: React.FC<WorkspacePathEllipsisProps> = ({ path, className }) => {
  if (!path) {
    return null;
  }

  const lastSeparatorIndex = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));

  const suffix = lastSeparatorIndex >= 0 ? path.slice(lastSeparatorIndex) : path;
  const prefix = lastSeparatorIndex >= 0 ? path.slice(0, lastSeparatorIndex) : "";

  return (
    <Typography.Text
      className={className}
      ellipsis={{
        suffix,
        tooltip: {
          title: path,
          color: "#000",
          placement: "bottom",
          mouseEnterDelay: 0.5,
        },
      }}
    >
      {prefix}
    </Typography.Text>
  );
};
