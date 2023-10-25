import React from "react";
import { Tooltip } from "antd";

interface RecordNameProps {
  name: string;
  children: React.ReactElement;
}

const RecordName: React.FC<RecordNameProps> = ({ name = "", children }) => {
  return name.length > 54 ? (
    <Tooltip title={name} placement="top" mouseEnterDelay={0.5} autoAdjustOverflow color="var(--neutrals-black)">
      {children}
    </Tooltip>
  ) : (
    children
  );
};

export default RecordName;
