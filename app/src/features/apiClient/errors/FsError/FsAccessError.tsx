import { FsAccessTroubleshoot } from "features/apiClient/components/ErrorBoundary/components/FsAccessTroubleshoot/FsAccessTroubleshoot";
import { ErrorCode } from "../types";
import { RenderableError } from "features/apiClient/components/ErrorBoundary/RenderableError";

export class FsAccessError extends RenderableError {
  constructor(message: string, readonly path: string) {
    super(message);
    this.errorCode = ErrorCode.PERMISSION_DENIED;
    this.addContext({
      path
    });
  }

  static from(message: string, path: string) {
    return new FsAccessError(message, path);
  }

  render() {
    return <FsAccessTroubleshoot error={this} />;
  }

  getErrorHeading() {
    return "Permission denied";
  }
}
