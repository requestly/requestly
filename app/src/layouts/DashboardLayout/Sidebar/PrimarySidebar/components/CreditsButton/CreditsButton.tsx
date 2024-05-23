import { useState } from "react";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { IncentiveTasksListModal } from "features/incentivization";
import { RQButton } from "lib/design-system/components";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const [isTaskListModalVisible, setIsTaskListModalVisible] = useState(false);

  return (
    <>
      <RQButton className="primary-sidebar-link w-full" onClick={() => setIsTaskListModalVisible(true)}>
        <div className="icon__wrapper">
          <Badge
            className="credits-earned-badge"
            size="small"
            // TODO: Replace with actual credits earned
            count={<span className="credits-earned-count">$100</span>}
          >
            <FiGift />
          </Badge>
        </div>
        <div className="link-title">Credits</div>
      </RQButton>
      <IncentiveTasksListModal isOpen={isTaskListModalVisible} onClose={() => setIsTaskListModalVisible(false)} />
    </>
  );
};
