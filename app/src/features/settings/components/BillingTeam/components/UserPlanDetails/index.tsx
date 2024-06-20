import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { Col, Modal, Popconfirm, Row, Space } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { TeamPlanStatus } from "../TeamPlanStatus";
import { RQButton } from "lib/design-system/components";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdDiversity1 } from "@react-icons/all-files/md/MdDiversity1";
import UpgradeIcon from "../../assets/upgrade.svg";
import { actions } from "store";
import { PRICING } from "features/pricing";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import firebaseApp from "../../../../../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import SubscriptionInfo from "features/settings/components/Profile/ActiveLicenseInfo/SubscriptionInfo";
import { redirectToPersonalSubscription } from "utils/RedirectionUtils";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import "./index.scss";
import { trackPersonalSubscriptionDownloadInvoicesClicked } from "features/settings/analytics";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { PlanStatus } from "../../types";
import { ChangePlanRequestConfirmationModal } from "features/pricing/components/ChangePlanRequestConfirmationModal";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";

export const UserPlanDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const teamId = useSelector(getCurrentlyActiveWorkspace)?.id;
  const [daysLeft, setDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppSumoSubscription, setHasAppSumoSubscription] = useState(false);
  const [lifeTimeSubscriptionDetails, setLifeTimeSubscriptionDetails] = useState(null);
  const trialDuration = useFeatureValue("trial_days_duration", 30);
  const { type } = user.details?.planDetails ?? {};

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirmationModalLoading, setIsConfirmationModalLoading] = useState(false);

  const getSubscriptionEndDateForAppsumo = useCallback((date = new Date()) => {
    const currentDate = date;

    const endDate = new Date(currentDate);
    endDate.setFullYear(currentDate.getFullYear() + 5);

    return endDate.getTime();
  }, []);

  useEffect(() => {
    if (teamId) {
      const db = getFirestore(firebaseApp);
      const teamsRef = doc(db, "teams", teamId);
      getDoc(teamsRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.appsumo) {
              setHasAppSumoSubscription(true);
              setLifeTimeSubscriptionDetails({
                ...data.appsumo,
                startDate: data.appsumo.date,
                endDate: getSubscriptionEndDateForAppsumo(new Date(data.appsumo.date)),
                type: "appsumo",
                plan: data?.plan,
              });
            }
          }
        })
        .catch(() => {
          Logger.log("Error while fetching appsumo details for team");
        })
        .finally(() => setIsLoading(false));
    }
  }, [getSubscriptionEndDateForAppsumo, teamId]);

  useEffect(() => {
    try {
      const diffTime = new Date(user?.details?.planDetails?.subscription?.endDate).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(daysLeft);
    } catch (err) {
      Logger.log(err);
    }
  }, [user?.details?.planDetails?.subscription?.endDate]);

  const handleCancelPlanClick = useCallback(() => {
    setIsConfirmationModalOpen(true);
    setIsConfirmationModalLoading(true);
    const requestPlanCancellation = httpsCallable(getFunctions(), "premiumNotifications-requestPlanCancellation");
    requestPlanCancellation({
      currentPlan: user?.details?.planDetails?.planId,
    })
      .catch((err) => {
        console.error(err);
        toast.error("Error in cancelling plan. Please contact support");
        setIsConfirmationModalOpen(false);
      })
      .finally(() => {
        setIsConfirmationModalLoading(false);
      });
  }, [user?.details?.planDetails?.planId]);

  if (isLoading) return null;

  const renderPopConfirmation = () => {
    const showFreeTrailCancelMessage = () => {
      Modal.info({
        title: "You are on a free trial plan.",
        content: (
          <div>
            <p>
              This plan will cancel automatically in a few days.
              <br />
              No action is required.
            </p>
          </div>
        ),
        onOk() {},
      });
    };

    if (user?.details?.planDetails?.status === "trialing") {
      return (
        <RQButton size="small" type="text" className="cancel-plan-btn" onClick={showFreeTrailCancelMessage}>
          Cancel plan
        </RQButton>
      );
    }
    return (
      <Popconfirm
        icon={null}
        cancelText="No"
        okText="Yes"
        title="Are you sure you want to cancel your plan?"
        onConfirm={handleCancelPlanClick}
      >
        <RQButton size="small" type="text" className="cancel-plan-btn">
          Cancel plan
        </RQButton>
      </Popconfirm>
    );
  };

  return (
    <>
      <Col
        className="billing-teams-primary-card user-plan-detail-card"
        style={{
          marginTop: !user?.details?.isPremium ? "80px" : "0px",
        }}
      >
        {user?.details?.isPremium && !(user?.details?.planDetails?.status === "trialing" && hasAppSumoSubscription) ? (
          <>
            {" "}
            <Row gutter={8} align="middle" className="user-plan-card-header">
              <Col>
                <Row gutter={8} align="middle">
                  <Col className="text-white text-bold">Your plan</Col>
                  <Col>
                    <TeamPlanStatus subscriptionStatus={user?.details?.planDetails?.status} />
                  </Col>
                </Row>
              </Col>
              <Col>{user?.details?.planDetails?.status !== PlanStatus.EXPIRED && renderPopConfirmation()}</Col>
            </Row>
            <Col className="user-plan-card-grid">
              <div className="user-plan-card-grid-item">
                <Space direction="vertical" size={8}>
                  {user?.details?.planDetails?.status === "trialing" ? (
                    <div>{trialDuration} days free trial</div>
                  ) : null}
                  <Row gutter={8} className="items-center">
                    <Col className="user-plan-card-plan-name">
                      {getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planName))} plan
                    </Col>
                    {user?.details?.planDetails?.status !== "trialing" && (
                      <Col>
                        <RQButton
                          size="small"
                          type="text"
                          icon={<MdOutlineFileDownload />}
                          className="user-download-invoice-btn"
                          onClick={() => {
                            trackPersonalSubscriptionDownloadInvoicesClicked();
                            redirectToPersonalSubscription(navigate, true, true);
                          }}
                        >
                          Download invoices
                        </RQButton>
                      </Col>
                    )}
                  </Row>
                </Space>
              </div>
              <div className="user-plan-card-grid-item">
                <Space direction="vertical" size={8}>
                  <div className="user-plan-card-grid-item-label">
                    {user?.details?.planDetails?.status === "trialing" ? "Trial" : "Plan"} start date
                  </div>
                  <div className="user-plan-date">
                    {getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.startDate))}
                  </div>
                </Space>
              </div>
              <div className="user-plan-card-grid-item">
                <Space direction="vertical" size={8}>
                  <div className="user-plan-card-grid-item-label">
                    {user?.details?.planDetails?.status === "trialing" ? "Trial" : "Plan"} expire date
                  </div>
                  <div className="user-plan-date">
                    {hasAppSumoSubscription
                      ? "Lifetime"
                      : getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.endDate))}
                  </div>
                </Space>
              </div>
            </Col>
          </>
        ) : null}

        {hasAppSumoSubscription ? (
          <div
            style={{
              padding: "1rem 8px",
            }}
          >
            <div className="subheader mb-16">Appsumo Subscription</div>
            <SubscriptionInfo
              hideShadow
              isLifeTimeActive={true}
              appSumoCodeCount={lifeTimeSubscriptionDetails?.codes?.length ?? 0}
              hideManagePersonalSubscriptionButton={true}
              subscriptionDetails={{
                validFrom: lifeTimeSubscriptionDetails.startDate,
                validTill: lifeTimeSubscriptionDetails.endDate,
                status: "active",
                type: lifeTimeSubscriptionDetails.type ?? type,
                planName: lifeTimeSubscriptionDetails?.plan
                  ? getPlanNameFromId(lifeTimeSubscriptionDetails.plan)
                  : "Session Book Plus",
                planId: lifeTimeSubscriptionDetails?.plan
                  ? getPlanNameFromId(lifeTimeSubscriptionDetails.plan)
                  : "session_book_plus",
              }}
            />
          </div>
        ) : (
          <>
            {user?.details?.planDetails?.planName !== PRICING.PLAN_NAMES.PROFESSIONAL ||
            user?.details?.planDetails?.status === "trialing" ? (
              <Col className="user-plan-upgrade-card">
                <MdDiversity1 />
                <div className="title">
                  {!user?.details?.isPremium ? "You don't have any plan. " : ""}Upgrade for more features 🚀
                </div>
                <div className="user-plan-upgrade-card-description">
                  {user?.details?.planDetails?.status === "trialing" ? (
                    <>
                      Your professional plan free trail will expire in {daysLeft} days.{" "}
                      {billingTeams.length
                        ? "Please consider upgrading or connect directly with billing team admins already enjoying premium features."
                        : "Get access to premium rule types and extended rule limits"}
                    </>
                  ) : (
                    <>
                      Upgrade for premium features. You can also join an existing billing team or ask your organization
                      admin to switch you to a paid plan.
                    </>
                  )}
                </div>
                <Row className="mt-16" gutter={8} align="middle">
                  {billingTeams.length ? (
                    <Col>
                      <RQButton
                        type="default"
                        onClick={() => {
                          navigate(APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE + "/" + billingTeams[0].id);
                        }}
                      >
                        Join a paid team
                      </RQButton>
                    </Col>
                  ) : null}
                  <Col>
                    <RQButton
                      className="user-plan-upgrade-card-btn"
                      icon={<img src={UpgradeIcon} alt="upgrade" />}
                      type="primary"
                      onClick={() => {
                        dispatch(
                          // @ts-expect-error
                          actions.toggleActiveModal({
                            modalName: "pricingModal",
                            newValue: true,
                            newProps: { selectedPlan: null, source: "user_plan_billing_team" },
                          })
                        );
                      }}
                    >
                      Upgrade
                    </RQButton>
                  </Col>
                </Row>
              </Col>
            ) : null}
          </>
        )}
      </Col>
      <ChangePlanRequestConfirmationModal
        isOpen={isConfirmationModalOpen}
        handleToggle={() => setIsConfirmationModalOpen(false)}
        isLoading={isConfirmationModalLoading}
      />
    </>
  );
};
