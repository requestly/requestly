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
import { ConsoleLog, NetworkLog, PageNavigationLog } from "./types";
import SessionPropertiesPanel from "./SessionPropertiesPanel";
import PageURLInfo from "./PageURLInfo";
import {
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingStartTimeOffset,
} from "store/features/session-recording/selectors";
import { useSelector } from "react-redux";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import { cloneDeep } from "lodash";
import { getConsoleLogs, getPageNavigationLogs } from "./sessionEventsUtils";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { RQButton } from "lib/design-system/components";
import { removeElement } from "utils/removeElement";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { trackSessionRecordingPanelTabClicked } from "modules/analytics/events/features/sessionRecording";
import "./sessionViewer.scss";

interface SessionDetailsProps {
  isInsideIframe?: boolean;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ isInsideIframe = false }) => {
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
  const [expandLogsPanel, setExpandLogsPanel] = useState(false);

  const pageNavigationLogs = useMemo<PageNavigationLog[]>(() => {
    const rrwebEvents = (events?.[RQSessionEventType.RRWEB] as RRWebEventData[]) || [];
    return getPageNavigationLogs(rrwebEvents, startTime);
  }, [events, startTime]);

  const consoleLogs = useMemo<ConsoleLog[]>(() => {
    const rrwebEvents = (events?.[RQSessionEventType.RRWEB] as RRWebEventData[]) || [];
    return getConsoleLogs(rrwebEvents, startTime);
  }, [events, startTime]);

  const networkLogs = useMemo<NetworkLog[]>(() => {
    const networkEvents = events?.[RQSessionEventType.NETWORK] || [];
    return networkEvents.map((networkEvent: NetworkEventData) => ({
      ...networkEvent,
      timeOffset: Math.floor((networkEvent.timestamp - startTime) / 1000),
    }));
  }, [events, startTime]);

  const getCurrentTimeOffset = useCallback(() => {
    return Math.floor((currentTimeRef.current - startTime) / 1000);
  }, [startTime]);

  useEffect(() => {
    if (!isAppOpenedInIframe()) return;

    removeElement(".session-viewer-header .back-button");
    removeElement(".session-properties-wrapper");

    setTimeout(() => {
      removeElement(".rr-controller__btns button:last-child");

      const rrwebPlayerContainer = document.querySelector(
        ".session-recording-player-container > .rr-player"
      ) as HTMLElement;

      if (rrwebPlayerContainer) rrwebPlayerContainer.style.border = "none";
    }, 0);
  }, []);

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
            // prevents elements inside rrweb-player to steal focus
            // The elements inside the player were stealing the focus from the inputs in the session viewer pages
            // The drawback is that it doesn't allow the focus styles to be applied: https://github.com/rrweb-io/rrweb/issues/876
            triggerFocus: false,
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
        children: <EnvironmentDetailsPanel environment={attributes?.environment} />,
      },
    ];

    return tabItems;
  }, [
    attributes?.environment,
    consoleLogs,
    networkLogs,
    playerTimeOffset,
    visibleConsoleLogsCount,
    visibleNetworkLogsCount,
  ]);

  return (
    <>
      <div className="session-properties-wrapper">
        <PageURLInfo sessionUrl={attributes?.url} logs={pageNavigationLogs} playerTimeOffset={playerTimeOffset} />
        {events?.rrweb?.length && attributes?.duration && (
          <Input
            readOnly
            addonBefore="Duration"
            value={msToHoursMinutesAndSeconds(attributes?.duration)}
            className="session-duration-property"
          />
        )}
        {attributes?.startTime && (
          <Input
            readOnly
            addonBefore="Recorded at"
            value={epochToDateAndTimeString(attributes?.startTime)}
            className="session-recorded-at-property"
          />
        )}
      </div>
      <div className="session-recording-player-row">
        <div className="session-recording-player-container" ref={playerContainer} />
        <SessionPropertiesPanel getCurrentTimeOffset={getCurrentTimeOffset} />
      </div>
      <ProCard
        className={`primary-card session-panels-container ${
          isInsideIframe ? `inside-iframe ${expandLogsPanel ? "expand-panels-container" : ""}` : ""
        }`}
      >
        <Tabs
          defaultActiveKey="consoleLogs"
          items={getSessionPanelTabs}
          tabBarExtraContent={{
            right: isInsideIframe ? (
              <RQButton
                iconOnly
                onClick={() => setExpandLogsPanel((prev) => !prev)}
                icon={<DownArrow style={{ transform: expandLogsPanel ? "none" : "rotate(180deg)" }} />}
              />
            ) : null,
          }}
          onTabClick={(key) => {
            setExpandLogsPanel(true);
            trackSessionRecordingPanelTabClicked(
              key,
              window.location.pathname.split("/")?.[2],
              isInsideIframe ? "embed" : "app"
            );
          }}
        />
      </ProCard>
    </>
  );
};

export default React.memo(SessionDetails);
