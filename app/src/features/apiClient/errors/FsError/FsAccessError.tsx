import { FsAccessTroubleshoot } from "features/apiClient/components/ErrorBoundary/components/FsAccessTroubleshoot/FsAccessTroubleshoot";
import { ErrorCode, ErrorMetaData } from "../types";
import { RenderableError } from "features/apiClient/components/ErrorBoundary/RenderableError";

export class FsAccessError extends RenderableError {
  constructor(message: string, meta?: ErrorMetaData) {
    super(message);
    this.errorCode = ErrorCode.PERMISSION_DENIED;
    this.addContext(meta);
  }

  static from(message: string, meta?: ErrorMetaData) {
    return new FsAccessError(message, meta);
  }

  render() {
    return <FsAccessTroubleshoot error={this} />;
  }

  getErrorHeading() {
    return "Permission denied: Unable to access the file";
  }
}
