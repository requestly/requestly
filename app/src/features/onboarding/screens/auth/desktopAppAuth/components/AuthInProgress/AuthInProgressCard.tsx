import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineFileCopy } from "@react-icons/all-files/md/MdOutlineFileCopy";
import { MdOutlineArrowBack } from "@react-icons/all-files/md/MdOutlineArrowBack";
import { googleSignInDesktopApp } from "actions/FirebaseActions";
import { v4 as uuidv4 } from "uuid";
import { getDesktopSignInAuthPath } from "utils/PathUtils";
import { snakeCase } from "lodash";
import { useDispatch } from "react-redux";
import { trackAuthRedirectedFromDesktopApp, trackAuthRedirectUrlCopied } from "modules/analytics/events/desktopApp";
import "./authInProgressCard.scss";
import { copyToClipBoard } from "utils/Misc";

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

    trackAuthRedirectedFromDesktopApp();

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

  const handleCopyUrlClick = async () => {
    const copyResult = await copyToClipBoard(desktopSignInAuthUrl, "Copied to clipboard");
    if (copyResult.success) {
      trackAuthRedirectUrlCopied();
    }
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
