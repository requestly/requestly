import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Col, Modal, Row, Space, Tag } from "antd";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { TeamPlanStatus } from "../TeamPlanStatus";
import { RQButton } from "lib/design-system/components";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { MdDiversity1 } from "@react-icons/all-files/md/MdDiversity1";
import { globalActions } from "store/slices/global/slice";
import { PRICING } from "features/pricing";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import firebaseApp from "../../../../../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import SubscriptionInfo from "features/settings/components/Profile/ActiveLicenseInfo/SubscriptionInfo";
import "./index.scss";
import { PlanStatus, PlanType } from "../../types";
import { isSafariBrowser } from "actions/ExtensionActions";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { isSetappBuild } from "utils/AppUtils";
import { getUserAttributes } from "store/selectors";

export const UserPlanDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppSumoSubscription, setHasAppSumoSubscription] = useState(false);
  const [lifeTimeSubscriptionDetails, setLifeTimeSubscriptionDetails] = useState(null);
  const { type } = user.details?.planDetails ?? {};
  const hasProfessionalStudentPlan =
    [PlanType.STUDENT, PlanType.GITHUB_STUDENT_PACK].includes(type as PlanType) ||
    user?.details?.planDetails?.planId === PRICING.PLAN_NAMES.PROFESSIONAL_STUDENT;

  const getSubscriptionEndDateForAppsumo = useCallback((date = new Date()) => {
    const currentDate = date;

    const endDate = new Date(currentDate);
    endDate.setFullYear(currentDate.getFullYear() + 5);

    return endDate.getTime();
  }, []);

  const userAttributes = useSelector(getUserAttributes);
  const isSetapp = isSetappBuild();
  const installDate = userAttributes?.desktop_install_date || new Date().toISOString();

  useEffect(() => {
    if (type === "appsumo") {
      setHasAppSumoSubscription(true);
      setLifeTimeSubscriptionDetails({
        startDate: new Date(user?.details?.planDetails?.subscription?.startDate).getTime(),
        endDate: getSubscriptionEndDateForAppsumo(new Date(user?.details?.planDetails?.subscription?.endDate)),
        type: "appsumo",
        plan: user?.details?.planDetails?.planId,
      });
    }

    if (activeWorkspaceId) {
      const db = getFirestore(firebaseApp);
      const teamsRef = doc(db, "teams", activeWorkspaceId);
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
  }, [
    getSubscriptionEndDateForAppsumo,
    activeWorkspaceId,
    type,
    user?.details?.planDetails?.subscription?.startDate,
    user?.details?.planDetails?.subscription?.endDate,
    user?.details?.planDetails?.planId,
  ]);

  let trialDuration = 0;
  try {
    const startDate = user?.details?.planDetails?.subscription?.startDate;
    const endDate = user?.details?.planDetails?.subscription?.endDate;
    const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();

    trialDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    Logger.log(err);
  }

  useEffect(() => {
    try {
      const diffTime = new Date(user?.details?.planDetails?.subscription?.endDate).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(daysLeft);
    } catch (err) {
      Logger.log(err);
    }
  }, [user?.details?.planDetails?.subscription?.endDate]);

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

    if (hasProfessionalStudentPlan) {
      return null;
    }

    if (user?.details?.planDetails?.status === "trialing") {
      return (
        <RQButton size="small" type="text" className="cancel-plan-btn" onClick={showFreeTrailCancelMessage}>
          Cancel Plan
        </RQButton>
      );
    }
    return (
      <RQButton
        disabled={!user?.details?.planDetails?.subscription?.billingId}
        onClick={() =>
          navigate(
            `${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${user?.details?.planDetails?.subscription?.billingId}`
          )
        }
        size="small"
        type="text"
        className="cancel-plan-btn"
      >
        Manage Plan
      </RQButton>
    );
  };

  return (
    <>
      {/* <CancelPlanModal
        isOpen={isCancelPlanModalOpen}
        closeModal={() => setIsCancelPlanModalOpen((prev) => !prev)}
        billingTeamQuantity={1}
        currentPlanName={user?.details?.planDetails?.planName}
        currentPlanEndDate={user?.details?.planDetails?.subscription?.endDate}
      /> */}
      <div className="display-row-center w-full mt-16">
        <div className="w-full" style={{ maxWidth: "1000px" }}>
          <Col
            className="billing-teams-primary-card user-plan-detail-card"
            style={{
              marginTop: !user?.details?.isPremium ? "80px" : "0px",
            }}
          >
            {!isSafariBrowser() &&
            user?.details?.isPremium &&
            !(user?.details?.planDetails?.status === "trialing" && hasAppSumoSubscription) ? (
              <>
                {" "}
                <Row gutter={8} align="middle" className="user-plan-card-header">
                  <Col>
                    <Row gutter={8} align="middle">
                      <Col className="text-white text-bold">Your plan</Col>
                      <Col>
                        <TeamPlanStatus
                          subscriptionEndDate={user?.details?.planDetails?.subscription?.endDate}
                          subscriptionStatus={user?.details?.planDetails?.status}
                          cancelAtPeriodEnd={user?.details?.planDetails?.subscription?.cancelAtPeriodEnd}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>{user?.details?.planDetails?.status !== PlanStatus.EXPIRED && renderPopConfirmation()}</Col>
                </Row>
                <Col className={`user-plan-card-grid ${isSetapp ? "two-part-grid" : "three-part-grid"}`}>
                  <div className={`user-plan-card-grid-item ${hasProfessionalStudentPlan ? "display-row-center" : ""}`}>
                    <Space direction="vertical" size={8}>
                      {!isSetapp && user?.details?.planDetails?.status === "trialing" ? (
                        <div>{trialDuration} days free trial</div>
                      ) : null}
                      <Row gutter={8} className="items-center">
                        <Col className="user-plan-card-plan-name">
                          {isSetapp
                            ? "Professional (Setapp)"
                            : `${getPrettyPlanName(getPlanNameFromId(user?.details?.planDetails?.planId))} Plan`}{" "}
                          {hasProfessionalStudentPlan ? <Tag color="green">Student Program</Tag> : ""}
                        </Col>
                      </Row>
                    </Space>
                  </div>
                  {!user?.details?.planDetails?.subscription?.isBrowserstackSubscription && (
                    <>
                      <div className="user-plan-card-grid-item">
                        <Space direction="vertical" size={8}>
                          <div className="user-plan-card-grid-item-label">
                            {isSetapp
                              ? "Install date"
                              : user?.details?.planDetails?.status === "trialing"
                              ? "Trial start date"
                              : "Plan start date"}
                          </div>
                          <div className="user-plan-date">
                            {isSetapp
                              ? getLongFormatDateString(new Date(installDate))
                              : getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.startDate))}
                          </div>
                        </Space>
                      </div>
                      {!isSetapp && (
                        <div className="user-plan-card-grid-item">
                          <Space direction="vertical" size={8}>
                            <div className="user-plan-card-grid-item-label">
                              {user?.details?.planDetails?.status === "trialing" ? "Trial" : "Plan"} expire date
                            </div>
                            <div className="user-plan-date">
                              {hasAppSumoSubscription || hasProfessionalStudentPlan
                                ? "Lifetime access"
                                : getLongFormatDateString(new Date(user?.details?.planDetails?.subscription?.endDate))}
                            </div>
                          </Space>
                        </div>
                      )}
                    </>
                  )}
                </Col>
              </>
            ) : null}

            {isSafariBrowser() ? (
              <SafariLimitedSupportView />
            ) : hasAppSumoSubscription ? (
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
                {!isSetapp &&
                (![PRICING.PLAN_NAMES.PROFESSIONAL, PRICING.PLAN_NAMES.ENTERPRISE].includes(
                  getPlanNameFromId(user?.details?.planDetails?.planId)
                ) ||
                  user?.details?.planDetails?.status === "trialing") ? (
                  <Col className="user-plan-upgrade-card">
                    <MdDiversity1 />
                    <div className="title">
                      {!user?.details?.isPremium ? "You don't have any plan. " : ""}Upgrade for more features 🚀
                    </div>
                    <div className="user-plan-upgrade-card-description">
                      {user?.details?.planDetails?.status === "trialing" ? (
                        <>
                          Your professional plan free trial will expire in {daysLeft} days.{" "}
                          {billingTeams.length
                            ? "Consider upgrading or reach out directly to your organization's billing team admins for a license."
                            : "Get access to premium rule types and extended rule limits"}
                        </>
                      ) : (
                        <>
                          Upgrade for premium features. You can also join an existing billing team or ask your
                          organization admin to switch you to a paid plan.
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
                          icon={<img src={"/assets/media/settings/upgrade.svg"} alt="upgrade" />}
                          type="primary"
                          onClick={() => {
                            dispatch(
                              globalActions.toggleActiveModal({
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
        </div>
      </div>
    </>
  );
};
