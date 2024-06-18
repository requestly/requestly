import React, { useEffect, useCallback, useState } from "react";
import { Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import emptyWallet from "./assets/empty_wallet.svg";
// import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { UserMilestoneAndRewardDetails } from "features/incentivization/types";
import { getTotalCredits } from "features/incentivization/utils";
import { getIncentivizationMilestones } from "store/features/incentivization/selectors";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getUserAuthDetails } from "store/selectors";
import { incentivizationActions } from "store/features/incentivization/slice";
import { toast } from "utils/Toast";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./redeemCreditsModal.scss";
import { INCENTIVIZATION_SOURCE } from "features/incentivization/analytics/constants";
import {
  trackCreditsRedeemed,
  trackNoCreditsAvailableModalViewed,
  trackRedeemCreditsClicked,
  trackRedeemCreditsFailed,
  trackRedeemCreditsModalViewed,
} from "features/incentivization/analytics";
import { IncentivizationModal } from "store/features/incentivization/types";

interface RedeemCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMilestoneAndRewardDetails: UserMilestoneAndRewardDetails;
  source: string;
}

export const RedeemCreditsModal: React.FC<RedeemCreditsModalProps> = ({
  isOpen,
  onClose,
  userMilestoneAndRewardDetails,
  source,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const milestones = useSelector(getIncentivizationMilestones);
  const user = useSelector(getUserAuthDetails);

  const userPlanDetails = user?.details?.planDetails;
  const creditsToBeRedeemed = userMilestoneAndRewardDetails?.creditsToBeRedeemed ?? 0;
  const totalCredits = getTotalCredits(milestones);

  const getSubscriptionDatePreview = useCallback(() => {
    // Extend subscription
    if (userPlanDetails?.status === "trialing") {
      const subscriptionStartDate = userPlanDetails?.subscription?.startDate;
      const subscriptionEndDate = userPlanDetails?.subscription?.endDate;
      const startDate = moment(subscriptionStartDate).format("MMM DD, YYYY");
      const endDate = moment(subscriptionEndDate).add(creditsToBeRedeemed, "days").format("MMM DD, YYYY");

      return { startDate, endDate };
    } else {
      // New or restart subscription
      const startDate = moment().format("MMM DD, YYYY");
      const endDate = moment().add(creditsToBeRedeemed, "days").format("MMM DD, YYYY");

      return { startDate, endDate };
    }
  }, [isOpen, userPlanDetails, creditsToBeRedeemed]);

  const { startDate, endDate } = getSubscriptionDatePreview();
  const planSummary = [
    {
      label: "Plan name",
      value: "Professional team plan",
    },
    {
      label: "Duration",
      value: `${creditsToBeRedeemed} days`, // FIXME: show proper duration string ie "x months and y days"
    },
    {
      label: "Start date",
      value: startDate,
    },
    {
      label: "Renewal date",
      value: endDate,
    },
  ];

  // FIXME: currently breaks for few test cases eg 91
  // @ts-ignore
  const daysToMonthsAndDays = (days: number) => {
    const duration = moment.duration(days, "days");
    const months = Math.floor(duration.asMonths());
    const remainingDays = duration.subtract(moment.duration(months, "months")).days();
    let durationString = "";

    if (months > 0) {
      durationString += months === 1 ? `${months} month` : `${months} months`;
    }

    if (remainingDays > 0) {
      durationString +=
        remainingDays === 1
          ? !durationString
            ? `${remainingDays} day`
            : ` and ${remainingDays} day`
          : !durationString
          ? `${remainingDays} days`
          : ` and ${remainingDays} days`;
    }

    return durationString;
  };

  const handleRedeemCreditsClick = () => {
    trackRedeemCreditsClicked(userMilestoneAndRewardDetails?.creditsToBeRedeemed);
    const redeemCredits = httpsCallable(getFunctions(), "incentivization-redeemCredits");

    if (!user?.loggedIn) {
      return;
    }

    setIsLoading(true);

    dispatch(
      incentivizationActions.toggleActiveModal({ modalName: IncentivizationModal.TASKS_LIST_MODAL, newValue: false })
    );

    const redeemStatusToast = "redeemStatusToast";
    toast.loading({ content: "Please wait", key: redeemStatusToast });

    redeemCredits()
      .then((response) => {
        // @ts-ignore
        if (response.data?.success) {
          dispatch(
            incentivizationActions.setUserMilestoneAndRewardDetails({
              // @ts-ignore
              userMilestoneAndRewardDetails: response.data?.data,
            })
          );
          trackCreditsRedeemed(userMilestoneAndRewardDetails?.creditsToBeRedeemed);
          toast.success({
            duration: 0,
            key: redeemStatusToast,
            className: "redeem-status-toast-container",
            content: (
              <div className="redeem-status-toast">
                <div className="title-container">
                  <div className="title">Upgraded successfully</div>
                  <div
                    className="close-icon"
                    onClick={() => {
                      toast.hide(redeemStatusToast);
                    }}
                  >
                    <MdClose />
                  </div>
                </div>
                <div className="description">You are upgraded to Requestly Pro plan till {endDate}.</div>
              </div>
            ),
          });
          onClose();
        } else {
          throw new Error("Failed to redeem!");
        }
      })
      .catch((error) => {
        trackRedeemCreditsFailed(error?.message);
        toast.error({
          duration: 0,
          key: redeemStatusToast,
          className: "redeem-status-toast-container",
          content: (
            <div className="redeem-status-toast">
              <div className="title-container">
                <div className="title">Failed to upgrade</div>
                <div
                  className="close-icon"
                  onClick={() => {
                    toast.hide(redeemStatusToast);
                  }}
                >
                  <MdClose />
                </div>
              </div>
              <div className="description">
                We're unable to upgrade your account at the moment. Please try again, or contact our support team for
                assistance.
              </div>
            </div>
          ),
        });

        onClose();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      if (!creditsToBeRedeemed) {
        trackNoCreditsAvailableModalViewed(source);
      } else {
        trackRedeemCreditsModalViewed(creditsToBeRedeemed, source);
      }
    }
  }, [creditsToBeRedeemed, isOpen, source]);

  return (
    <Modal
      closable={!!creditsToBeRedeemed}
      width={creditsToBeRedeemed ? 416 : 480}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={creditsToBeRedeemed ? "Redeem credits and upgrade" : null}
      className={`custom-rq-modal redeem-credits-modal ${creditsToBeRedeemed ? "" : "empty"}`}
    >
      {!creditsToBeRedeemed ? (
        <div className="credits-not-available">
          <div className="content">
            <img width={100} height={100} className="empty-wallet" src={emptyWallet} alt="Empty wallet" />
            <div className="title">No credits available!</div>
            <div className="description">
              You don't have any credits available now. Please complete your Requestly setup and get ${totalCredits}{" "}
              free credits for Requestly Pro plan.
            </div>
          </div>
          <div className="actions">
            <RQButton
              type="primary"
              onClick={() => {
                dispatch(
                  incentivizationActions.toggleActiveModal({
                    modalName: IncentivizationModal.TASKS_LIST_MODAL,
                    newValue: true,
                    newProps: {
                      source: INCENTIVIZATION_SOURCE.REDEEM_CREDITS_MODAL,
                    },
                  })
                );
                onClose();
              }}
            >
              Setup & earn credits
            </RQButton>
            <RQButton
              type="text"
              onClick={() => {
                dispatch(
                  incentivizationActions.toggleActiveModal({
                    modalName: IncentivizationModal.TASKS_LIST_MODAL,
                    newValue: false,
                  })
                );
                onClose();
              }}
            >
              I'll do it later
            </RQButton>
          </div>
        </div>
      ) : (
        <div className="credits-available">
          <div className="content">
            <div className="description">
              You have earned <span className="credits-earned">${creditsToBeRedeemed} credits</span> till now. Use your
              credits to upgrade to Requestly Pro plan.
            </div>
            <div className="details">
              <div className="plan-summary-title">
                <span className="title">Plan summary</span>

                {/* <div className="plan-details">
                  <RiInformationLine /> Plan details
                </div> */}
              </div>

              <div className="summary-container">
                {planSummary.map(({ label, value }, index) => {
                  return (
                    <div key={index} className="summary-item">
                      <span className="label">{label}</span>
                      <span className="value">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="actions">
            <RQButton onClick={onClose}>Cancel</RQButton>
            <RQButton
              type="primary"
              loading={isLoading}
              disabled={!creditsToBeRedeemed}
              onClick={handleRedeemCreditsClick}
            >
              Redeem & upgrade
            </RQButton>
          </div>
        </div>
      )}
    </Modal>
  );
};
