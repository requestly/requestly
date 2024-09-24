import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../store";
import { fetchUserCountry } from "utils/geoUtils";

const useGeoLocation = () => {
  const dispatch = useDispatch();

  // const [country, setCountry] = useState("US");

  useEffect(() => {
    fetchUserCountry()
      .then((currentCountry) => {
        // setCountry(currentCountry);
        dispatch(actions.updateUserCountry(currentCountry));
        window.country = currentCountry;
      })
      .catch(() => {
        dispatch(actions.updateUserCountry("US"));
        window.country = "US";
      });
  }, [dispatch]);
};

export default useGeoLocation;
