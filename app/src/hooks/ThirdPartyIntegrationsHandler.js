import { useCallback, useEffect } from "react";
import firebaseApp from "firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initIntegrations } from "modules/analytics";
import { useDispatch } from "react-redux";

const ThirdPartyIntegrationsHandler = () => {
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      user = user ?? {};
      user.currentlyActiveWorkspaceTeamId = window.currentlyActiveWorkspaceTeamId ?? null;
      user.workspace = window.currentlyActiveWorkspaceTeamId ? "team" : "personal";

      user.activeWorkspaceName = window.currentlyActiveWorkspaceName;
      initIntegrations(user, stableDispatch);
    });
  }, [stableDispatch]);
};

export default ThirdPartyIntegrationsHandler;
