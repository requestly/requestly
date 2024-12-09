import emptyEnvironmentViewImage from "../../../../../environment/assets/emptyEnvironment.svg";
import { RQButton } from "lib/design-system-v2/components";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./apiClientEmptyView.scss";

export const APIClientEmptyView = () => {
  const { openTab } = useTabsLayoutContext();

  return (
    <div className="empty-api-client-view">
      <>
        <div className="empty-api-client-view-content">
          <img src={emptyEnvironmentViewImage} alt="empty environment" />
          <div className="empty-api-client-view-title">No API requests created yet</div>
          <p>You haven't set up an API request yet. Once you create one, it'll appear here.</p>
          <RQButton
            type="primary"
            onClick={() =>
              openTab("request/new", { title: "Untitled request", url: `${PATHS.API_CLIENT.ABSOLUTE}/request/new` })
            }
          >
            Create a new API request
          </RQButton>
        </div>
      </>
    </div>
  );
};
