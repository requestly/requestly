import { FsAccessTroubleshoot } from "features/apiClient/errors/FsError/FsAccessError/components/FsAccessTroubleshoot/FsAccessTroubleshoot";
import { ErrorCode, ErrorSeverity } from "errors/types";
import { RenderableError } from "errors/RenderableError";

export class FsAccessError extends RenderableError {
  constructor(message: string, readonly path: string) {
    super(message);
    this.errorCode = ErrorCode.PERMISSION_DENIED;
    this.addContext({
      path,
    });
    this.severity = ErrorSeverity.FATAL;
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
