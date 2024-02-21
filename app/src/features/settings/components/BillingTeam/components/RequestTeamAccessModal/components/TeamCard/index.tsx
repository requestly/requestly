import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Col } from "antd";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { getBillingTeamMemberById } from "store/features/billing/selectors";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import { trackBillingTeamActionClicked } from "features/settings/analytics";
import Logger from "lib/logger";
import "./index.scss";

interface Props {
  team: BillingTeamDetails;
}

export const BillingTeamCard: React.FC<Props> = ({ team }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRequestSuccess, setIsRequestSuccess] = useState(false);

  const teamOwnerDetails = useSelector(getBillingTeamMemberById(team?.id, team?.owner));

  const handleRequestAccess = useCallback(() => {
    trackBillingTeamActionClicked("request_to_join");
    if (team?.id) {
      const sendRequest = httpsCallable<{ billingId: string }, null>(
        getFunctions(),
        "premiumNotifications-requestEnterprisePlanFromAdmin"
      );
      setIsRequesting(true);
      sendRequest({ billingId: team.id })
        .then(() => {
          setIsRequestSuccess(true);
        })
        .catch((e) => {
          Logger.log(e);
        })
        .finally(() => setIsRequesting(false));
    } else {
      Logger.log("Billing team id not found");
    }
  }, [team?.id]);

  return (
    <Col className="billing-team-card">
      <div>
        <div className="text-white text-bold">{team.name}</div>
        <div className="text-gray caption">{Object.keys(team.members).length} members</div>
      </div>
      <div>
        <div className="text-gray">Billing manager</div>
        <div className="text-white">{teamOwnerDetails?.displayName}</div>
      </div>
      <div className="display-flex items-center flex-end billing-team-card-request-btn-wrapper">
        {isRequestSuccess ? (
          <div className="success display-flex items-center" style={{ gap: "4px" }}>
            <MdCheck /> Request sent
          </div>
        ) : (
          <RQButton type="default" loading={isRequesting} onClick={handleRequestAccess}>
            Request access
          </RQButton>
        )}
      </div>
    </Col>
  );
};
