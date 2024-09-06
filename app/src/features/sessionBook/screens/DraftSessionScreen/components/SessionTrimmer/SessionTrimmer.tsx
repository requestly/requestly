import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingEvents } from "store/features/session-recording/selectors";
import "./sessionTrimmer.scss";
import { EventType, eventWithTime } from "rrweb";
import { fullSnapshotEvent, IncrementalSource } from "@rrweb/types";
import { NetworkEventData, RQSessionEventType } from "@requestly/web-sdk";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { partition } from "lodash";
import { TrimHandle } from "./components/TrimHandle/TrimHandle";
import { msToMinutesAndSeconds } from "utils/DateTimeUtils";
import { useDebounce } from "hooks/useDebounce";

interface SessionTrimmerProps {
  duration: number;
  sessionStartTime: number;
  player: unknown;
}

export const SessionTrimmer: React.FC<SessionTrimmerProps> = ({ duration, sessionStartTime, player }) => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSessionTrimmed, setIsSessionTrimmed] = useState(false);
  const events = useSelector(getSessionRecordingEvents);

  const trimSessionEvents = useCallback(() => {
    const sessionEvents = events[RQSessionEventType.RRWEB] as eventWithTime[];
    const networkEvents = events[RQSessionEventType.NETWORK] as NetworkEventData[];

    const sessionStartTimeFromEpoch = sessionStartTime;
    const newStartTime = sessionStartTimeFromEpoch + startTime;
    const newEndTime = sessionStartTimeFromEpoch + endTime;

    const [beforeStartCut, afterStartCut] = partition(sessionEvents, (event) => event.timestamp < newStartTime);
    const trimmedRRWebEvents = afterStartCut.filter((event) => event.timestamp <= newEndTime);

    const snapshots = beforeStartCut.filter(
      (event) => event.timestamp < newStartTime && event.type === EventType.FullSnapshot
    );
    const lastSnapshot = snapshots[snapshots.length - 1] as (fullSnapshotEvent & { timestamp: number }) | null;
    const lastSnapshotTimestamp = lastSnapshot?.timestamp ?? 0;

    const getEventsBy = (predicate: (event: eventWithTime) => boolean) =>
      beforeStartCut.filter((event) => event.timestamp >= lastSnapshotTimestamp && predicate(event));

    const discardedScrolls = getEventsBy(
      (event) => event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.Scroll
    )
      .reduce<Map<number, eventWithTime>>((map, event) => {
        if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.Scroll) {
          map.set(event.data.id, event);
        }
        return map;
      }, new Map())
      .values();

    const beforeCutExcludingScrolls = getEventsBy(
      (event) =>
        !(event.type === EventType.IncrementalSnapshot && [IncrementalSource.Scroll].includes(event.data.source))
    );

    // Type 4 event is required to be at the start of session's rrweb events
    const metaEvents = beforeStartCut.filter((event) => event.type === EventType.Meta);
    const lastMetaEvent = metaEvents[metaEvents.length - 1];

    const finalTrimmedRRWebEvents = [
      { ...lastMetaEvent, timestamp: newStartTime - 500 },
      { ...lastSnapshot!, timestamp: newStartTime - 500 },
      ...Array.from(discardedScrolls)
        .concat(beforeCutExcludingScrolls)
        .map((event) => ({ ...event, timestamp: newStartTime })),
      ...trimmedRRWebEvents,
    ];

    const trimmedNetworkLogs = networkEvents.filter(
      (event) => event.timestamp >= newStartTime && event.timestamp <= newEndTime
    );

    return {
      duration: endTime - startTime,
      events: {
        [RQSessionEventType.RRWEB]: finalTrimmedRRWebEvents,
        [RQSessionEventType.NETWORK]: trimmedNetworkLogs,
        [RQSessionEventType.STORAGE]: events[RQSessionEventType.STORAGE],
      },
    };
  }, [startTime, endTime, events, sessionStartTime]);

  const handleTrim = useCallback(() => {
    const trimmedData = trimSessionEvents();
    dispatch(sessionRecordingActions.setTrimmedSessiondata(trimmedData));
  }, [trimSessionEvents, dispatch]);

  const debouncedTrimSessionEvents = useDebounce(handleTrim, 200);

  const handleDrag = useCallback(
    (event: MouseEvent, isStart: boolean) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const newTime = Math.round((x / rect.width) * duration);
      if (!isSessionTrimmed) {
        setIsSessionTrimmed(true);
      }
      if (isStart) {
        setStartTime(Math.max(0, Math.min(newTime, endTime - 1)));
      } else {
        setEndTime(Math.min(duration, Math.max(newTime, startTime + 1)));
      }
      debouncedTrimSessionEvents();
    },
    [duration, startTime, endTime, isSessionTrimmed, debouncedTrimSessionEvents]
  );

  const startDrag = useCallback(
    (isStart: boolean) => {
      const handleMouseMove = (e: MouseEvent) => handleDrag(e, isStart);
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        // document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleDrag]
  );

  useEffect(() => {
    if (player) {
      const sessionProgressBar = document.querySelector(".rr-progress") as HTMLElement;
      if (sessionProgressBar) {
        sessionProgressBar.style.setProperty("width", `${((endTime - startTime) / duration) * 100}%`, "important");
        sessionProgressBar.style.setProperty("flex", "unset", "important");
        sessionProgressBar.style.setProperty("left", `${(startTime / duration) * 100}%`, "important");
      }
    }
  }, [startTime, endTime, duration, player]);

  return (
    <div className="session-trimmer-container">
      <div className="session-trimmer-area" ref={containerRef}>
        <TrimHandle
          onMouseDown={() => startDrag(true)}
          value={msToMinutesAndSeconds(startTime)}
          time={startTime}
          duration={duration}
        />
        <div
          className="session-trimmer-bar trimmer-drag-element"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
        />
        <TrimHandle
          onMouseDown={() => startDrag(false)}
          value={msToMinutesAndSeconds(endTime)}
          time={endTime}
          duration={duration}
        />
      </div>
    </div>
  );
};
