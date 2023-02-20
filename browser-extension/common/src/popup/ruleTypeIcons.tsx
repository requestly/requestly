import React from "react";
import { RuleType } from "../types";
import RedirectIcon from "../../resources/icons/rule-icons/redirect.svg";
import CancelIcon from "../../resources/icons/rule-icons/cancel.svg";
import ReplaceIcon from "../../resources/icons/rule-icons/replace.svg";
import HeadersIcon from "../../resources/icons/rule-icons/headers.svg";
import UserAgentIcon from "../../resources/icons/rule-icons/useragent.svg";
import ScriptIcon from "../../resources/icons/rule-icons/script.svg";
import QueryParamIcon from "../../resources/icons/rule-icons/queryparam.svg";
import ResponseIcon from "../../resources/icons/rule-icons/response.svg";
import RequestIcon from "../../resources/icons/rule-icons/request.svg";
import DelayIcon from "../../resources/icons/rule-icons/delay.svg";

export const icons: Record<RuleType, React.ReactNode> = {
  Redirect: <RedirectIcon />,
  Cancel: <CancelIcon />,
  Replace: <ReplaceIcon />,
  Headers: <HeadersIcon />,
  UserAgent: <UserAgentIcon />,
  Script: <ScriptIcon />,
  QueryParam: <QueryParamIcon />,
  Response: <ResponseIcon />,
  Request: <RequestIcon />,
  Delay: <DelayIcon />,
};
