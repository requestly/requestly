import { RenderableError } from "errors/RenderableError";
import { RunnerFileMissing } from "./components/RunnerFileMissing";

export class RunnerFileMissingError extends RenderableError {
  render() {
    return <RunnerFileMissing error={this} />;
  }

  getErrorHeading() {
    return "File missing. We couldn't run the test";
  }
}
