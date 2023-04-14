import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row, Space, Typography } from "antd";
import NetworkInspector from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/NetworkInspector";
import { RQButton } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { getDesktopSpecificDetails } from "store/selectors";
import { CheckCircleOutlined } from "@ant-design/icons";
import { actions } from "store";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import {
  trackAppConnectFailureEvent,
  trackAppConnectedEvent,
  trackAppDisconnectedEvent,
  trackConnectAppsClicked,
  trackSystemWideConnected,
} from "modules/analytics/events/desktopApp/apps";
import "./index.css";

const GroupByNone = ({ requestsLog, handleRowClick, emptyCtaText, emptyCtaAction, emptyDesc }) => {
  const dispatch = useDispatch();
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const { appsList } = desktopSpecificDetails;
  const systemWideSource = desktopSpecificDetails.appsList["system-wide"];

  const [numberOfConnectedApps, setNumberOfConnectedApps] = useState(0);

  useEffect(() => {
    setNumberOfConnectedApps(Object.values(appsList).filter((app) => app.isActive).length);
  }, [appsList, numberOfConnectedApps]);

  const connectSystemWide = useCallback(() => {
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("activate-app", {
      id: systemWideSource.id,
    })
      .then((res) => {
        if (res.success) {
          toast.success(`Connected ${systemWideSource.name}`);
          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: systemWideSource.id,
              property: "isActive",
              value: true,
            })
          );
          trackAppConnectedEvent(systemWideSource.name);
          trackSystemWideConnected("traffic_table");
        } else {
          toast.error(`Unable to activate ${systemWideSource.name}. Issue reported.`);
          trackAppConnectFailureEvent(systemWideSource.name);
        }
      })
      .catch(Logger.log);
  }, [dispatch, systemWideSource.id, systemWideSource.name]);

  const disconnectSystemWide = useCallback(() => {
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-app", {
      id: systemWideSource.id,
    })
      .then((res) => {
        // Notify user and update state
        if (res.success) {
          toast.info(`Disconnected ${systemWideSource.name}`);

          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: systemWideSource.id,
              property: "isActive",
              value: false,
            })
          );
          trackAppDisconnectedEvent(systemWideSource.name);
        } else {
          toast.error(`Unable to deactivate ${systemWideSource.name}. Issue reported.`);
        }
      })
      .catch((err) => Logger.log(err));
  }, [dispatch, systemWideSource.id, systemWideSource.name]);

  const openConnectedAppsModal = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "connectedAppsModal",
        newValue: true,
        newProps: {},
      })
    );
    trackConnectAppsClicked("traffic_table");
  }, [dispatch]);

  const renderEmptyTablePlaceholder = useCallback(() => {
    if (!systemWideSource.isAvailable) {
      return null;
    }

    if (systemWideSource.isActive) {
      return (
        <>
          <Typography.Text>Requestly is enabled to inspect all traffic from this device.</Typography.Text>
          <RQButton type="default" className="danger-btn" onClick={disconnectSystemWide}>
            Disconnect
          </RQButton>
        </>
      );
    }

    if (numberOfConnectedApps > 0) {
      return (
        <>
          <Typography.Text>
            {numberOfConnectedApps} app connected. All the intercepted network logs will be displayed here.
          </Typography.Text>
          <RQButton type="primary" onClick={openConnectedAppsModal}>
            Connect Another App
          </RQButton>
        </>
      );
    }

    return (
      <>
        <Typography.Text>Connect apps to start intercepting traffic</Typography.Text>
        <RQButton type="primary" onClick={openConnectedAppsModal}>
          Connect Apps
        </RQButton>
        <Typography.Text>Or</Typography.Text>
        <Typography.Text>Capture all the requests from this device</Typography.Text>
        <RQButton onClick={connectSystemWide} icon={<CheckCircleOutlined style={{ color: "#069D4F" }} />}>
          Enable Requestly system-wide
        </RQButton>
      </>
    );
  }, [
    connectSystemWide,
    disconnectSystemWide,
    numberOfConnectedApps,
    openConnectedAppsModal,
    systemWideSource.isActive,
    systemWideSource.isAvailable,
  ]);

  const renderNoTrafficCTA = () => {
    if (emptyCtaAction && emptyCtaText) {
      return (
        <>
          <Button type="primary" href={emptyCtaAction} target="_blank" style={{ margin: 8 }} size="small">
            {emptyCtaText}
          </Button>
          <p>{emptyDesc}</p>
        </>
      );
    }

    return (
      <Row className="empty-traffic-table-container" justify={"center"}>
        <Col>
          <Space direction="vertical" align="center">
            {renderEmptyTablePlaceholder()}
          </Space>
        </Col>
      </Row>
    );
  };

  if (requestsLog?.length === 0) {
    return renderNoTrafficCTA();
  }

  return (
    <NetworkInspector
      logs={requestsLog}
      onRow={(record) => {
        const { actions } = record;
        return {
          onClick: () => handleRowClick(record),
          style: actions.length !== 0 ? { background: "#13c2c280" } : {},
        };
      }}
    />
  );
};

export default GroupByNone;
