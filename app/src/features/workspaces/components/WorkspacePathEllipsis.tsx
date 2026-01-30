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
  const hasSplit = lastSeparatorIndex > 0;

  const suffix = hasSplit ? path.slice(lastSeparatorIndex) : "";
  const prefix = hasSplit ? path.slice(0, lastSeparatorIndex) : path;

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
