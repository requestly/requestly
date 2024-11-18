import { Dropdown, Menu, Space } from "antd";
import { useCallback, useMemo, useState } from "react";
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { getIosSimulators } from "./deviceFetchers";
import { useDispatch, useSelector } from "react-redux";
import { getDesktopSpecificDetails } from "store/selectors";
import { actions } from "store";
import { RQButton } from "lib/design-system-v2/components";

export default function IosLaunchButton({ connectHandler, disconnectHandler }) {
  const dispatch = useDispatch();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const simulators = desktopSpecificDetails.appsList["ios-simulator"].metadata.devices;
  const isActive = desktopSpecificDetails.appsList["ios-simulator"].isActive;
  const [isFetching, setIsFetching] = useState(false);

  const handleReloadClicked = useCallback(() => {
    setIsFetching(true);
    getIosSimulators()
      .then((simulators) => {
        const runningSimulators = simulators.activeDevices;
        if (runningSimulators) {
          const updatedAppsList = { ...desktopSpecificDetails.appsList };
          updatedAppsList["ios-simulator"] = {
            ...updatedAppsList["ios-simulator"],
            metadata: {
              devices: runningSimulators ?? {},
            },
          };
          dispatch(actions.updateDesktopAppsList({ appsList: updatedAppsList }));
        }
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [desktopSpecificDetails.appsList, dispatch]);

  const menu = useMemo(() => {
    const items = [];

    if (Object.keys(simulators).length) {
      Object.values(simulators).forEach((simulator) => {
        items.push(
          <Menu.Item key={simulator.udid} disabled>
            {simulator.name}
          </Menu.Item>
        );
      });
    } else {
      items.push(
        <Menu.Item key="no-simulators" disabled>
          <div className="no-simulators-message">
            No running simulators found. Please start a simulator and click refresh.
          </div>
        </Menu.Item>
      );
    }

    items.push(
      <Menu.Divider key="divider" />,
      <Menu.Item key="reload" icon={<ReloadOutlined />} onClick={handleReloadClicked} disabled={isFetching || isActive}>
        {isActive ? "Disconnect to refresh list" : "Refresh list"}
      </Menu.Item>
    );

    return <Menu>{items}</Menu>;
  }, [simulators, handleReloadClicked, isFetching, isActive]);

  return Object.keys(simulators).length ? (
    <Space.Compact>
      {isActive ? (
        <RQButton type="default" className="danger-btn" onClick={disconnectHandler}>
          Disconnect All
        </RQButton>
      ) : (
        <RQButton type="default" onClick={connectHandler}>
          Connect All
        </RQButton>
      )}
      <Dropdown overlay={menu} trigger={["hover"]}>
        <RQButton type="default" icon={<InfoCircleOutlined />} className={isActive ? "danger-btn" : ""} />
      </Dropdown>
    </Space.Compact>
  ) : (
    <RQButton type="default" onClick={handleReloadClicked} disabled={isFetching}>
      {isFetching ? "Loading..." : "Scan Simulators"}
    </RQButton>
  );
}
