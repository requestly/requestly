import { ReactComponent as Redirect } from "assets/icons/rule-types/redirect.svg";
import { ReactComponent as Cancel } from "assets/icons/rule-types/cancel.svg";
import { ReactComponent as Replace } from "assets/icons/rule-types/replace.svg";
import { ReactComponent as Headers } from "assets/icons/rule-types/headers.svg";
import { ReactComponent as QueryParam } from "assets/icons/rule-types/queryparam.svg";
import { ReactComponent as Script } from "assets/icons/rule-types/script.svg";
import { ReactComponent as Request } from "assets/icons/rule-types/request.svg";
import { ReactComponent as Response } from "assets/icons/rule-types/response.svg";
import { ReactComponent as Delay } from "assets/icons/rule-types/delay.svg";
import { ReactComponent as UserAgent } from "assets/icons/rule-types/useragent.svg";

export const ruleIcons = {
  Redirect: <Redirect />,
  Cancel: <Cancel />,
  Replace: <Replace />,
  Headers: <Headers />,
  UserAgent: <UserAgent />,
  Script: <Script />,
  QueryParam: <QueryParam />,
  Response: <Response />,
  Request: <Request />,
  Delay: <Delay />,
};
