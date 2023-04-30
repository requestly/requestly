import React, { useEffect, useState } from "react";
import NetworkSessionsList from "./NetworkSessionsList";
import { NetworkSessionRecord } from "./types";
import OnboardingView, { OnboardingTypes } from "../SessionsIndexPage/OnboardingView";

const NetworkSessionsIndexPage: React.FC<{}> = () => {
  const [networkSessions, setNetworkSessions] = useState<NetworkSessionRecord[]>([]);

  const [recievedRecordings, setRecievedRecordings] = useState(false);

  window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("all-network-sessions", (payload: NetworkSessionRecord[]) => {
    setNetworkSessions(payload || []);
    setRecievedRecordings(true);
  });

  useEffect(() => {
    if (!recievedRecordings) {
      window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain("get-all-network-sessions");
    }
  }, [recievedRecordings]);
  return networkSessions.length ? (
    <NetworkSessionsList networkSessionsMetadata={networkSessions} />
  ) : (
    <OnboardingView type={OnboardingTypes.NETWORK} />
  );
};

export default NetworkSessionsIndexPage;
