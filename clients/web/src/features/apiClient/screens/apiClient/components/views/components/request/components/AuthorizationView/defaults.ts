import { RQAPI } from "features/apiClient/types";
import { Authorization } from "./types/AuthConfig";

export function getDefaultAuthType(isRootRecord: boolean): Authorization.Type {
  return isRootRecord ? Authorization.Type.NO_AUTH : Authorization.Type.INHERIT;
}

export function getDefaultAuth(isRootRecord: boolean = false): RQAPI.Auth {
  return {
    currentAuthType: getDefaultAuthType(isRootRecord),
    authConfigStore: {},
  };
}
