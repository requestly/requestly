import APP_CONSTANTS from "config/constants";
import APIClientSidebar from "features/apiClient/screens/apiClient/components/sidebar/APIClientSidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actions } from "store";
import { getUserAuthDetails } from "store/selectors";
import { redirectToNewEnvironment } from "utils/RedirectionUtils";

export const EnvironmentsSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const handleNewEnvironmentClick = () => {
    if (!user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: "api_client_sidebar",
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "Please log in to create a new environment",
          },
        })
      );
    } else {
      redirectToNewEnvironment(navigate);
    }
  };

  return <APIClientSidebar onNewClick={handleNewEnvironmentClick} />;
};
