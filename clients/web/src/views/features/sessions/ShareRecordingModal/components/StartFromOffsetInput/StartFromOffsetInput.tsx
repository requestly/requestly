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
    const input = e.target.value;
    if (isValidTimeOffsetInput(input)) {
      setOffset(input);
      if (isChecked) {
        onOffsetChange(input);
      }
    }
  };

  const isValidTimeOffsetInput = (input: string): boolean => {
    if (input === "") return true;
    return /^(\d{1,2}:?(?!\d:)\d{0,2}|:?\d{1,2})$/.test(input);
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
          onBlur={() => {
            if (offset === "") {
              setOffset("00:00");
            }
          }}
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
