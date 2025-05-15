import React from "react";
import { BaseError } from "features/apiClient/helpers/modules/sync/local/FsError/BaseError";

export abstract class RenderableError extends BaseError {
  abstract render(): React.ReactNode;
}
