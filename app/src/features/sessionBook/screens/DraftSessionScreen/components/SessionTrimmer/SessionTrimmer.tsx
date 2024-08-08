import React, { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingAttributes, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { RQButton } from "lib/design-system/components";
import { MdPause } from "@react-icons/all-files/md/MdPause";
import "./sessionTrimmer.scss";
import { EventType, eventWithTime } from "rrweb";
import { fullSnapshotEvent, IncrementalSource } from "@rrweb/types";
import { NetworkEventData, RQSessionEventType } from "@requestly/web-sdk";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { partition } from "lodash";
import { Divider } from "antd";

interface SessionTrimmerProps {
  duration: number;
}

export const SessionTrimmer: React.FC<SessionTrimmerProps> = ({ duration }) => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSessionTrimmed, setIsSessionTrimmed] = useState(false);
  const events = useSelector(getSessionRecordingEvents);
  const attributes = useSelector(getSessionRecordingAttributes);

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
    },
    [duration, startTime, endTime]
  );

  const startDrag = useCallback(
    (isStart: boolean) => {
      const handleMouseMove = (e: MouseEvent) => handleDrag(e, isStart);
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleDrag]
  );

  const handleDiscardTrim = () => {
    setIsSessionTrimmed(false);
    setStartTime(0);
    setEndTime(duration);
    dispatch(sessionRecordingActions.setTrimmedSessiondata(null));
  };

  const handleTrim = useCallback(() => {
    const sessionEvents = events[RQSessionEventType.RRWEB] as eventWithTime[];
    const networkEvents = events[RQSessionEventType.NETWORK] as NetworkEventData[];

    const sessionStartTimeFromEpoch = attributes.startTime;
    const newStartTime = sessionStartTimeFromEpoch + startTime;
    const newEndTime = sessionStartTimeFromEpoch + endTime;

    const [beforeStartCut, afterStartCut] = partition(sessionEvents, (event) => event.timestamp < newStartTime);
    const trimmedRRWebEvents = afterStartCut.filter(
      (event) => event.timestamp >= newStartTime && event.timestamp <= newEndTime
    );

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

    const finalTrimmedRRWebEvents = [
      { ...sessionEvents[0], timestamp: newStartTime - 1000 },
      { ...lastSnapshot!, timestamp: newStartTime - 1000 },
      ...Array.from(discardedScrolls)
        .concat(beforeCutExcludingScrolls)
        .map((event) => ({ ...event, timestamp: newStartTime })),
      ...trimmedRRWebEvents,
    ];

    const trimmedNetworkLogs = networkEvents.filter(
      (event) => event.timestamp >= newStartTime && event.timestamp <= newEndTime
    );

    dispatch(
      sessionRecordingActions.setTrimmedSessiondata({
        duration: endTime - startTime,
        events: {
          [RQSessionEventType.RRWEB]: finalTrimmedRRWebEvents,
          [RQSessionEventType.NETWORK]: trimmedNetworkLogs,
        },
      })
    );
  }, [attributes, startTime, endTime, dispatch, events]);

  return (
    <div className="session-trimmer-container">
      <div className="session-trimmer-area" ref={containerRef}>
        <div
          className="session-trimmer-handle handle-left"
          onMouseDown={() => startDrag(true)}
          style={{
            left: `${(startTime / duration) * 100}%`,
            marginLeft: "-8px",
          }}
        >
          <MdPause />
        </div>
        <div
          className="session-trimmer-bar"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
        />
        <div
          className="session-trimmer-handle handle-right"
          onMouseDown={() => startDrag(false)}
          style={{
            left: `${(endTime / duration) * 100}%`,
            marginRight: "-8px",
          }}
        >
          <MdPause />
        </div>
      </div>
      <div className="session-trim-actions">
        <Divider type="vertical" className="session-trim-divider" />
        <RQButton type="default" onClick={handleDiscardTrim} disabled={!isSessionTrimmed}>
          Discard
        </RQButton>
        <RQButton type="primary" disabled={!isSessionTrimmed} onClick={handleTrim}>
          Trim
        </RQButton>
      </div>
    </div>
  );
};
