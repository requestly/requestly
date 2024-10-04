import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../store";
import { getUserGeoDetails } from "utils/geoUtils";

const useGeoLocation = () => {
  const dispatch = useDispatch();

  // const [country, setCountry] = useState("US");

  useEffect(() => {
    getUserGeoDetails()
      .then((details) => {
        // setCountry(currentCountry);
        dispatch(actions.updateUserCountry(details?.loc));
        window.country = details?.loc;
      })
      .catch(() => {
        dispatch(actions.updateUserCountry("US"));
        window.country = "US";
      });
  }, [dispatch]);
};

export default useGeoLocation;
