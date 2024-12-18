import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getDesktopSpecificAppDetails } from "store/selectors";

function IosBtn({ handleActivate, handleDeactivate }) {
  const iosAppDetails = useSelector((state) => getDesktopSpecificAppDetails(state, "ios-simulator"));
  const deviceNames = useMemo(() => {
    const devices = iosAppDetails.metadata?.devices || {};
    return Object.keys(devices).map((key) => devices[key].name);
  }, [iosAppDetails.metadata?.devices]);
  return (
    <Space.Compact>
      {iosAppDetails.isActive ? (
        <RQButton type="default" className="danger-btn" onClick={() => handleDeactivate("ios-simulator")}>
          Disconnect All
        </RQButton>
      ) : (
        <RQButton type="default" onClick={() => handleActivate("ios-simulator")}>
          Connect All
        </RQButton>
      )}
      <Tooltip title={deviceNames.join(", ")}>
        <RQButton type="default" icon={<InfoCircleOutlined />} className={iosAppDetails.isActive ? "danger-btn" : ""} />
      </Tooltip>
    </Space.Compact>
  );
}

export default IosBtn;
