import { Row } from "antd";
import APP_CONSTANTS from "config/constants";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import React, { useState } from "react";
import { ReactMultiEmail } from "react-multi-email";
import { useNavigate } from "react-router-dom";
import { redirectToRoot } from "utils/RedirectionUtils";
import WorkspaceDropdown from "../pricing/ComparisonTable/v2-free-enterprise/WorkspaceDropdown";
import { getAttrFromFirebase, submitAttrUtil } from "utils/AnalyticsUtils";
import { toast } from "utils/Toast";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../../firebase";

const codesList: Record<string, { redeemed: boolean }> = {
  rqn87: { redeemed: false },
  rqp87: { redeemed: false },
  rq467: { redeemed: false },
  rqn78: { redeemed: false },
};

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

const db = getFirestore(firebaseApp);

const AppSumoModal: React.FC = () => {
  const navigate = useNavigate();

  const [appSumoCodes, setAppSumoCodes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isCodeReemed, setIsCodeReemed] = useState<boolean>(false);
  const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);

  const onCodeEnter = async (codes: string[]) => {
    setIsCodeInvalid(false);
    setIsCodeReemed(false);
    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      const sessionReplayLifetime = await getAttrFromFirebase("session_replay_lifetime_pro");
      if (sessionReplayLifetime?.code) {
        toast.warn("You have already redeemed a code. Please contact support");
        return;
      }

      if (codes.length > 1) {
        toast.warn("You can only use one code for private workspace");
        return;
      }
    }

    if (codes.length > 0) {
      const code = codes[codes.length - 1];

      if (!codesList[code]) {
        setIsCodeInvalid(true);
        return;
      }

      if (codesList[code].redeemed) {
        setIsCodeReemed(true);
        return;
      }
    }
    setAppSumoCodes(codes);
  };

  const onSubmit = async () => {
    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      submitAttrUtil("session_replay_lifetime_pro", {
        code: appSumoCodes[0],
        date: new Date(),
        type: "appsumo",
      });
    } else {
      const teamsRef = doc(db, "teams", workspaceToUpgrade.id);

      await updateDoc(teamsRef, {
        appSumo: {
          code: appSumoCodes,
          date: new Date(),
          numCodesClaimed: appSumoCodes.length,
        },
      });
    }
  };

  return (
    <RQModal
      width={620}
      centered
      open={true}
      closable={false}
      maskClosable={false}
      maskStyle={{ background: "#0d0d10ef" }}
      keyboard={false}
    >
      <div className="rq-modal-content">
        <div>
          <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
        </div>
        <div className="header add-member-modal-header">Please enter your AppSumo code</div>
        <p className="text-gray">Unlock lifetime deal for Session Replay Pro</p>
        <WorkspaceDropdown workspaceToUpgrade={workspaceToUpgrade} setWorkspaceToUpgrade={setWorkspaceToUpgrade} />
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
              onChange={onCodeEnter}
              validateEmail={(_) => true}
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
        <div className="field-error-prompt" style={{ textAlign: "right", padding: "2px 0" }}>
          {isCodeInvalid && "Invalid code. Please contact support"}
          {isCodeReemed && "Code already redeemed. Please contact support"}
        </div>
      </div>
      <Row className="rq-modal-footer" justify={"end"}>
        <RQButton
          type="primary"
          disabled={appSumoCodes.length === 0 || isCodeInvalid || isCodeReemed}
          onClick={() => {
            onSubmit().then(() => {
              redirectToRoot(navigate);
            });
          }}
        >
          Unlock Deal
        </RQButton>
      </Row>
    </RQModal>
  );
};

export default AppSumoModal;
