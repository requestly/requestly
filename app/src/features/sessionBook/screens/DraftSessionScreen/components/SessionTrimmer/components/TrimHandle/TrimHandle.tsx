import React from "react";
import { MdPause } from "@react-icons/all-files/md/MdPause";

interface TrimHandleProps {
  value: string;
  time: number;
  duration: number;
  onMouseDown: () => void;
}

export const TrimHandle: React.FC<TrimHandleProps> = ({ value, time, duration, onMouseDown }) => {
  return (
    <div
      className="session-trimmer-handle"
      onMouseDown={onMouseDown}
      style={{
        left: `${(time / duration) * 100}%`,
        marginLeft: "-10px",
      }}
    >
      <div className="session-trimmer-handle-icon-wrapper">
        <div className="session-trimmer-handle-icon-tooltip">{value}</div>
        <MdPause />
      </div>
    </div>
  );
};
