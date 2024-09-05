import { useSelector } from "react-redux";
import { getSessionRecordingEvents } from "store/features/session-recording/selectors";
import "./sessionStorageLogs.scss";

export const SessionStorageLogs = () => {
  const events = useSelector(getSessionRecordingEvents);

  return (
    <div className="session-storage-logs-container">
      <div className="session-storage-logs-header">
        <h3>Storage</h3>
      </div>
    </div>
  );
};
