import { RRWebEventData, NetworkEventData, RQSessionEventType } from "@requestly/web-sdk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Replayer from "rrweb-player";
import { Badge, Input, Tabs } from "antd";
import "rrweb-player/dist/style.css";
import ProCard from "@ant-design/pro-card";
import ConsoleLogsPanel from "./ConsoleLogs/ConsoleLogsPanel";
import NetworkLogsPanel from "./NetworkLogs/NetworkLogsPanel";
import EnvironmentDetailsPanel from "./EnvironmentDetailsPanel";
import { ApiOutlined, CodeOutlined, ProfileOutlined } from "@ant-design/icons";
import { ConsoleLog, NetworkLog, PageNavigationLog, PlayerState } from "./types";
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
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { convertSessionRecordingNetworkLogsToRQNetworkLogs } from "./NetworkLogs/helpers";
import { trackSessionRecordingPanelTabClicked } from "modules/analytics/events/features/sessionRecording";
import { MdOutlineReplay10 } from "@react-icons/all-files/md/MdOutlineReplay10";
import { MdOutlineForward10 } from "@react-icons/all-files/md/MdOutlineForward10";
import "./sessionViewer.scss";
import PlayerFrameOverlay from "./PlayerOverlay";

interface SessionDetailsProps {
  isInsideIframe?: boolean;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ isInsideIframe = false }) => {
  const attributes = useSelector(getSessionRecordingAttributes);
  const events = useSelector(getSessionRecordingEvents);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const startTime = attributes?.startTime;

  const playerContainer = useRef<HTMLDivElement>();
  const currentTimeRef = useRef<number>(0);
  const offsetTimeRef = useRef<number>(startTimeOffset ?? 0);

  const [player, setPlayer] = useState<Replayer>();
  const [playerTimeOffset, setPlayerTimeOffset] = useState<number>(0); // in seconds
  const [visibleConsoleLogsCount, setVisibleConsoleLogsCount] = useState(0);
  const [expandLogsPanel, setExpandLogsPanel] = useState(false);
  const [RQControllerButtonContainer, setRQControllerButtonContainer] = useState<Element>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.PLAYING);
  const [isSkipping, setIsSkipping] = useState<boolean>(false);

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

  const rqNetworkLogs = useMemo(() => convertSessionRecordingNetworkLogsToRQNetworkLogs(networkLogs), [networkLogs]);

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
            inactiveColor: "#B4B4B4",
          },
        })
      );
    }
  }, [events]);

  useEffect(() => {
    if (playerContainer.current && player) {
      const controllerButtonContainer = document.createElement("div");
      controllerButtonContainer.id = "rq-controller-btns";

      const rr_controller__btns = playerContainer.current.querySelector(".rr-controller__btns");
      setRQControllerButtonContainer(
        rr_controller__btns.children[0].insertAdjacentElement("afterend", controllerButtonContainer)
      );
    }
  }, [player]);

  useEffect(() => {
    const pauseVideo = () => {
      player?.pause();
    };

    // no rrweb listener on the player works when focus is shifted from the tab
    // The player keeps playing even when the tab is not in focus.
    // so we add a listener on the window to pause the player when the tab is blurred
    window.addEventListener("blur", pauseVideo);

    return () => {
      // @ts-ignore
      player?.$destroy(); // destroy player on unmount
      window.removeEventListener("blur", pauseVideo);
    };
  }, [player]);

  useEffect(() => {
    player?.addEventListener("ui-update-current-time", ({ payload }) => {
      currentTimeRef.current = startTime + payload;
      setPlayerTimeOffset(payload / 1000); // millis -> secs
    });

    player?.addEventListener("start", () => {
      if (isSkipping) {
        setPlayerState(PlayerState.SKIPPING);
      } else {
        setPlayerState(PlayerState.PLAYING);
      }
    });

    player?.addEventListener("pause", () => {
      if (isSkipping) {
        setPlayerState(PlayerState.SKIPPING);
      } else {
        setPlayerState(PlayerState.PAUSED);
      }
    });

    player?.addEventListener("skip-start", () => {
      setPlayerState(PlayerState.SKIPPING);
      setIsSkipping(true);
    });

    player?.addEventListener("skip-end", () => {
      setPlayerState(PlayerState.PLAYING);
      setIsSkipping(false);
    });
  }, [isSkipping, player, startTime]);

  useEffect(() => {
    if (!player) {
      return;
    }

    // player should start playing from the start time offset only on the
    // first load and not when the user changes time offset.
    player.goto(offsetTimeRef.current * 1000, true);
  }, [player]);

  useEffect(() => {
    const togglePlay = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        player?.toggle();
      }
    };

    document.addEventListener("keydown", togglePlay);
    return () => {
      document.removeEventListener("keydown", togglePlay);
    };
  }, [player]);

  const customControllerButtons = useMemo(
    () => [
      {
        icon: <MdOutlineReplay10 />,
        onClick: () => {
          if (playerTimeOffset > 10) {
            player.goto((playerTimeOffset - 10) * 1000);
          } else {
            player.goto(0);
          }
          setIsSkipping(false);
        },
      },
      {
        icon: <MdOutlineForward10 />,
        onClick: () => {
          if ((playerTimeOffset + 10) * 1000 < attributes?.duration) {
            player.goto((playerTimeOffset + 10) * 1000);
          } else {
            player.goto(attributes?.duration);
          }
          setIsSkipping(false);
        },
      },
    ],
    [attributes?.duration, player, playerTimeOffset]
  );

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
            <Badge size="small" count={networkLogs.length || undefined} style={{ margin: "0 5px" }} />
          </span>
        ),
        children: (
          <NetworkLogsPanel
            startTime={attributes?.startTime ?? 0}
            networkLogs={rqNetworkLogs}
            playerTimeOffset={playerTimeOffset}
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
    attributes?.startTime,
    consoleLogs,
    rqNetworkLogs,
    playerTimeOffset,
    visibleConsoleLogsCount,
    networkLogs.length,
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
        {RQControllerButtonContainer &&
          createPortal(
            customControllerButtons.map((button) => (
              <span className="rq-controller-button" onClick={button.onClick}>
                {button.icon}
              </span>
            )),
            RQControllerButtonContainer
          )}
        <PlayerFrameOverlay playerContainer={playerContainer.current} playerState={playerState} />
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
