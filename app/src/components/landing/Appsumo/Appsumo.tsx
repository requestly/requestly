import { Row } from "antd";
import APP_CONSTANTS from "config/constants";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ImCross } from "@react-icons/all-files/im/ImCross";
import { MdOutlineVerified } from "@react-icons/all-files/md/MdOutlineVerified";
import { FiXCircle } from "@react-icons/all-files/fi/FiXCircle";
import { useNavigate } from "react-router-dom";
import { redirectToRoot } from "utils/RedirectionUtils";
import WorkspaceDropdown from "components/landing/pricing/WorkspaceDropdown/WorkspaceDropdown";
import { getAttrFromFirebase, submitAttrUtil } from "utils/AnalyticsUtils";
import { arrayUnion, doc, getDoc, getFirestore, updateDoc, writeBatch } from "firebase/firestore";
import firebaseApp from "../../../firebase";
import { toast } from "utils/Toast";
import "./index.scss";
import { trackAppsumoCodeRedeemed } from "modules/analytics/events/misc/business";
import { isEmailValid } from "utils/FormattingHelper";
import { useDebounce } from "hooks/useDebounce";

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

interface AppSumoCode {
  error: string;
  code: string;
  verified: boolean;
}

const DEFAULT_APPSUMO_INPUT: AppSumoCode = {
  error: "",
  code: "",
  verified: false,
};

const db = getFirestore(firebaseApp);

const AppSumoModal: React.FC = () => {
  const navigate = useNavigate();

  const [appsumoCodes, setAppsumoCodes] = useState<AppSumoCode[]>([{ ...DEFAULT_APPSUMO_INPUT }]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailValidationError, setEmailValidationError] = useState(null);

  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);

  const addAppSumoCodeInput = () => {
    setAppsumoCodes((prev) => [...prev, { ...DEFAULT_APPSUMO_INPUT }]);
  };

  const removeAppSumoCodeInput = (index: number) => {
    if (appsumoCodes.length === 1) return;
    setAppsumoCodes((prev) => {
      const codes = [...prev];
      codes.splice(index, 1);
      return codes;
    });
  };

  const isAllCodeCheckPassed = useMemo(() => appsumoCodes.every((code) => code.verified), [appsumoCodes]);

  const updateAppSumoCode = (index: number, key: keyof AppSumoCode, value: AppSumoCode[typeof key]) => {
    setAppsumoCodes((prev) => {
      const codes: AppSumoCode[] = [...prev];
      if (codes[index]) {
        (codes[index] as any)[key] = value;
      }
      return codes;
    });
  };

  const debouncedVerifyCode = useDebounce((enteredCode: string, index: number) => verifyCode(enteredCode, index));

  const verifyCode = useCallback(
    async (enteredCode: string, index: number) => {
      if (enteredCode.length < 8) {
        updateAppSumoCode(index, "verified", false);
        return;
      }

      const codeOccurence = appsumoCodes.filter((appsumoCode: AppSumoCode) => appsumoCode.code === enteredCode).length;
      if (codeOccurence > 1 && workspaceToUpgrade?.id !== PRIVATE_WORKSPACE.id) {
        updateAppSumoCode(index, "error", "Code already used");
        updateAppSumoCode(index, "verified", false);
        return;
      }

      const docRef = doc(db, "appSumoCodes", enteredCode);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        updateAppSumoCode(index, "error", "Invalid code");
        updateAppSumoCode(index, "verified", false);
        return;
      }

      if (docSnap.data()?.redeemed) {
        updateAppSumoCode(index, "error", "Code already redeemed");
        updateAppSumoCode(index, "verified", false);
        return;
      }
      updateAppSumoCode(index, "error", "");
      updateAppSumoCode(index, "verified", true);
    },
    [appsumoCodes, workspaceToUpgrade?.id]
  );

  const redeemSubmittedCodes = useCallback(async () => {
    const batch = writeBatch(db);
    appsumoCodes.forEach((code) => {
      const docRef = doc(db, "appSumoCodes", code.code);
      batch.update(docRef, { redeemed: true });
    });
    await batch.commit();
  }, [appsumoCodes]);

  const onSubmit = useCallback(async () => {
    if (!isAllCodeCheckPassed || emailValidationError) {
      toast.warn("Please fill all the fields correctly", 10);
      throw new Error("Please fill all the fields correctly");
    }

    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      const sessionReplayLifetime = await getAttrFromFirebase("session_replay_lifetime_pro");
      if (sessionReplayLifetime?.code) {
        toast.warn("You have already redeemed a code. Please contact support", 10);
        throw new Error("You have already redeemed a code. Please contact support");
      }
    }

    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) {
      submitAttrUtil("session_replay_lifetime_pro", {
        code: appsumoCodes[0].code,
        date: new Date(),
        type: "appsumo",
      });
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
    } else {
      const teamsRef = doc(db, "teams", workspaceToUpgrade.id);
      updateDoc(teamsRef, {
        "appsumo.codes": arrayUnion(...appsumoCodes.map((code) => code.code)),
        "appsumo.date": Date.now(),
      });
    }
    await redeemSubmittedCodes();
  }, [appsumoCodes, emailValidationError, isAllCodeCheckPassed, redeemSubmittedCodes, workspaceToUpgrade.id]);

  const handleEmailValidation = (email: string) => {
    if (!email) {
      setEmailValidationError("Please add your Appsumo email address");
      return;
    }
    if (!isEmailValid(email)) {
      setEmailValidationError("Please enter a valid email address");
      return;
    }
    setEmailValidationError(null);
  };

  const debouncedEmailValidation = useDebounce((email: string) => handleEmailValidation(email));

  useEffect(() => {
    if (workspaceToUpgrade.id === PRIVATE_WORKSPACE.id) setAppsumoCodes([{ ...DEFAULT_APPSUMO_INPUT }]);
  }, [workspaceToUpgrade]);

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
      <div className="rq-modal-content appsumo-modal">
        <div>
          <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
        </div>
        <div className="header mt-16">Please enter your AppSumo code</div>
        <p className="text-gray">Unlock lifetime deal for Session Replay Pro</p>
        <WorkspaceDropdown workspaceToUpgrade={workspaceToUpgrade} setWorkspaceToUpgrade={setWorkspaceToUpgrade} />
        <div className="title mt-16">AppSumo email address</div>
        <div className="items-center mt-8">
          <div className="w-full">
            <RQInput
              className="w-full"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                debouncedEmailValidation(e.target.value);
              }}
              placeholder="Enter email address here"
            />
            <div className="danger caption">{emailValidationError}</div>
          </div>
        </div>
        <div className="title mt-16">AppSumo Code(s)</div>
        {appsumoCodes.map((appsumoCode, index) => (
          <div className="display-flex" key={index}>
            <div className="appsumo-code-input-container">
              <RQInput
                value={appsumoCode.code}
                key={index}
                onChange={(e) => {
                  updateAppSumoCode(index, "code", e.target.value);
                  debouncedVerifyCode(e.target.value, index);
                }}
                suffix={
                  appsumoCode.verified ? (
                    <MdOutlineVerified />
                  ) : appsumoCode.error ? (
                    <>
                      <span className="danger caption">{appsumoCode.error}</span>
                      <FiXCircle className="danger" />
                    </>
                  ) : null
                }
                placeholder="Enter code here"
              />
            </div>
            {workspaceToUpgrade.id !== PRIVATE_WORKSPACE.id && (
              <div className={`remove-icon ${appsumoCodes.length === 1 ? "cursor-disabled" : "cursor-pointer"}`}>
                <ImCross
                  id="delete-pair"
                  className="text-gray"
                  onClick={() => {
                    removeAppSumoCodeInput(index);
                  }}
                />
              </div>
            )}
          </div>
        ))}
        {workspaceToUpgrade.id !== PRIVATE_WORKSPACE.id && (
          <RQButton className="appsumo-add-btn" type="link" onClick={addAppSumoCodeInput}>
            + Add more codes
          </RQButton>
        )}
      </div>
      <Row className="rq-modal-footer" justify={"end"}>
        <RQButton
          type="primary"
          disabled={!isAllCodeCheckPassed || emailValidationError}
          onClick={() => {
            onSubmit()
              .then(() => {
                trackAppsumoCodeRedeemed(appsumoCodes.length);
                toast.success(
                  `Lifetime access to Session Replay Pro unlocked for ${
                    appsumoCodes.length > 1 ? `${appsumoCodes.length} members` : "you"
                  }`,
                  10
                );
                redirectToRoot(navigate);
              })
              .catch(() => {
                // do nothing
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
