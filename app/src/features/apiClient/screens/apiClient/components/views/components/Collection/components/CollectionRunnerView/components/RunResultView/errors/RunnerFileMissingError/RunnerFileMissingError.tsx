import { RenderableError } from "errors/RenderableError";
import { CollectionRunnerDataFileError } from "../CollectionRunnerDataFileError/CollectionRunnerDataFileError";

export class RunnerFileMissingError extends RenderableError {
  static fromError(error: Error, message?: string): RunnerFileMissingError {
    const err = new RunnerFileMissingError(message ?? error.message);
    err.stack = error.stack;
    return err;
  }

  render() {
    return <CollectionRunnerDataFileError error={this} />;
  }

  getErrorHeading() {
    return "Test run failed. Data file not found.";
  }
}
