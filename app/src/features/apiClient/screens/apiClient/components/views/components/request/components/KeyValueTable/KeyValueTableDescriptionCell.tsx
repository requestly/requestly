import React, { useState, useRef, useEffect } from "react";
import { Form, Tooltip, Input, FormInstance } from "antd";
import { KeyValuePair } from "features/apiClient/types";

interface KeyValueDescriptionCellProps {
  record: KeyValuePair;
  dataIndex: keyof KeyValuePair;
  form: FormInstance;
  onSave: () => Promise<void>;
}

const KeyValueDescriptionCell: React.FC<KeyValueDescriptionCellProps> = ({ record, dataIndex, form, onSave }) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const inputRef = useRef<any>(null);
  const safeValue = record?.[dataIndex] ?? "";

  useEffect(() => {
    if (editingDescription) {
      if (inputRef.current) {
        inputRef.current.focus({ cursor: "end" });
      }
      const currentFormVal = form.getFieldValue(dataIndex);
      if (currentFormVal === undefined || currentFormVal === null) {
        form.setFieldsValue({ [dataIndex]: "" });
      }
    }
  }, [editingDescription, dataIndex, form]);

  const handleBlur = () => {
    const currentVal = form.getFieldValue(dataIndex);
    if (currentVal === undefined) {
      form.setFieldsValue({ [dataIndex]: "" });
    }
    onSave();
    setEditingDescription(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      form.setFieldsValue({ [dataIndex]: e.currentTarget.value });
      e.preventDefault();
      e.currentTarget.parentElement?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: e.key,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          bubbles: true,
        })
      );
    }
  };

  return (
    <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={safeValue}>
      {!editingDescription ? (
        <Tooltip
          title={safeValue}
          overlayClassName="key-value-description-tooltip"
          placement="bottom"
          color="#000000"
          mouseEnterDelay={0.5}
        >
          <div className="key-value-description-view" onClick={() => setEditingDescription(true)}>
            {safeValue || <span className="placeholder">Description</span>}
          </div>
        </Tooltip>
      ) : (
        <div className="key-value-description-floating-editor">
          <Input.TextArea
            ref={inputRef}
            className="key-value-description-textarea"
            autoSize={{ minRows: 1 }}
            placeholder="Description"
            defaultValue={safeValue as string}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={async (e) => {
              form.setFieldsValue({ [dataIndex]: e.target.value });
              await onSave();
            }}
          />
        </div>
      )}
    </Form.Item>
  );
};

export default KeyValueDescriptionCell;
