import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { httpsCallable, getFunctions } from "firebase/functions";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";

export const BillingTeamRequestReview = () => {
  const user = useSelector(getUserAuthDetails);
  const { billingId } = useParams();
  const [queryParams] = useSearchParams();
  const action = queryParams.get("action");
  const userId = queryParams.get("user");

  useEffect(() => {
    if (user.loggedIn && action && userId) {
      const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");

      reviewBillingTeamJoiningRequest({
        billingTeamId: billingId,
        action,
        userId,
      })
        .then((res) => {
          console.log("Billing team joining request reviewed", res);
        })
        .catch((err) => {
          console.error("Error while reviewing billing team joining request", err);
        });
    }
  }, [user.loggedIn, action, userId, billingId]);

  return <h1>Review the Billing team request access here</h1>;
};
