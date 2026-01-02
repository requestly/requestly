import React from "react";
import { Dropdown, Checkbox } from "antd";
import { MdMoreHoriz } from "@react-icons/all-files/Md/MdMoreHoriz";
import { RQButton } from "lib/design-system-v2/components";

interface KeyValueTableSettingsDropdownProps {
  showDescription: boolean;
  onToggleDescription: (show: boolean) => void;
}

export const KeyValueTableSettingsDropdown: React.FC<KeyValueTableSettingsDropdownProps> = ({
  showDescription,
  onToggleDescription,
}) => {
  const items = [
    {
      key: "description",
      label: (
        <Checkbox
          checked={showDescription}
          onClick={(e) => e.stopPropagation()}
          className="items-center"
          onChange={(e) => {
            onToggleDescription(e.target.checked);
          }}
        >
          <span className="align-self-center">Description</span>
        </Checkbox>
      ),
    },
  ];

  return (
    <div className="key-value-settings-header">
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
        <RQButton type="transparent" size="small" icon={<MdMoreHoriz />} className="key-value-settings-icon" />
      </Dropdown>
    </div>
  );
};
