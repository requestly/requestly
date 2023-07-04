import firebaseApp from "../../../../../../firebase";
import {
  getFirestore,
  query,
  collectionGroup,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import TrafficTableV2 from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2";
import { convertLogDocIntoRqLog } from "../utils";
import DebugLogger from "lib/logger";

const db = getFirestore(firebaseApp);

let unsubscribe = null;

const Logger = ({ sdkId, deviceId, showDeviceSelector }) => {
  // LOCAL
  const [rqLogs, setRqLogs] = useState([]);
  const [clearTimestamp, setClearTimestamp] = useState(null);
  const unsubscribeListeners = useCallback(() => {
    // Unsubscribe previous listener
    if (unsubscribe) {
      unsubscribe();
    }
  }, []);

  // Deleting logs
  const deviceRef = doc(db, `sdks/${sdkId}/devices/${deviceId}`);

  const getAndUpdateLocalDeleteTimestamp = useCallback(async () => {
    return getDoc(deviceRef)
      .then((doc) => {
        if (doc.exists) {
          let data = doc.data();
          if (data && data.deleteTimestamp) {
            setClearTimestamp(data.deleteTimestamp);
          } else {
            setClearTimestamp(0);
          }
        } else return null;
      })
      .catch(DebugLogger.error);
  }, [deviceRef]);

  const clearLogs = () => {
    const currentTimestamp = Date.now();
    updateDoc(deviceRef, { deleteTimestamp: currentTimestamp });
    setClearTimestamp(currentTimestamp);
  };
  useEffect(() => {
    getAndUpdateLocalDeleteTimestamp();
  }, [getAndUpdateLocalDeleteTimestamp]);

  useEffect(() => {
    unsubscribeListeners();

    // Attach listener with updated devices
    if (deviceId) {
      if (clearTimestamp !== null) {
        unsubscribe = onSnapshot(
          query(
            collectionGroup(db, "logs"),
            ...[
              where("sdk_id", "==", sdkId),
              where("created_ts", ">=", clearTimestamp),
              where("device_id", "in", [deviceId]),
              orderBy("created_ts", "desc"),
              limit(10),
            ]
          ),
          async (snapshot) => {
            if (snapshot) {
              const _rqLogs = snapshot.docs.map((doc) => {
                return convertLogDocIntoRqLog(doc);
              });
              setRqLogs(_rqLogs);
            }
          }
        );
      } else {
        getAndUpdateLocalDeleteTimestamp();
      }
    }
  }, [deviceId, sdkId, clearTimestamp, unsubscribeListeners, getAndUpdateLocalDeleteTimestamp]);

  const renderTrafficTable = () => {
    return (
      <TrafficTableV2
        logs={rqLogs}
        emptyCtaText="Learn how to use the debugger"
        emptyCtaAction="https://youtu.be/Zf4iJjnhPzY"
        emptyDesc={"No Network Activity logged. "}
        showDeviceSelector={showDeviceSelector}
        deviceId={deviceId}
        clearLogsCallback={clearLogs}
      />
    );
  };
  return <>{renderTrafficTable()}</>;
};

export default Logger;
