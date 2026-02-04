import React from "react";
import { Dropdown } from "antd";

import useEnvironmentSwitcher from "../hooks/useEnvironmentSwitcher";

const EnvironmentSwitcher: React.FC = () => {
  const { isDropdownOpen, setIsDropdownOpen } = useEnvironmentSwitcher();
  return (
    // <Dropdown
    //   overlayClassName="environment-switcher-dropdown"
    //   trigger={["click"]}
    //   // menu={{ items: dropdownItems }}
    //   open={isDropdownOpen}
    //   onOpenChange={setIsDropdownOpen}
    // ></Dropdown>
    <div>Environment Switcher Placeholder</div>
  );
};

export default EnvironmentSwitcher;
