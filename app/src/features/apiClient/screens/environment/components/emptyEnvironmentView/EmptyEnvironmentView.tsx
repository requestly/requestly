import { useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { getCurrentEnvironmentId } from "store/features/variables/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { redirectToNewEnvironment } from "utils/RedirectionUtils";
import "./emptyEnvironmentView.scss";

export const EmptyEnvironmentView = () => {
  const navigate = useNavigate();
  const { getAllEnvironments } = useEnvironmentManager();
  const currentEnvironmentId = useSelector(getCurrentEnvironmentId);
  const environments = getAllEnvironments();

  const handleCreateNewEnvironment = () => {
    redirectToNewEnvironment(navigate);
  };

  useEffect(() => {
    if (environments?.length > 0) {
      if (currentEnvironmentId) {
        navigate(`${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${currentEnvironmentId}`);
      } else {
        navigate(`${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${environments[0].id}`);
      }
    }
  }, [environments, currentEnvironmentId, navigate]);

  return (
    <div className="empty-environment-view">
      <div className="empty-environment-view-content">
        <img src={"/assets/media/apiClient/emptyEnvironment.svg"} alt="empty environment" />
        <div className="empty-environment-view-title">No environment created yet</div>
        <p>You haven't set up an environment yet. Once you create one, it'll appear here.</p>
        <RQButton type="primary" onClick={handleCreateNewEnvironment}>
          Create new environment
        </RQButton>
      </div>
    </div>
  );
};
