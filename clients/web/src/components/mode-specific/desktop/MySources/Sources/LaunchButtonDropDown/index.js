import { useCallback, useMemo, useState } from "react";
import { Button, Dropdown, Input, Menu, Row, Space } from "antd";
import { CUSTOM_LAUNCH_OPTIONS } from "./launchConstants";
import { BiDotsVerticalRounded } from "@react-icons/all-files/bi/BiDotsVerticalRounded";
import { RQButton } from "lib/design-system/components";
import {
  trackCancelledCustomArgsLaunch,
  trackCustomLaunchOptionSelected,
} from "modules/analytics/events/desktopApp/apps";
import "./index.css";

const LaunchButtonDropdown = ({ appId, isScanned, isAvailable, onActivateAppClick: handleActivateAppClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLaunchArgsInput, setShowLaunchArgsInput] = useState(false);
  const [launchArgsStrInput, setLaunchArgsStrInput] = useState("");

  const handleDropdownVisibleChange = useCallback((isVisible) => {
    if (isVisible) {
      setShowLaunchArgsInput(false);
      setLaunchArgsStrInput("");
    }
    setShowDropdown(isVisible);
  }, []);

  const parsedLaunchArgs = useMemo(() => {
    /* EXPECTS ALL ARGS TO BE SPACE SEPARATED, and no space in arg input */
    const args = launchArgsStrInput.split(" ").filter((arg) => arg);
    const parsedArgs = {};
    args.forEach((arg) => {
      const [key, value] = arg.split("=");
      const parsedKey = key.replace(/^--/, "");
      const parsedValue = value ?? null;
      parsedArgs[parsedKey] = parsedValue;
    });
    return parsedArgs;
  }, [launchArgsStrInput]);

  const dropdownOverlay = (
    <Menu className="launch-options-dropdown-menu">
      <div>
        {showLaunchArgsInput && (
          <div className="launch-options-dropdown-input-container">
            <div className="text-gray launch-options-input-title">Custom arguments</div>
            <Input
              placeholder="--arg1=value1 --arg2 --arg3=value2"
              allowClear
              enterButton="Launch"
              onChange={(e) => setLaunchArgsStrInput(e.target.value)}
              onSearch={(value) => {
                setLaunchArgsStrInput(value);
                handleActivateAppClick(appId, { launchOptions: parsedLaunchArgs });
              }}
              className="launch-options-dropdown-input"
            />
            <Row align="middle">
              <div className="ml-auto launch-options-dropdown-actions">
                <Button
                  size="small"
                  onClick={() => {
                    trackCancelledCustomArgsLaunch(appId);
                    handleDropdownVisibleChange(false);
                  }}
                  className="launch-options-dropdown-cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleActivateAppClick(appId, { launchOptions: parsedLaunchArgs })}
                  disabled={!launchArgsStrInput}
                >
                  Launch
                </Button>
              </div>
            </Row>
          </div>
        )}
      </div>
      {!showLaunchArgsInput && (
        <div className="launch-options-menu-container">
          <Menu.Item
            key="unsafe-mode"
            className="launch-options-menu-item"
            onClick={() => {
              trackCustomLaunchOptionSelected(appId, "unsafe-mode");
              handleActivateAppClick(appId, { launchOptions: CUSTOM_LAUNCH_OPTIONS["unsafe-mode"] });
            }}
          >
            <span>Without Safety Checks</span>
          </Menu.Item>
          <Menu.Item
            key="no-cors"
            className="launch-options-menu-item"
            onClick={() => {
              trackCustomLaunchOptionSelected(appId, "no-cors");
              handleActivateAppClick(appId, { launchOptions: CUSTOM_LAUNCH_OPTIONS["no-cors"] });
            }}
          >
            <span>Without CORS</span>
          </Menu.Item>
          <Menu.Item
            key="custom-args"
            className="launch-options-menu-item"
            onClick={() => {
              trackCustomLaunchOptionSelected(appId, "custom-args");
              setShowLaunchArgsInput(true);
            }}
          >
            <span>With Custom Arguments</span>
          </Menu.Item>
        </div>
      )}
    </Menu>
  );
  return (
    <div className="launch-options-container">
      <Space.Compact>
        <RQButton
          // menu={launchMenuItems}
          type="default"
          onClick={() => {
            handleActivateAppClick(appId);
            setShowDropdown(false);
          }}
          loading={!isScanned || !isAvailable} // todo
          disabled={!isScanned || !isAvailable}
          className="launch-button-with-dropdown"
        >
          {appId.includes("existing") ? "Open" : "Launch"}
        </RQButton>
        <Dropdown
          open={showDropdown}
          overlay={dropdownOverlay}
          onOpenChange={handleDropdownVisibleChange}
          trigger={["contextMenu"]}
        >
          <RQButton
            icon={<BiDotsVerticalRounded />}
            onClick={useCallback(() => handleDropdownVisibleChange(!showDropdown), [
              handleDropdownVisibleChange,
              showDropdown,
            ])}
            type="default"
          />
        </Dropdown>
      </Space.Compact>
    </div>
  );
};

export default LaunchButtonDropdown;
