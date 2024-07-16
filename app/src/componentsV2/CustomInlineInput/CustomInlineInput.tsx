import React, { useState } from "react";
import { Row, Input, Typography } from "antd";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import "./customInlineInput.scss";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: String) => void;
  onBlur?: () => void;
}

export const CustomInlineInput: React.FC<Props> = ({ value, placeholder, onChange, onBlur }) => {
  const [isEditable, setIsEditable] = useState<boolean>(false);

  return (
    <div className="inline-input-container">
      <Row className="inline-input-row">
        {value?.length === 0 || isEditable ? (
          <Input
            className="active-inline-input"
            onFocus={() => setIsEditable(true)}
            onBlur={() => {
              setIsEditable(false);
              onBlur?.();
            }}
            bordered={false}
            autoFocus={true}
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onPressEnter={() => setIsEditable(false)}
          />
        ) : (
          <div className="inactive-inline-input">
            <Typography.Text
              ellipsis={true}
              onClick={() => {
                setIsEditable(true);
              }}
            >
              {value ?? placeholder}
            </Typography.Text>
            <BiPencil onClick={() => setIsEditable(true)} />
          </div>
        )}
      </Row>
    </div>
  );
};
