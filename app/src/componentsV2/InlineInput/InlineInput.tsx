import React, { useState } from "react";
import { Row, Input, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./inlineInput.scss";

interface Props {
  value: string;
  placeholder: string;
  disabled?: boolean;
  textarea?: boolean;
  onChange: (value: String) => void;
  onBlur?: () => void;
}

export const InlineInput: React.FC<Props> = ({
  value,
  placeholder,
  onChange,
  onBlur,
  disabled = false,
  textarea = false,
}) => {
  const [isEditable, setIsEditable] = useState(false);

  return (
    <div className="inline-input-container">
      <Row className="inline-input-row">
        {value?.length === 0 || isEditable ? (
          <>
            {textarea ? (
              <Input.TextArea
                className="active-inline-textarea"
                value={value}
                spellCheck={false}
                autoFocus={true}
                placeholder={placeholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                onChange={(e) => onChange(e.target.value)}
                onPressEnter={() => setIsEditable(false)}
                onFocus={() => setIsEditable(true)}
                onBlur={() => {
                  setIsEditable(false);
                  onBlur?.();
                }}
              />
            ) : (
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
            )}
          </>
        ) : (
          <div className="inactive-inline-input">
            <Typography.Text
              ellipsis={!textarea}
              onClick={() => {
                if (!disabled) setIsEditable(true);
              }}
            >
              {value || placeholder}
            </Typography.Text>
            {!disabled && (
              <MdOutlineEdit
                className={`${textarea ? "align-self-start" : "align-self-center"}`}
                onClick={() => setIsEditable(true)}
              />
            )}
          </div>
        )}
      </Row>
    </div>
  );
};
