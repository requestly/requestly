import emptyViewIcon from "../../../../../../assets/emptyView.svg";
import defaultViewIcon from "../../../../../../assets/defaultView.svg";
import { RQButton } from "lib/design-system-v2/components";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { useApiClientContext } from "features/apiClient/contexts";
import "./apiClientEmptyView.scss";

export const ApiClientEmptyView = () => {
  const { apiClientRecords } = useApiClientContext();
  const { openTab } = useTabsLayoutContext();

  const isEmpty = apiClientRecords.length === 0;

  return (
    <div className="api-client-empty-view-container">
      <img src={isEmpty ? emptyViewIcon : defaultViewIcon} alt="empty-view" />
      <div>
        <div className="api-client-empty-view-header">
          {isEmpty ? "No API requests created yet." : "Pick up where you left off or start fresh."}
        </div>
        <div className="api-client-empty-view-description">
          {isEmpty
            ? "Start by creating a collection for your requests or directly add your first request."
            : "View saved collections and requests, continue from where you left off, or start something new."}
        </div>
        <div className="api-client-empty-view-actions">
          <RQButton
            onClick={() =>
              openTab("request/new", { title: "Untitled request", url: `${PATHS.API_CLIENT.ABSOLUTE}/request/new` })
            }
          >
            Create a new API request
          </RQButton>
          <RQButton
            onClick={() =>
              openTab("collection/new", {
                title: "Untitled collection",
                url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/new`,
              })
            }
            type="primary"
          >
            Create a new collection
          </RQButton>
        </div>
      </div>
    </div>
  );
};
