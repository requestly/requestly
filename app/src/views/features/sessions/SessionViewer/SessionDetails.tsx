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
import DownArrow from "assets/icons/down-arrow.svg?react";
import { cloneDeep } from "lodash";
import { getConsoleLogs, getInactiveSegments, getPageNavigationLogs } from "./sessionEventsUtils";
import { epochToDateAndTimeString, msToHoursMinutesAndSeconds } from "utils/DateTimeUtils";
import { RQButton } from "lib/design-system/components";
import { removeElement } from "utils/domUtils";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { convertSessionRecordingNetworkLogsToRQNetworkLogs } from "./NetworkLogs/helpers";
import { trackSessionRecordingPanelTabClicked } from "modules/analytics/events/features/sessionRecording";
import { MdOutlineReplay10 } from "@react-icons/all-files/md/MdOutlineReplay10";
import { MdOutlineForward10 } from "@react-icons/all-files/md/MdOutlineForward10";
import PlayerFrameOverlay from "./PlayerOverlay";
import "./sessionViewer.scss";

interface SessionDetailsProps {
  isInsideIframe?: boolean;
  isMobileView?: boolean;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ isInsideIframe = false, isMobileView = false }) => {
  const attributes = useSelector(getSessionRecordingAttributes);
  const events = useSelector(getSessionRecordingEvents);
  const startTimeOffset = useSelector(getSessionRecordingStartTimeOffset);
  const startTime = attributes?.startTime;

  const playerContainer = useRef<HTMLDivElement>();
  const currentTimeRef = useRef<number>(0);
  const offsetTimeRef = useRef<number>(startTimeOffset ?? 0);
  const isPlayerSkippingInactivity = useRef(false);
  const skipInactiveSegments = useRef(true);

  const [player, setPlayer] = useState<Replayer>();
  const [playerTimeOffset, setPlayerTimeOffset] = useState<number>(0); // in seconds
  const [expandLogsPanel, setExpandLogsPanel] = useState(false);
  const [RQControllerButtonContainer, setRQControllerButtonContainer] = useState<Element>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.PLAYING);

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

  const inactiveSegments = useMemo(() => getInactiveSegments(events[RQSessionEventType.RRWEB] as RRWebEventData[]), [
    events,
  ]);

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

      const rrSkipInactiveToggleHandler = (e: InputEvent) => {
        skipInactiveSegments.current = (e.target as HTMLInputElement).checked;
      };

      const rrSkipInactiveToggle = rr_controller__btns?.querySelector(".switch #skip");
      rrSkipInactiveToggle?.addEventListener("change", rrSkipInactiveToggleHandler);
      return () => {
        rrSkipInactiveToggle?.removeEventListener("change", rrSkipInactiveToggleHandler);
      };
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

  const skippingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const resetPlayerSkippingState = () => {
    clearTimeout(skippingTimeoutRef.current);
    setPlayerState(PlayerState.PLAYING);
    isPlayerSkippingInactivity.current = false;
    skippingTimeoutRef.current = null;
  };

  const updateCurrentTimeHandler = useCallback(
    ({ payload: currentPlayerTime }: { payload: number }) => {
      const currentTime = startTime + currentPlayerTime;
      currentTimeRef.current = currentTime;
      setPlayerTimeOffset(currentPlayerTime / 1000); // millis -> secs

      if (!skipInactiveSegments.current) return;

      const skipEvent = inactiveSegments?.find(([startTime, endTime]) => {
        return currentTime >= startTime && currentTime < endTime - 2000;
      });

      if (!isPlayerSkippingInactivity.current) {
        if (skipEvent) {
          setPlayerState(PlayerState.SKIPPING);
          isPlayerSkippingInactivity.current = true;
          skippingTimeoutRef.current = setTimeout(() => {
            player.goto(skipEvent[1] - startTime - 2000);
            resetPlayerSkippingState();
          }, 2000);
        }
      } else {
        if (!skipEvent) {
          resetPlayerSkippingState();
        }
      }
    },
    [inactiveSegments, player, startTime]
  );

  const playerStateChangeHandler = useCallback((event: { payload: PlayerState }) => {
    if (isPlayerSkippingInactivity.current) {
      setPlayerState(PlayerState.SKIPPING);
    } else {
      setPlayerState(event.payload);
    }
  }, []);

  useEffect(() => {
    if (!player) return;

    player?.addEventListener("ui-update-current-time", updateCurrentTimeHandler);
    player?.addEventListener("ui-update-player-state", playerStateChangeHandler);
  }, [player, playerStateChangeHandler, updateCurrentTimeHandler]);

  useEffect(() => {
    if (!player) {
      return;
    }

    // player should start playing from the start time offset only on the
    // first load and not when the user changes time offset.
    player?.goto(offsetTimeRef.current * 1000, true);
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
              count={consoleLogs.length || undefined}
              dot={consoleLogs.length === 0 && consoleLogs.length > 0}
              style={{ margin: "0 5px" }}
            />
          </span>
        ),
        children: <ConsoleLogsPanel consoleLogs={consoleLogs} playerTimeOffset={playerTimeOffset} />,
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
    networkLogs.length,
  ]);

  return (
    <>
      <div className="session-properties-wrapper">
        <PageURLInfo sessionUrl={attributes?.url} logs={pageNavigationLogs} playerTimeOffset={playerTimeOffset} />
        {events?.rrweb?.length && attributes?.duration && !isMobileView && (
          <Input
            readOnly
            addonBefore="Duration"
            value={msToHoursMinutesAndSeconds(attributes?.duration)}
            className="session-duration-property"
          />
        )}
        {attributes?.startTime && !isMobileView && (
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
        <SessionPropertiesPanel getCurrentTimeOffset={getCurrentTimeOffset} isMobileView={isMobileView} />
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
