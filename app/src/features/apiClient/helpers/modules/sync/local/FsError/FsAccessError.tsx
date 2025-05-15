import { FsAccessTroubleshoot } from "features/apiClient/components/ErrorBoundary/components/FsAccessTroubleshoot";
import { ErrorCode, ErrorMetaData } from "./types";
import { RenderableError } from "features/apiClient/components/ErrorBoundary/RenderableError";

export class FsAccessError extends RenderableError {
  static from(message: string, meta?: ErrorMetaData) {
    return new FsAccessError(ErrorCode.PERMISSION_DENIED, message, meta);
  }

  render() {
    return <FsAccessTroubleshoot error={this} />;
  }
}
