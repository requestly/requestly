import React, { useCallback, useRef, useState } from "react";
import { RQButton } from "lib/design-system/components";
import { MdPause } from "@react-icons/all-files/md/MdPause";
import "./sessionTrimmer.scss";

interface SessionTrimmerProps {
  duration: number;
}

export const SessionTrimmer: React.FC<SessionTrimmerProps> = ({ duration }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSessionTrimmed, setIsSessionTrimmed] = useState(false);

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

  const startDrag = (isStart: boolean) => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e, isStart);
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDiscardTrim = () => {
    setIsSessionTrimmed(false);
    setStartTime(0);
    setEndTime(duration);
  };

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
        {isSessionTrimmed && (
          <RQButton type="default" onClick={handleDiscardTrim}>
            Discard
          </RQButton>
        )}
        <RQButton type="primary" disabled={!isSessionTrimmed}>
          Trim
        </RQButton>
      </div>
    </div>
  );
};
