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

  useEffect(() => {
    if (editingDescription && inputRef.current) {
      inputRef.current.focus({ cursor: "end" });
    }
  }, [editingDescription]);

  const handleBlur = () => {
    onSave();
    setEditingDescription(false);
  };

  return (
    <Form.Item style={{ margin: 0 }} name={dataIndex} initialValue={record?.[dataIndex]}>
      {!editingDescription ? (
        <Tooltip
          title={record?.[dataIndex]}
          overlayClassName="key-value-description-tooltip"
          placement="bottom"
          color="#000000"
          mouseEnterDelay={0.5}
        >
          <div className="key-value-description-view" onClick={() => setEditingDescription(true)}>
            {record?.[dataIndex] || <span className="placeholder">Description</span>}
          </div>
        </Tooltip>
      ) : (
        <div className="key-value-description-floating-editor">
          <Input.TextArea
            ref={inputRef}
            className="key-value-description-textarea"
            autoSize={{ minRows: 1 }}
            placeholder="Description"
            defaultValue={record?.[dataIndex] as string}
            onBlur={handleBlur}
            onChange={(e) => {
              form.setFieldsValue({ [dataIndex]: e.target.value });
            }}
          />
        </div>
      )}
    </Form.Item>
  );
};

export default KeyValueDescriptionCell;
