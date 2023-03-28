import { useCallback, useEffect } from "react";
import firebaseApp from "firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initIntegrations } from "modules/analytics";
import { useDispatch } from "react-redux";

const useThirdPartyIntegrations = () => {
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      initIntegrations(user, stableDispatch);
    });
  }, [stableDispatch]);
};

export default useThirdPartyIntegrations;
