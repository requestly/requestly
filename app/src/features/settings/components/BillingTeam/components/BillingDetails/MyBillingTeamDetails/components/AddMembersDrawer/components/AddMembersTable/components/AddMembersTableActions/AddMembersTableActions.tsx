import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQButton } from "lib/design-system/components";
import { TbChecks } from "@react-icons/all-files/tb/TbChecks";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { getBillingTeamMembers } from "store/features/billing/selectors";
import { BillingTeamMemberStatus, BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { trackBillingTeamActionClicked, trackBillingTeamMemberAdded } from "features/settings/analytics";
import { addUsersToBillingTeam } from "backend/billing";
import { OrgMember } from "features/settings/components/OrgMembers/types";
import "./orgTableActions.scss";

export const AddMembersTableActions: React.FC<{ member: OrgMember }> = ({ member }) => {
  const { billingId } = useParams();
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const user = useSelector(getUserAuthDetails);
  const isUserAdded = useMemo(
    () => Object.values(billingTeamMembers ?? {}).some((billingTeamMember) => billingTeamMember.email === member.email),
    [billingTeamMembers, member.email]
  );

  const [isAddingUser, setIsAddingUser] = useState(false);

  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const handleAddUserToBillingTeam = useCallback(() => {
    setIsAddingUser(true);
    addUsersToBillingTeam(billingId, [member.email])
      .then(() => {
        trackBillingTeamMemberAdded(member.email, billingId);
      })
      .catch((e) => {
        Logger.log(e);
        toast.error("Could not add user to billing team, Please contact support");
      })
      .finally(() => setIsAddingUser(false));
  }, [billingId, member.email]);

  return (
    <>
      {isUserAdded || member?.status === BillingTeamMemberStatus.PENDING ? (
        <Row gutter={8} align="middle" justify="end" className="billing-team-members-added-label">
          <Col>
            <TbChecks fontSize={14} />
          </Col>
          <Col>{isUserAdded ? "Assigned" : "Invitation sent"}</Col>
        </Row>
      ) : (
        <>
          {isUserAdmin && (
            <Row justify="end">
              <RQButton
                icon={<IoMdAdd />}
                className="billing-team-members-add-btn"
                loading={isAddingUser}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddUserToBillingTeam();
                  trackBillingTeamActionClicked("add_member");
                }}
              >
                Assign
              </RQButton>
            </Row>
          )}
        </>
      )}
    </>
  );
};
