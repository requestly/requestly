import { useState } from "react";
import { getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "@react-icons/all-files/fi/FiGift";
import { Badge } from "antd";
import { IncentiveTasksListModal } from "features/incentivization";
import { RQButton } from "lib/design-system/components";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import "./creditsButton.scss";

export const CreditsButton = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isTaskListModalVisible, setIsTaskListModalVisible] = useState(false);

  const handleButtonClick = () => {
    if (user.loggedIn) {
      setIsTaskListModalVisible(true);
    } else {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "You must sign in to earn or redeem free credits.",
          },
        })
      );
    }
  };
  return (
    <>
      <RQButton className="primary-sidebar-link w-full" onClick={handleButtonClick}>
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
