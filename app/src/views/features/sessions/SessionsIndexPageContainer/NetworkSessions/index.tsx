import React, { useEffect, useState } from "react";
import NetworkSessionsList from "./NetworkSessionsList";
import { NetworkSessionRecord } from "./types";

import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { NewtorkSessionsOnboardingView } from "./NetworkSessionViewer/NetworkSessionsOnboardingView";
import { EmptyState, RoleBasedComponent } from "features/rbac";
const TRACKING = APP_CONSTANTS.GA_EVENTS;

const NetworkSessionsIndexPage: React.FC<{}> = () => {
  const [networkSessions, setNetworkSessions] = useState<NetworkSessionRecord[]>([]);

  const [recievedRecordings, setRecievedRecordings] = useState(false);

  useEffect(() => {
    if (!recievedRecordings) {
      window?.RQ?.DESKTOP.SERVICES.IPC.invokeEventInMain("get-all-network-sessions").then(
        (sessions: NetworkSessionRecord[]) => {
          submitAttrUtil(TRACKING.ATTR.NUM_NETWORK_SESSIONS, sessions?.length || 0);
          setNetworkSessions(sessions || []);
          setRecievedRecordings(true);
        }
      );
    }
  }, [recievedRecordings]);

  useEffect(() => {
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("network-sessions-updated", (payload: NetworkSessionRecord[]) => {
      submitAttrUtil(TRACKING.ATTR.NUM_NETWORK_SESSIONS, payload?.length || 0);
      setNetworkSessions(payload || []);
    });
  }, []);

  return networkSessions.length ? (
    <NetworkSessionsList networkSessionsMetadata={networkSessions} />
  ) : (
    <RoleBasedComponent
      resource="network_sessions"
      permission="create"
      fallback={
        <EmptyState
          title="No sessions created yet."
          description="As a viewer, you will be able to view and sessions once someone from your team creates them. You can contact your workspace admin to update your role."
        />
      }
    >
      <NewtorkSessionsOnboardingView />
    </RoleBasedComponent>
  );
};

export default NetworkSessionsIndexPage;
