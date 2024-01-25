import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TbChecks } from "@react-icons/all-files/tb/TbChecks";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { getBillingTeamMembers } from "store/features/billing/selectors";
import { BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { trackBillingTeamActionClicked, trackBillingTeamMemberAdded } from "features/settings/analytics";

export const OrgTableActions: React.FC<{ record: any }> = ({ record }) => {
  const { billingId } = useParams();
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const user = useSelector(getUserAuthDetails);
  const isUserAdded = useMemo(() => Object.values(billingTeamMembers).some((member) => member.email === record.email), [
    billingTeamMembers,
    record.email,
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);

  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const handleAddUserToBillingTeam = useCallback(() => {
    const addUserToBillingteam = httpsCallable(getFunctions(), "billing-addUsers");
    setIsAddingUser(true);
    addUserToBillingteam({ userEmails: [record.email], billingTeamId: billingId })
      .then(() => {
        trackBillingTeamMemberAdded(record.email, billingId);
      })
      .catch((e) => {
        Logger.log(e);
        toast.error("Could not add user to billing team, Please contact support");
      })
      .finally(() => setIsAddingUser(false));
  }, [billingId, record.email]);

  return (
    <>
      {isUserAdded ? (
        <Row gutter={8} align="middle" justify="end" className="billing-team-members-added-label">
          <Col>
            <TbChecks fontSize={14} />
          </Col>
          <Col>Added</Col>
        </Row>
      ) : (
        <>
          {isUserAdmin && (
            <Row justify="end">
              <RQButton
                type="default"
                icon={<IoMdAdd />}
                className="billing-team-members-add-btn"
                loading={isAddingUser}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddUserToBillingTeam();
                  trackBillingTeamActionClicked("add_member");
                }}
              >
                Add
              </RQButton>
            </Row>
          )}
        </>
      )}
    </>
  );
};
