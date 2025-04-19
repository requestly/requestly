import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineFileCopy } from "@react-icons/all-files/md/MdOutlineFileCopy";
import { MdOutlineArrowBack } from "@react-icons/all-files/md/MdOutlineArrowBack";
import { googleSignInDesktopApp } from "actions/FirebaseActions";
import { v4 as uuidv4 } from "uuid";
import { getDesktopSignInAuthPath } from "utils/PathUtils";
import { toast } from "utils/Toast";
import { snakeCase } from "lodash";
import "./authInProgressCard.scss";
import { useDispatch } from "react-redux";

interface AuthInProgressCardProp {
  authMode: string;
  eventSource: string;
  onGoBackClick: () => void;
}

export const AuthInProgressCard: React.FC<AuthInProgressCardProp> = ({ authMode, eventSource, onGoBackClick }) => {
  const dispatch = useDispatch();
  const [desktopSignInAuthUrl, setDesktopSignInAuthUrl] = useState("");

  useEffect(() => {
    if (!authMode) {
      return;
    }

    const oneTimeCode = uuidv4();
    const updatedAuthMode = snakeCase(authMode).toLowerCase();
    const baseUrl = `${window.location.origin}${getDesktopSignInAuthPath(oneTimeCode, eventSource)}`;

    const desktopSignInAuthUrl = new URL(baseUrl);
    desktopSignInAuthUrl.searchParams.append("auth_mode", updatedAuthMode);

    setDesktopSignInAuthUrl(desktopSignInAuthUrl.toString());
    googleSignInDesktopApp(() => {}, updatedAuthMode, eventSource, oneTimeCode).then(() => {
      onGoBackClick();
    });
  }, [authMode, eventSource, onGoBackClick, dispatch]);

  const handleCopyUrlClick = () => {
    navigator.clipboard.writeText(desktopSignInAuthUrl);
    toast.info("Copied to clipboard");
  };

  return (
    <div className="auth-in-progess-card">
      <div className="auth-in-progess-card-header">
        <span>Authorization is in progress in your browser</span>
      </div>
      <div className="auth-in-progess-card-description">
        A new page should have opened in your default web browser to continue the sign up process. If it didn't open,
        please copy and paste the following URL into your browser to proceed.
      </div>
      <div className="auth-in-progess-card-actions">
        <RQButton onClick={handleCopyUrlClick} block size="large" icon={<MdOutlineFileCopy />}>
          Copy the URL
        </RQButton>

        <RQButton onClick={onGoBackClick} type="transparent" size="small" icon={<MdOutlineArrowBack />}>
          Go back
        </RQButton>
      </div>
    </div>
  );
};
