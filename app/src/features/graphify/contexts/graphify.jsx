import React, { createContext, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

const GraphifyContext = createContext({});

export const GraphifyProvider = ({ children }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  useEffect(() => {
    if (!user?.loggedIn) {
      // Add logic here if needed when the user is not logged in
    }
  }, [user?.loggedIn]);

  useEffect(() => {
    if (!uid) {
      return;
    }
    // Add logic here if needed when uid or teamId changes
  }, [uid, teamId]);

  const value = {
    // Define any context values needed for your application
  };

  return <GraphifyContext.Provider value={value}>{children}</GraphifyContext.Provider>;
};

export const useGraphifyContext = () => useContext(GraphifyContext);
