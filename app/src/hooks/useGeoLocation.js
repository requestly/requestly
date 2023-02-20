import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../store";
import { fetchUserCountry } from "../utils/Misc";

const useGeoLocation = () => {
  const dispatch = useDispatch();

  // const [country, setCountry] = useState("US");

  useEffect(() => {
    fetchUserCountry()
      .then((currentCountry) => {
        // setCountry(currentCountry);
        dispatch(actions.updateUserCountry(currentCountry));
      })
      .catch(() => {
        dispatch(actions.updateUserCountry("US"));
      });
  }, [dispatch]);
};

export default useGeoLocation;
