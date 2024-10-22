import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../store";
import { getUserGeoDetails } from "utils/geoUtils";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";

const useGeoLocation = () => {
  const dispatch = useDispatch();

  // const [country, setCountry] = useState("US");

  useEffect(() => {
    getUserGeoDetails()
      .then((details) => {
        // setCountry(currentCountry);
        dispatch(actions.updateUserCountry(details?.loc));
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.COUNTRY, details?.loc);
        window.country = details?.loc;
      })
      .catch(() => {
        dispatch(actions.updateUserCountry("US"));
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.COUNTRY, "US");
        window.country = "US";
      });
  }, [dispatch]);
};

export default useGeoLocation;
