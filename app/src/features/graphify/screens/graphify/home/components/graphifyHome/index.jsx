import emptyViewIcon from "../../../../../../apiClient/assets/emptyView.svg";
import defaultViewIcon from "../../../../../../apiClient/assets/defaultView.svg";
import { RQButton } from "lib/design-system-v2/components";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import "./graphifyHome.scss";
import PATHS from "config/constants/sub/paths";
import { useNavigate } from "react-router-dom";

const GraphifyHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  // We'll track if user has any existing API translations
  const hasExistingTranslations = false; // This would come from your state management

  const handleNewTranslation = () => {
    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            src: APP_CONSTANTS.FEATURES.GRAPHIFY,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            eventSource: "graphify_home",
          },
        })
      );
      return;
    }

    // Navigate to translation creation if user is logged in
    navigate(PATHS.GRAPHIFY.CREATE.RELATIVE);
  };

  const handleViewTranslations = () => {
    if (!user.loggedIn) {
      // Similar auth check
      return;
    }
    // Navigate to translations dashboard when implemented
  };

  return (
    <div className="graphify-home-container">
      <img src={hasExistingTranslations ? defaultViewIcon : emptyViewIcon} alt="graphify-view" />

      <div className="graphify-content">
        <div className="graphify-header">
          <h3>
            <u>Graphify - AI powered "GraphQL as a Service"</u>
          </h3>
        </div>
        <br />
        <div className="graphify-header">Transform REST APIs into GraphQL Endpoints </div>
        <div className="graphify-header">in less than 2 minutes</div>

        <div className="graphify-description">
          {hasExistingTranslations
            ? "Manage your API translations or create new ones. Monitor usage, update configurations, and test your GraphQL endpoints."
            : "Get started by creating your first REST to GraphQL translation. Simply provide your REST API endpoints and we'll generate a fully functional GraphQL API."}
        </div>

        <div className="graphify-features">
          <div>✓ Automatic Schema Generation</div>
          <div>✓ Interactive Testing Playground</div>
          <div>✓ Real-time Translation</div>
        </div>

        <div className="graphify-actions">
          <RQButton onClick={handleNewTranslation} type="primary">
            Create New Translation
          </RQButton>

          {hasExistingTranslations && <RQButton onClick={handleViewTranslations}>View My Translations</RQButton>}
        </div>
      </div>
    </div>
  );
};

export default GraphifyHome;
