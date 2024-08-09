import React from "react";
import { MdPause } from "@react-icons/all-files/md/MdPause";

interface TrimHandleProps {
  direction: "left" | "right";
  value: string;
  time: number;
  duration: number;
  onMouseDown: () => void;
}

export const TrimHandle: React.FC<TrimHandleProps> = ({ direction, value, time, duration, onMouseDown }) => {
  return (
    <div
      className={`session-trimmer-handle handle-${direction}`}
      onMouseDown={onMouseDown}
      style={{
        left: `${(time / duration) * 100}%`,
        marginLeft: "-10px",
      }}
    >
      <div className="session-trimmer-handle-icon-wrapper">
        <div
          className={`session-trimmer-handle-icon-tooltip ${direction === "left" ? "tooltip-left" : "tooltip-right"}`}
        >
          {value}
        </div>
        <MdPause />
      </div>
    </div>
  );
};
