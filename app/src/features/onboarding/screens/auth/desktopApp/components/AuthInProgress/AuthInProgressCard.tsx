import React, { useEffect, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineFileCopy } from "@react-icons/all-files/md/MdOutlineFileCopy";
import { MdOutlineArrowBack } from "@react-icons/all-files/md/MdOutlineArrowBack";
import { googleSignInDesktopApp } from "actions/FirebaseActions";
import { v4 as uuidv4 } from "uuid";
import PATHS from "config/constants/sub/paths";
import { getDesktopSignInAuthPath } from "utils/PathUtils";
import { toast } from "utils/Toast";
import "./authInProgressCard.scss";

interface AuthInProgressCardProp {
  authMode: string;
  eventSource: string;
  onGoBackClick: () => void;
}

export const AuthInProgressCard: React.FC<AuthInProgressCardProp> = ({ authMode, eventSource, onGoBackClick }) => {
  const [desktopSignInAuthUrl, setDesktopSignInAuthUrl] = useState(
    `${window.location.origin}${PATHS.AUTH.DEKSTOP_SIGN_IN.ABSOLUTE}?auth_source=desktop`
  );

  console.log({ desktopSignInAuthUrl });

  useEffect(() => {
    if (!authMode) {
      return;
    }

    if (!eventSource) {
      return;
    }

    const oneTimeCode = uuidv4();
    const baseUrl = `${window.location.origin}${getDesktopSignInAuthPath(oneTimeCode, eventSource)}`;
    const desktopSignInAuthUrl = new URL(baseUrl);
    desktopSignInAuthUrl.searchParams.append("auth_source", "desktop");
    setDesktopSignInAuthUrl(desktopSignInAuthUrl.toString());
    googleSignInDesktopApp(() => {}, authMode, eventSource, oneTimeCode);
  }, [authMode, eventSource]);

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
          copy the URL
        </RQButton>

        <RQButton onClick={onGoBackClick} type="transparent" size="small" icon={<MdOutlineArrowBack />}>
          Go back
        </RQButton>
      </div>
    </div>
  );
};
