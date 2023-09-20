import { Row } from "antd";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import React, { useState } from "react";
import { ReactMultiEmail } from "react-multi-email";

const AppSumoModal: React.FC = () => {
  const [appSumoCodes, setAppSumoCodes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");

  return (
    <RQModal width={620} centered open={true} closable={false} maskClosable={false}>
      <div className="rq-modal-content">
        <div>
          <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
        </div>
        <div className="header add-member-modal-header">Please enter your AppSumo code</div>
        <p className="text-gray">Unlock lifetime deal for Session Replay Pro</p>

        <div className="title mt-16">AppSumo email address</div>
        <div className="items-center mt-8">
          <RQInput
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            // validateEmail={validateEmail}
            placeholder="Enter email address here"
          />
        </div>
        <div className="title mt-16">AppSumo Code(s)</div>
        <div className="email-invites-wrapper">
          <div className="emails-input-wrapper">
            <ReactMultiEmail
              className="members-email-input"
              placeholder="Enter code here"
              emails={appSumoCodes}
              onChange={setAppSumoCodes}
              validateEmail={(email) => true}
              getLabel={(code, index, removeCode) => (
                <div data-tag key={index} className="multi-email-tag">
                  {code}
                  <span title="Remove" data-tag-handle onClick={() => removeCode(index)}>
                    <img alt="remove" src="/assets/img/workspaces/cross.svg" />
                  </span>
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <Row className="rq-modal-footer" justify={"end"}>
        <RQButton
          type="primary"
          onClick={() => {
            console.log("!!!debug", "", userEmail, appSumoCodes);
          }}
        >
          Unlock Deal
        </RQButton>
      </Row>
    </RQModal>
  );
};

export default AppSumoModal;
