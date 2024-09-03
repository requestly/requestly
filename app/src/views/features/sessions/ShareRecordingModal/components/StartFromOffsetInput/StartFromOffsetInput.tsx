import React, { useState } from "react";
import { Checkbox } from "antd";
import { RQInput } from "lib/design-system/components";
import "./startFromOffsetInput.css";

interface StartFromOffsetInputProps {
  currentOffset?: string;
  onOffsetChange: (offset: string | null) => void;
}

export const StartFromOffsetInput: React.FC<StartFromOffsetInputProps> = ({
  currentOffset = "0:00",
  onOffsetChange,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [offset, setOffset] = useState(currentOffset);

  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOffset(e.target.value);
    if (isChecked) {
      onOffsetChange(e.target.value);
    }
  };

  return (
    <Checkbox
      checked={isChecked}
      onChange={() => {
        setIsChecked(!isChecked);
        if (isChecked) {
          onOffsetChange(null);
        } else {
          onOffsetChange(offset);
        }
      }}
      className="start-offset-checkbox"
    >
      <div className="start-offset-container">
        <span>Start from</span>
        <RQInput
          disabled={!isChecked}
          value={offset}
          onChange={handleOffsetChange}
          size="small"
          className="start-offset-input"
        />
      </div>
    </Checkbox>
  );
};
