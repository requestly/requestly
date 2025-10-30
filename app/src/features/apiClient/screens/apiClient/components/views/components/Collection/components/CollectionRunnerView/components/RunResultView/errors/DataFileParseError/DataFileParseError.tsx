import { RenderableError } from "errors/RenderableError";
import { CollectionRunnerDataFileError } from "../CollectionRunnerDataFileError/CollectionRunnerDataFileError";

export class DataFileParseError extends RenderableError {
  render() {
    return <CollectionRunnerDataFileError error={this} />;
  }

  getErrorHeading() {
    return "Test results couldn't be generated. Uploaded data file is corrupt.";
  }
}
