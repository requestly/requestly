import { PlusOutlined } from "@ant-design/icons";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { Button, Divider, Input, Select, Space } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import type React from "react";
import { useState } from "react";

interface EnumSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  initialOptions?: string[];
}

export const EnumSelect: React.FC<EnumSelectProps> = ({ value, onChange, disabled, initialOptions = [] }) => {
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Select
        disabled={disabled}
        value={value}
        placeholder="Select value"
        onChange={onChange}
        optionLabelProp="label"
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <Space.Compact
              style={{
                width: "100%",
                padding: "2px 12px",
                display: "flex",
                gap: "6px",
              }}
            >
              <Input
                placeholder="Add new enum"
                style={{
                  borderRadius: "5px",
                  fontSize: "14px",
                  padding: "2px 10px",
                }}
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                disabled={disabled}
              />
              <Button
                icon={<PlusOutlined />}
                style={{ borderRadius: "5px" }}
                onClick={handleAddOption}
                disabled={!newOption.trim()}
              >
                Add
              </Button>
            </Space.Compact>
          </>
        )}
      >
        {options.map((opt, index) => (
          <Select.Option key={opt} value={opt} label={opt}>
            <Space
              style={{
                width: "100%",
                padding: "1px 6px",
                display: "flex",
                justifyContent: "space-between",
                gap: "6px",
              }}
            >
              <span>{opt}</span>
              <RQButton
                icon={<RiDeleteBin6Line />}
                type="transparent"
                size="small"
                onClick={(e) => handleDelete(index, e)}
              />
            </Space>
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
};

export default EnumSelect;
