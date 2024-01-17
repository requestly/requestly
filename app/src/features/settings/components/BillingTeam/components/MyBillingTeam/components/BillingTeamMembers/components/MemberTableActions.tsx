import React, { useCallback, useState } from "react";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TbChecks } from "@react-icons/all-files/tb/TbChecks";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import Logger from "lib/logger";

export const MemberTableActions: React.FC<{ record: any; billingTeamId?: string }> = ({ record, billingTeamId }) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isMemberAdded, setIsMemberAdded] = useState(false);

  const handleAddUserToBillingTeam = useCallback(() => {
    const addUserToBillingteam = httpsCallable(getFunctions(), "billing-addUsers");
    setIsAddingMember(true);
    addUserToBillingteam({ userEmails: [record.email], billingTeamId })
      .then(() => {
        setIsMemberAdded(true);
      })
      .catch((e) => {
        Logger.log(e);
      })
      .finally(() => setIsAddingMember(false));
  }, [billingTeamId, record.email]);

  return (
    <>
      {/* TODO: ALSO check if user is already present in the team */}
      {isMemberAdded ? (
        <Row gutter={8} align="middle" className="billing-team-members-added-label">
          <Col>
            <TbChecks fontSize={14} />
          </Col>
          <Col>Already added</Col>
        </Row>
      ) : (
        <Row justify="end">
          <RQButton
            type="default"
            icon={<IoMdAdd />}
            className="billing-team-members-add-btn"
            loading={isAddingMember}
            onClick={(e) => {
              e.stopPropagation();
              handleAddUserToBillingTeam();
            }}
          >
            Add
          </RQButton>
        </Row>
      )}
    </>
  );
};
