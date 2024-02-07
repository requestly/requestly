import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { Col, Row } from "antd";
import Logger from "lib/logger";
import { actions } from "store";
import { getPrettyPlanName } from "utils/FormattingHelper";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import firebaseApp from "../../../../firebase";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import crownWhiteIcon from "assets/icons/crown-white.svg";
import crownDangerIcon from "assets/icons/crown-danger.svg";
import "./premiumPlanNudge.scss";

const PremiumPlanNudge = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace)?.id;
  const userPlanDetails = user?.details?.planDetails;
  const planId = userPlanDetails?.planId;
  const planStatus = userPlanDetails?.status;
  const planEndDateString = userPlanDetails?.subscription?.endDate;
  const [isAppSumoDeal, setIsAppSumoDeal] = useState(false);
  let daysLeft = 0;

  useEffect(() => {
    if (!teamId) return;

    const db = getFirestore(firebaseApp);
    const teamsRef = doc(db, "teams", teamId);

    getDoc(teamsRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.appsumo) {
            setIsAppSumoDeal(true);
          }
        }
      })
      .catch(() => {
        Logger.log("Error while fetching appsumo details for team");
      });
  }, [teamId]);

  try {
    const planEndDate = new Date(planEndDateString);
    const currentDate = new Date();
    // @ts-ignore
    let diffTime: any = planEndDate - currentDate;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    Logger.log(err);
  }

  if (!isAppSumoDeal && planId && ["trialing", "canceled"].includes(planStatus)) {
    return (
      <div className="premium-plan-nudge-container">
        <Row gutter={8} align="middle" className="items-center" style={{ height: "auto" }}>
          <Col className="premium-plan-nudge-icon">
            {planStatus === "trialing" ? (
              <img src={crownWhiteIcon} alt="crown" />
            ) : (
              <img src={crownDangerIcon} alt="crown" />
            )}
          </Col>
          <Col className={`text-bold  ${planStatus === "trialing" ? "text-default" : "danger"}`}>
            {planStatus === "trialing"
              ? `Premium trial - ${daysLeft} days left `
              : `${getPrettyPlanName(getPlanNameFromId(planId))} Plan expired`}
          </Col>
        </Row>
        <RQButton
          type="primary"
          className="premium-plan-nudge-btn"
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "pricingModal",
                newValue: true,
                newProps: { selectedPlan: null, source: "trial_badge" },
              })
            );
          }}
        >
          {planStatus === "trialing" ? "Upgrade" : "Renew"}
        </RQButton>
      </div>
    );
  }

  return null;
};

export default PremiumPlanNudge;
