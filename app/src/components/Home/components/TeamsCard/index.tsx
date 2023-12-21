import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableTeams } from "store/features/teams/selectors";
import { Skeleton } from "antd";
import { getPendingInvites } from "backend/workspace";
import Logger from "lib/logger";
import { isCompanyEmail } from "utils/FormattingHelper";

export const TeamsCard: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const [pendingInvites, setPendingInvites] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPendingInvites({ email: true, domain: true })
      .then((res: any) => {
        setPendingInvites(res?.pendingInvites ?? []);
      })
      .catch((e) => {
        Logger.error(e);
        setPendingInvites([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (!user.loggedIn) return <>CREATE WORKSPACE VIEW HERE WITH AUTH POPOVER</>;
  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (pendingInvites?.length > 0) return <>PENDING INVITES VIEW HERE</>;
  if (availableTeams?.length > 0) return <>AVAILABLE TEAMS VIEW HERE</>;
  if (isCompanyEmail(user?.details?.profile?.email)) return <>SHOW DEFAULT WORKSPACE VIEW</>;
  else return <>SHOW CREATE WORKSPACE VIEW</>;
};
