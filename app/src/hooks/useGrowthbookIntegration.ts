import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";

import { getUserAttributes } from "store/selectors";
import { initGrowthbook, updateGrowthbookAttributes } from "utils/feature-flag/growthbook";
import firebaseApp from "firebase.js";

const useGrowthBookIntegration = () => {
    // Keeping it object as boolean wasn't working when updating attributes
    const [growthbookStatus, setGrowthbookStatus] = useState({ initDone: false});
    const userAttributes = useSelector(getUserAttributes);

    // Custom Hooks
    const usePrevious = (value: any) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };

    const prevUserAttributes = usePrevious(userAttributes);

    useEffect(() => {
        if(growthbookStatus.initDone) {
            // IMP: Updating this only on after comparing if anything is changed or not. As this was causing rerenders when useFeatureValue is used which then called trackAttr() and causing infinite loops
            // We can only updateGrowthbookAttributes only if deviceId, sessionId, id, email changes in case this happens again.
            console.log(prevUserAttributes, userAttributes);
            console.log(_.reduce(prevUserAttributes, function(result, value, key) {
                return _.isEqual(value, userAttributes[key]) ?
                    result : result.concat(key);
            }, []));

            if(prevUserAttributes && !_.isEqual(prevUserAttributes, userAttributes)) {
                // console.log("userAttributesChanged");
                updateGrowthbookAttributes({ ...userAttributes });
            } else {
                // console.log("userAttributes not changed");
            }
        }
    }, [userAttributes, growthbookStatus, prevUserAttributes]);

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