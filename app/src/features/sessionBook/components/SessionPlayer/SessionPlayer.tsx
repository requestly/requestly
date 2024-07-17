import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingAttributes, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import Replayer from "rrweb-player";
import { cloneDeep } from "lodash";
import { MdOutlinePlayCircle } from "@react-icons/all-files/md/MdOutlinePlayCircle";
import { MdPauseCircleOutline } from "@react-icons/all-files/md/MdPauseCircleOutline";
import { RiReplay10Fill } from "@react-icons/all-files/ri/RiReplay10Fill";
import { RiForward10Fill } from "@react-icons/all-files/ri/RiForward10Fill";
import { MdFullscreen } from "@react-icons/all-files/md/MdFullscreen";
import { RQButton } from "lib/design-system/components";
import { Select, Switch } from "antd";
import { PlayerState } from "features/sessionBook/types";
import { getInactiveSegments } from "views/features/sessions/SessionViewer/sessionEventsUtils";
import { msToMinutesAndSeconds } from "utils/DateTimeUtils";
import "./sessionPlayer.scss";
import { useTheme } from "styled-components";

interface SessionPlayerProps {
  onPlayerTimeOffsetChange: (timeOffset: number) => void;
}

export const SessionPlayer: React.FC<SessionPlayerProps> = ({ onPlayerTimeOffsetChange }) => {
  const events = useSelector(getSessionRecordingEvents);
  const attributes = useSelector(getSessionRecordingAttributes);
  const startTime = attributes?.startTime;

  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.PLAYING);
  const [playerTimeOffset, setPlayerTimeOffset] = useState(0);
  const [isSkipInactiveEnabled, setIsSkipInactiveEnabled] = useState(true);

  const theme = useTheme();

  const playerContainer = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(0);
  const isPlayerSkippingInactivity = useRef(false);
  const skipInactiveSegments = useRef(true);
  const skippingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const inactiveSegments = useMemo(() => {
    if (events) {
      return getInactiveSegments(events[RQSessionEventType.RRWEB] as RRWebEventData[]);
    } else return [];
  }, [events]);

  const playerStateChangeHandler = useCallback((event: { payload: PlayerState }) => {
    if (isPlayerSkippingInactivity.current) {
      setPlayerState(PlayerState.SKIPPING);
    } else {
      setPlayerState(event.payload);
    }
  }, []);

  const resetPlayerSkippingState = useCallback(() => {
    clearTimeout(skippingTimeoutRef.current);
    setPlayerState(PlayerState.PLAYING);
    isPlayerSkippingInactivity.current = false;
    skippingTimeoutRef.current = null;
  }, []);

  const updateCurrentTimeHandler = useCallback(
    ({ payload: currentPlayerTime }: { payload: number }) => {
      const currentTime = startTime + currentPlayerTime;
      currentTimeRef.current = currentTime;
      setPlayerTimeOffset(currentPlayerTime / 1000); // millis -> secs
      onPlayerTimeOffsetChange(currentPlayerTime / 1000);

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
    [startTime, inactiveSegments, player, resetPlayerSkippingState, skipInactiveSegments, onPlayerTimeOffsetChange]
  );

  useEffect(() => {
    if (events?.rrweb?.length && !player) {
      // rrweb mutates events object whereas redux does not allow mutating state, so cloning.
      const rrwebEvents = cloneDeep(events[RQSessionEventType.RRWEB] as RRWebEventData[]);

      setPlayer(
        new Replayer({
          target: playerContainer.current,
          props: {
            events: rrwebEvents,
            // width: playerContainer.current.clientWidth,
            autoPlay: true,
            // prevents elements inside rrweb-player to steal focus
            // The elements inside the player were stealing the focus from the inputs in the session viewer pages
            // The drawback is that it doesn't allow the focus styles to be applied: https://github.com/rrweb-io/rrweb/issues/876
            triggerFocus: false,
            inactiveColor: "#B4B4B4",
            skipInactive: true,
          },
        })
      );
    }
  }, [events, player]);

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
    if (!player) return;

    player?.addEventListener("ui-update-current-time", updateCurrentTimeHandler);
    player?.addEventListener("ui-update-player-state", playerStateChangeHandler);
  }, [player, playerStateChangeHandler, updateCurrentTimeHandler]);

  const handleSessionPausePlayBtnClick = useCallback(() => {
    if (playerState === PlayerState.PLAYING) {
      player?.pause();
    } else {
      player?.play();
    }
  }, [player, playerState]);

  const handleJumpForward = useCallback(() => {
    if ((playerTimeOffset + 10) * 1000 < attributes?.duration) {
      player.goto((playerTimeOffset + 10) * 1000);
    } else {
      player.goto(attributes?.duration);
    }
  }, [player, attributes?.duration, playerTimeOffset]);

  const handleJumpBackward = useCallback(() => {
    if (playerTimeOffset > 10) {
      player?.goto((playerTimeOffset - 10) * 1000);
    } else {
      player?.goto(0);
    }
  }, [player, playerTimeOffset]);

  const handlePlayerSpeedChange = (speed: number) => {
    player?.setSpeed(speed);
  };

  const handleChangeSkipInactive = useCallback(
    (checked: boolean) => {
      setIsSkipInactiveEnabled(checked);
      skipInactiveSegments.current = checked;
      player?.toggleSkipInactive();
    },
    [player]
  );

  return (
    <div className="session-player-container">
      <div ref={playerContainer} className="session-player"></div>
      <div className="session-player-controller">
        <div className="session-status-container">
          <RQButton
            onClick={handleSessionPausePlayBtnClick}
            className="session-player-controller__btn session-pause-play-btn"
            iconOnly
            icon={playerState === PlayerState.PAUSED ? <MdOutlinePlayCircle /> : <MdPauseCircleOutline />}
          />
          <div className="session-player-duration-tracker">
            {msToMinutesAndSeconds(playerTimeOffset * 1000 || 0)}/ {msToMinutesAndSeconds(attributes?.duration || 0)}
          </div>
        </div>
        <div className="session-player-jump-controllers">
          <RQButton
            className="session-player-controller__btn"
            iconOnly
            icon={<RiReplay10Fill />}
            onClick={handleJumpBackward}
          />
          <RQButton
            className="session-player-controller__btn "
            iconOnly
            icon={<RiForward10Fill />}
            onClick={handleJumpForward}
          />
        </div>
        <div>
          <Select
            dropdownStyle={{
              background: theme?.colors?.black,
            }}
            className="session-player-controller__speed-selector"
            defaultValue={1}
            style={{ width: 60 }}
            options={[
              { value: 1, label: "1x" },
              { value: 2, label: "2x" },
              { value: 4, label: "4x" },
              { value: 8, label: "8x" },
            ]}
            onChange={handlePlayerSpeedChange}
          />
        </div>
        <div className="session-player-skip-controller">
          <Switch size="small" checked={isSkipInactiveEnabled} onChange={handleChangeSkipInactive} />{" "}
          <span>Skip inactive</span>
        </div>
        <div className="flex-1 session-player-fullscreen-controller-container">
          {/* TODO: add full screen action */}
          <RQButton className="session-player-controller__btn " iconOnly icon={<MdFullscreen />} />
        </div>
      </div>
    </div>
  );
};
