import { RenderableError } from "errors/RenderableError";
import { CollectionRunnerDataFileError } from "../CollectionRunnerDataFileError/CollectionRunnerDataFileError";

export class DataFileParseError extends RenderableError {
  static fromError(error: Error, message?: string): DataFileParseError {
    const err = new DataFileParseError(message ?? error.message);
    err.stack = error.stack;
    return err;
  }

  render() {
    return <CollectionRunnerDataFileError error={this} />;
  }

  getErrorHeading() {
    return "Test results couldn't be generated. Uploaded data file is corrupt.";
  }
}
