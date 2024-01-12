import { useState, useEffect } from "react";
import { Button, Divider } from "antd";
import { CopyValue } from "components/misc/CopyValue";
import "./index.scss";

export const LiveLocalSessionCard = ({ session, clearSessionCallback }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(session.startTime));

  useEffect(() => {
    let intervalId;

    if (timeLeft.minutes > 0 || timeLeft.seconds > 0) {
      intervalId = setInterval(() => {
        const newTimeLeft = calculateTimeLeft(session.startTime);
        setTimeLeft(newTimeLeft);

        if (parseInt(newTimeLeft.minutes) === 0 && parseInt(newTimeLeft.seconds) === 0) {
          clearSessionCallback(session.port);
          clearInterval(intervalId);
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [session.startTime, timeLeft, clearSessionCallback, session.port]);

  function calculateTimeLeft(startTime) {
    const endTime = startTime + 10 * 60 * 1000; // 10 minutes in ms
    const timeDifference = endTime - Date.now();
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return {
      minutes: minutes < 10 ? `0${minutes}` : minutes,
      seconds: seconds < 10 ? `0${seconds}` : seconds,
    };
  }

  return (
    <div className="live-local-session-card">
      <div className="port-wrapper">
        <div className="text-white text-bold">PORT:</div>
        <div className="live-local-session-card-port">{session.port}</div>
      </div>
      <Divider type="vertical" />
      <div className="live-local-session-details">
        <CopyValue value={session.url} />

        <Button type="default" size="small" className="mt-8">
          View logs
        </Button>
        <Button
          type="danger"
          size="small"
          className="ml-4"
          onClick={() => {
            clearSessionCallback(session.port);
          }}
        >
          Stop
        </Button>
        <span
          className="ml-4 text-bold text-white"
          style={{
            color: timeLeft.minutes < 2 ? "var(--danger)" : "white",
          }}
        >
          Time left: {`${timeLeft.minutes}:${timeLeft.seconds}`}
        </span>
      </div>
    </div>
  );
};
