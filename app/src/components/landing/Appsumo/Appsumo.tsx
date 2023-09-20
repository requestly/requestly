import { Row } from "antd";
import APP_CONSTANTS from "config/constants";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import React, { useCallback, useEffect, useState } from "react";
import { ReactMultiEmail } from "react-multi-email";
import { useNavigate } from "react-router-dom";
import { redirectToRoot } from "utils/RedirectionUtils";
import WorkspaceDropdown from "components/common/WorkspaceDropdown/WorkspaceDropdown";
import { getAttrFromFirebase, submitAttrUtil } from "utils/AnalyticsUtils";
import { arrayUnion, doc, getFirestore, updateDoc, increment } from "firebase/firestore";
import firebaseApp from "../../../firebase";
import { toast } from "utils/Toast";
import { getUserAttributes } from "store/selectors";
import { useSelector } from "react-redux";

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

  //TODO: remove before merging
  const userAttributes = useSelector(getUserAttributes);

  const [appSumoCodes, setAppSumoCodes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isCodeCheckPassed, setIsCodeCheckPassed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);

  const verifyCodes = useCallback(async () => {
    setIsCodeCheckPassed(false);
    setErrorMessage("");

    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      const sessionReplayLifetime =
        (await getAttrFromFirebase("session_replay_lifetime_pro")) ?? userAttributes["session_replay_lifetime_pro"];
      if (sessionReplayLifetime?.code) {
        setErrorMessage("You have already redeemed a code. Please contact support");
        return;
      }

      if (appSumoCodes.length > 1) {
        setErrorMessage("You can only redeem one code for private workspace");
        return;
      }
    }

    if (appSumoCodes.length > 0) {
      const code = appSumoCodes[appSumoCodes.length - 1];

      if (!codesList[code]) {
        setErrorMessage("Invalid code. Please contact support");
        return;
      }

      if (codesList[code].redeemed) {
        setErrorMessage("Code already redeemed. Please contact support");
        return;
      }
    }
    setIsCodeCheckPassed(true);
  }, [appSumoCodes, userAttributes, workspaceToUpgrade.id]);

  const onSubmit = useCallback(async () => {
    if (!isCodeCheckPassed) {
      toast.warn("Please fill all the fields");
    }

    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      submitAttrUtil("session_replay_lifetime_pro", {
        code: appSumoCodes[0],
        date: new Date(),
        type: "appsumo",
      });
    } else {
      const teamsRef = doc(db, "teams", workspaceToUpgrade.id);

      await updateDoc(teamsRef, {
        "appsumo.code": arrayUnion(...appSumoCodes),
        "appsumo.date": Date.now(),
        "appsumo.numCodesClaimed": increment(appSumoCodes.length),
      });
    }
  }, [appSumoCodes, isCodeCheckPassed, workspaceToUpgrade.id]);

  useEffect(() => {
    verifyCodes();
  }, [verifyCodes, workspaceToUpgrade.id]);

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
        <div className="header mt-16">Please enter your AppSumo code</div>
        <p className="text-gray">Unlock lifetime deal for Session Replay Pro</p>
        <WorkspaceDropdown workspaceToUpgrade={workspaceToUpgrade} setWorkspaceToUpgrade={setWorkspaceToUpgrade} />
        <div className="title mt-16">AppSumo email address</div>
        <div className="items-center mt-8">
          <RQInput
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter email address here"
          />
        </div>
        <div className="title mt-16">AppSumo Code(s)</div>
        <div className="display-flex mt-8">
          <div className="emails-input-wrapper">
            <ReactMultiEmail
              placeholder="Enter code here"
              emails={appSumoCodes}
              onChange={(codes) => {
                setAppSumoCodes(codes);
                verifyCodes();
              }}
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
          {errorMessage ? errorMessage : null}
        </div>
      </div>
      <Row className="rq-modal-footer" justify={"end"}>
        <RQButton
          type="primary"
          disabled={!isCodeCheckPassed || !userEmail}
          onClick={() => {
            onSubmit().then(() => {
              toast.success(
                `Lifetime access to Session Replay Pro unlocked for ${
                  appSumoCodes.length > 1 ? `${appSumoCodes.length} members` : "you"
                }`,
                10
              );
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
