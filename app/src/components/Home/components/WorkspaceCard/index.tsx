import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Spin } from "antd";
import { CreateWorkspaceView } from "./components/CreateWorkspaceView";
import { TeamsListView } from "./components/TeamsListView";
import { getPendingInvites } from "backend/workspace";
import Logger from "lib/logger";
import { Invite } from "types";
import { m, AnimatePresence } from "framer-motion";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";

export const TeamsCard: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const [pendingInvites, setPendingInvites] = useState<Invite[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user.loggedIn) {
      setIsLoading(false);
      return;
    }
    getPendingInvites({ email: true, domain: true })
      .then((res) => {
        if (res?.pendingInvites) {
          const invites = res?.pendingInvites;
          const sortedInvites = invites.sort(
            (a: Invite, b: Invite) => (b.metadata?.teamAccessCount as number) - (a.metadata?.teamAccessCount as number)
          );
          // Removing duplicate invites and showing most recent invites for each team
          const uniqueInvites: Record<string, Invite> = {};
          sortedInvites.forEach((invite: Invite) => (uniqueInvites[invite.metadata?.teamId as string] = invite));

          setPendingInvites(Object.values(uniqueInvites));
        } else setPendingInvites([]);
      })
      .catch((e) => {
        Logger.error(e);
        setPendingInvites([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user.loggedIn]);

  if (!user.loggedIn)
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CreateWorkspaceView />
        </m.div>
      </AnimatePresence>
    );
  if (isLoading)
    return (
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="homepage-card-loader"
          style={{ padding: "20px 1rem" }}
        >
          <Spin tip="Getting your teams workspaces..." size="large" />
        </m.div>
      </AnimatePresence>
    );
  if ((pendingInvites?.length ?? 0) > 0)
    return (
      <TeamsListView
        heading="We found your team on Requestly"
        subheading=" Join your team’s workspaces and access shared rules, mock APIs, replays, and more."
        pendingInvites={pendingInvites}
      />
    );
  if (availableWorkspaces?.length > 0)
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <TeamsListView heading="Your workspaces" />
        </m.div>
      </AnimatePresence>
    );
  // TODO: Add default workspace view after onboarding is 100% rolled out
  if (isCompanyEmail(user.details?.emailType))
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CreateWorkspaceView />
        </m.div>
      </AnimatePresence>
    );
  else
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CreateWorkspaceView />
        </m.div>
      </AnimatePresence>
    );
};
