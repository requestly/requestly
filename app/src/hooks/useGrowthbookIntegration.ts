import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { getUserAttributes } from "store/selectors";
import { initGrowthbook, updateGrowthbookAttributes } from "utils/feature-flag/growthbook";
import firebaseApp from "firebase.js";

const useGrowthBookIntegration = () => {
    // Keeping it object as boolean wasn't working when updating attributes
    const [growthbookStatus, setGrowthbookStatus] = useState({ initDone: false});
    const userAttributes = useSelector(getUserAttributes);

    useEffect(() => {
        if(growthbookStatus.initDone) {
            updateGrowthbookAttributes({ ...userAttributes });
        }
    }, [userAttributes, growthbookStatus]);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        onAuthStateChanged(auth, async (user) => {
            setGrowthbookStatus({initDone: false});
            initGrowthbook(user);
            setGrowthbookStatus({initDone: true});
        });
    }, []);
}

export default useGrowthBookIntegration;