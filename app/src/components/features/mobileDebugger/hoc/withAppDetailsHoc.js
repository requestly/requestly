import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import firebaseApp from "../../../../firebase";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToMobileDebuggerUnauthorized } from "utils/RedirectionUtils";
import { actions } from "store";

const db = getFirestore(firebaseApp);

const withAppDetailsHoc = (WrappedComponent) => {
  return (props) => {
    const { appId } = useParams();
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [appDetails, setAppDetails] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(true);

    useEffect(() => {
      let _appDetails = {};
      const docRef = doc(db, "sdks", appId);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            _appDetails = docSnap.data();
            _appDetails["id"] = docSnap.id;
            dispatch(
              actions.updateMobileDebuggerAppDetails({
                id: _appDetails["id"],
                name: _appDetails["name"],
                platform: _appDetails["platform"],
              })
            );
            // Cleanup Previous Device Ids
            // dispatch(updateMobileDebuggerInterceptorDetails(null));
          } else {
            _appDetails = null;
            redirectToMobileDebuggerUnauthorized(navigate, appId);
          }
          setAppDetails(_appDetails);
          setIsDetailsLoading(false);
        })
        .catch((err) => {
          // TODO: Add flow to show UI for getting access to app from administrator
          _appDetails = null;
          redirectToMobileDebuggerUnauthorized(navigate, appId);
          setAppDetails(_appDetails);
          setIsDetailsLoading(false);
        });
    }, [appId, dispatch, navigate]);

    return (
      <WrappedComponent
        {...props}
        appId={appId}
        appDetails={appDetails}
        isDetailsLoading={isDetailsLoading}
      />
    );
  };
};

export default withAppDetailsHoc;
