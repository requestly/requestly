import { RRWebEventData, NetworkEventData, RQSessionEventType } from "@requestly/web-sdk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Replayer from "rrweb-player";
import { Badge, Input, Tabs } from "antd";
import "rrweb-player/dist/style.css";
import ProCard from "@ant-design/pro-card";
import ConsoleLogsPanel from "./ConsoleLogs/ConsoleLogsPanel";
import NetworkLogsPanel from "./NetworkLogs/NetworkLogsPanel";
import EnvironmentDetailsPanel from "./EnvironmentDetailsPanel";
import { ApiOutlined, CodeOutlined, ProfileOutlined } from "@ant-design/icons";
import { ConsoleLog, NetworkLog } from "./types";
import SessionPropertiesPanel from "./SessionPropertiesPanel";
import CopyButton from "components/misc/CopyButton";
import {
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingStartTimeOffset,
} from "store/features/session-recording/selectors";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import { getConsoleLogs } from "./sessionEventsUtils";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { trackSessionRecordingPanelTabClicked } from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

const SessionDetails: React.FC = () => {
  const attributes = useSelector(getSessionRecordingAttributes);
  const events = useSelector(getSessionRecordingEvents);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const startTime = attributes?.startTime;

  const [player, setPlayer] = useState<Replayer>();
  const playerContainer = useRef<HTMLDivElement>();
  const currentTimeRef = useRef<number>(0);
  const [playerTimeOffset, setPlayerTimeOffset] = useState<number>(0); // in seconds
  const [visibleNetworkLogsCount, setVisibleNetworkLogsCount] = useState(0);
  const [visibleConsoleLogsCount, setVisibleConsoleLogsCount] = useState(0);

  const consoleLogs = useMemo<ConsoleLog[]>(() => {
    const rrwebEvents = events[RQSessionEventType.RRWEB] as RRWebEventData[];
    return getConsoleLogs(rrwebEvents, startTime);
  }, [events, startTime]);

  const networkLogs = useMemo<NetworkLog[]>(() => {
    const networkEvents = events[RQSessionEventType.NETWORK] || [];
    return networkEvents.map((networkEvent: NetworkEventData) => ({
      ...networkEvent,
      timeOffset: Math.floor((networkEvent.timestamp - startTime) / 1000),
    }));
  }, [events, startTime]);

  const getCurrentTimeOffset = useCallback(() => {
    return Math.floor((currentTimeRef.current - startTime) / 1000);
  }, [startTime]);

  useEffect(() => {
    if (events?.rrweb?.length) {
      // rrweb mutates events object whereas redux does not allow mutating state, so cloning.
      const rrwebEvents = cloneDeep(events[RQSessionEventType.RRWEB] as RRWebEventData[]);

      setPlayer(
        new Replayer({
          target: playerContainer.current,
          props: {
            events: rrwebEvents,
            width: playerContainer.current.clientWidth,
            height: 400,
            autoPlay: true,
          },
        })
      );
    }
  }, [events]);

  // destroy player on unmount
  useEffect(
    () => () => {
      // @ts-ignore
      player?.$destroy();
    },
    [player]
  );

  useEffect(() => {
    player?.addEventListener("ui-update-current-time", ({ payload }) => {
      currentTimeRef.current = startTime + payload;
      setPlayerTimeOffset(Math.ceil(payload / 1000)); // millis -> secs
    });
  }, [player, startTime]);

  useEffect(() => {
    if (!player) {
      return;
    }

    player.goto(startTimeOffset * 1000, true);
  }, [player, startTimeOffset]);

  const getSessionPanelTabs = useMemo(() => {
    const tabItems = [
      {
        key: "consoleLogs",
        label: (
          <span>
            <CodeOutlined style={{ marginRight: "5px" }} />
            Console
            <Badge
              size="small"
              count={visibleConsoleLogsCount || undefined}
              dot={visibleConsoleLogsCount === 0 && consoleLogs.length > 0}
              style={{ margin: "0 5px" }}
            />
          </span>
        ),
        children: (
          <ConsoleLogsPanel
            consoleLogs={consoleLogs}
            playerTimeOffset={playerTimeOffset}
            updateCount={setVisibleConsoleLogsCount}
          />
        ),
      },
      {
        key: "networkLogs",
        label: (
          <span>
            <ApiOutlined style={{ marginRight: "5px" }} />
            Network
            <Badge
              size="small"
              count={visibleNetworkLogsCount || undefined}
              dot={visibleNetworkLogsCount === 0 && networkLogs.length > 0}
              style={{ margin: "0 5px" }}
            />
          </span>
        ),
        children: (
          <NetworkLogsPanel
            networkLogs={networkLogs}
            playerTimeOffset={playerTimeOffset}
            updateCount={setVisibleNetworkLogsCount}
          />
        ),
      },
      {
        key: "environment",
        label: (
          <span>
            <ProfileOutlined style={{ marginRight: "5px" }} />
            Environment
          </span>
        ),
        children: <EnvironmentDetailsPanel environment={attributes.environment} />,
      },
    ];

    return tabItems;
  }, [
    attributes.environment,
    consoleLogs,
    networkLogs,
    playerTimeOffset,
    visibleConsoleLogsCount,
    visibleNetworkLogsCount,
  ]);

  return (
    <>
      <div className="session-properties-wrapper">
        <Input
          readOnly
          addonBefore="Page URL"
          value={attributes?.url}
          className="session-page-url-property"
          suffix={<CopyButton showIcon={true} copyText={attributes?.url} title="" />}
        />
        <Input
          readOnly
          addonBefore="Duration"
          value={msToHoursMinutesAndSeconds(attributes?.duration)}
          className="session-duration-property"
        />
        <Input
          readOnly
          addonBefore="Recorded at"
          value={epochToDateAndTimeString(attributes?.startTime)}
          className="session-recorded-at-property"
        />
      </div>
      <div className="session-recording-player-row">
        <div className="session-recording-player-container" ref={playerContainer} />
        <SessionPropertiesPanel getCurrentTimeOffset={getCurrentTimeOffset} />
      </div>
      <ProCard className="primary-card session-panels-container">
        <Tabs
          defaultActiveKey="consoleLogs"
          items={getSessionPanelTabs}
          onTabClick={(key) => {
            trackSessionRecordingPanelTabClicked(key, window.location.pathname.split("/")?.[2]);
          }}
        />
      </ProCard>
    </>
  );
};

export default React.memo(SessionDetails);
