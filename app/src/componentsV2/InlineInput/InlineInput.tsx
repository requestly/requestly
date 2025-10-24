import React, { useMemo, useState } from "react";
import { Row, Input, Typography } from "antd";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./inlineInput.scss";

interface Props {
  value: string;
  placeholder: string;
  disabled?: boolean;
  textarea?: boolean;
  onChange: (value: string) => void;
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

  const commonInputProps = useMemo(() => {
    return {
      autoFocus: true,
      spellCheck: false,
      placeholder: placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      onPressEnter: () => {
        setIsEditable(false);
        onBlur?.();
      },
      onFocus: () => setIsEditable(true),
      onBlur: () => {
        setIsEditable(false);
        onBlur?.();
      },
    };
  }, [placeholder, onChange, onBlur]);

  return (
    <div className="inline-input-container">
      <Row className="inline-input-row">
        {value?.length === 0 || isEditable ? (
          <>
            {textarea ? (
              <Input.TextArea
                {...commonInputProps}
                className="active-inline-textarea"
                value={value}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            ) : (
              <Input {...commonInputProps} className="active-inline-input" value={value} />
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
