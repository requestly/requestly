import APP_CONSTANTS from "config/constants";
import APIClientSidebar from "features/apiClient/screens/apiClient/components/sidebar/APIClientSidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { actions } from "store";
import { getUserAuthDetails } from "store/selectors";
import { redirectToApiClientCollection, redirectToNewEnvironment, redirectToRequest } from "utils/RedirectionUtils";
import { trackCreateEnvironmentClicked } from "../../analytics";
import { RQAPI } from "features/apiClient/types";

export const EnvironmentsSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const handleNewEnvironmentClick = (source: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => {
    if (!user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: "api_client_sidebar",
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: `Please log in to create a new ${recordType.toLowerCase()}`,
          },
        })
      );
    } else {
      switch (recordType) {
        case RQAPI.RecordType.API: {
          redirectToRequest(navigate);
          return;
        }

        case RQAPI.RecordType.COLLECTION: {
          redirectToApiClientCollection(navigate);
          return;
        }
        case RQAPI.RecordType.ENVIRONMENT: {
          redirectToNewEnvironment(navigate);
          trackCreateEnvironmentClicked(source);
          return;
        }
        default:
          return;
      }
    }
  };

  return <APIClientSidebar onNewClick={handleNewEnvironmentClick} />;
};
