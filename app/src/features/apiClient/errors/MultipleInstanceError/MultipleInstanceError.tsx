import { ErrorCode, ErrorSeverity } from "errors/types";
import { RenderableError } from "errors/RenderableError";
import { MultipleInstanceTroubleshoot } from "./components/MultipleInstanceTroubleshoot";

export class MultipleInstanceError extends RenderableError {
  constructor(message: string, readonly path: string) {
    super(message);
    this.errorCode = ErrorCode.MultipleInstancesRunning;
    this.addContext({
      path,
    });
    this.severity = ErrorSeverity.ERROR;
  }

  static from(message: string, path: string) {
    return new MultipleInstanceError(message, path);
  }

  render() {
    return <MultipleInstanceTroubleshoot error={this} />;
  }

  getErrorHeading() {
    return "Multiple instances running";
  }
}
