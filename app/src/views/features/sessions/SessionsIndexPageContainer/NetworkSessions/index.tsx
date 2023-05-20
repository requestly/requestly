import React, { useEffect, useState } from "react";
import NetworkSessionsList from "./NetworkSessionsList";
import { NetworkSessionRecord } from "./types";
import OnboardingView, { OnboardingTypes } from "../SessionsIndexPage/OnboardingView";

const NetworkSessionsIndexPage: React.FC<{}> = () => {
  const [networkSessions, setNetworkSessions] = useState<NetworkSessionRecord[]>([]);

  const [recievedRecordings, setRecievedRecordings] = useState(false);

  useEffect(() => {
    if (!recievedRecordings) {
      window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain("get-all-network-sessions").then(
        (sessions: NetworkSessionRecord[]) => {
          setNetworkSessions(sessions || []);
          setRecievedRecordings(true);
        }
      );
    }
  }, [recievedRecordings]);

  useEffect(() => {
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("network-sessions-updated", (payload: NetworkSessionRecord[]) => {
      setNetworkSessions(payload || []);
    });
  }, []);

  return networkSessions.length ? (
    <NetworkSessionsList networkSessionsMetadata={networkSessions} />
  ) : (
    <OnboardingView type={OnboardingTypes.NETWORK} />
  );
};

export default NetworkSessionsIndexPage;
