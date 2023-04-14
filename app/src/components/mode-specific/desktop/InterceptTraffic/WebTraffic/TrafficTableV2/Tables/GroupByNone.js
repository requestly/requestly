import React from "react";
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
  const source = desktopSpecificDetails.appsList["system-wide"];
  const { id: appId, name: appName } = source;

  const connectSystemWide = () => {
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("activate-app", {
      id: appId,
    })
      .then((res) => {
        if (res.success) {
          toast.success(`Connected ${appName}`);
          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: appId,
              property: "isActive",
              value: true,
            })
          );
          trackAppConnectedEvent(appName);
          trackSystemWideConnected("traffic_table");
        } else {
          toast.error(`Unable to activate ${appName}. Issue reported.`);
          trackAppConnectFailureEvent(appName);
        }
      })
      .catch(Logger.log);
  };

  const disconnectSystemWide = () => {
    if (!window.RQ || !window.RQ.DESKTOP) return;

    window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("deactivate-app", {
      id: appId,
    })
      .then((res) => {
        // Notify user and update state
        if (res.success) {
          toast.info(`Disconnected ${appName}`);

          dispatch(
            actions.updateDesktopSpecificAppProperty({
              appId: appId,
              property: "isActive",
              value: false,
            })
          );
          trackAppDisconnectedEvent(appName);
        } else {
          toast.error(`Unable to deactivate ${appName}. Issue reported.`);
        }
      })
      .catch((err) => Logger.log(err));
  };

  const renderInterceptSystemWideSourceToggle = () => {
    if (!source.isAvailable) {
      return null;
    }

    return (
      <>
        {source.isActive ? (
          <>
            <Typography.Text>Requestly is enabled to inspect all traffic from this device.</Typography.Text>
            <RQButton type="default" className="danger-btn" onClick={disconnectSystemWide}>
              Disconnect
            </RQButton>
          </>
        ) : (
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
        )}
      </>
    );
  };

  const openConnectedAppsModal = () => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "connectedAppsModal",
        newValue: true,
        newProps: {},
      })
    );
    trackConnectAppsClicked("traffic_table");
  };

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
            {renderInterceptSystemWideSourceToggle()}
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
