import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";

export const useIsTeamAdmin = (teamId: string): { isLoading: boolean; isTeamAdmin: boolean } => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    const functions = getFunctions();

    setIsLoading(true);
    const getIsTeamAdmin = httpsCallable(functions, "teams-isTeamAdmin");

    getIsTeamAdmin({ teamId })
      .then((res) => {
        //@ts-ignore
        if (res.data?.success) setIsTeamAdmin(res.data?.isAdmin);
      })
      .catch((err) => {
        Logger.log("Error while checking team admin", err);
      })
      .finally(() => setIsLoading(false));
  }, [teamId]);

  return { isLoading, isTeamAdmin };
};
