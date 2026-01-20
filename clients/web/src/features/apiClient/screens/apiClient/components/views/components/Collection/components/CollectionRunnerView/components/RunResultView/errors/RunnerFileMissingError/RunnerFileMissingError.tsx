import { RenderableError } from "errors/RenderableError";
import { CollectionRunnerDataFileError } from "../CollectionRunnerDataFileError/CollectionRunnerDataFileError";

export class RunnerFileMissingError extends RenderableError {
  render() {
    return <CollectionRunnerDataFileError error={this} />;
  }

  getErrorHeading() {
    return "Test run failed. Data file not found.";
  }
}
