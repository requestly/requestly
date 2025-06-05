import { RQButton } from "lib/design-system-v2/components";
import { MdRefresh } from "@react-icons/all-files/md/MdRefresh";

export const EmptyTestsView = () => {
  return (
    <div className="empty-tests-view-container">
      <img src={"/assets/media/apiClient/tests.svg"} alt="test container" />
      <div className="empty-tests-view-title">No test results found for this request</div>
      <div className="empty-tests-view-description">
        Write a test script and send request or refresh the results panel.
      </div>
      <RQButton type="secondary" icon={<MdRefresh />}>
        Refresh results
      </RQButton>
    </div>
  );
};
