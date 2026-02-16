import React from "react";
import { NativeError } from "./NativeError";
import { ErrorSeverity } from "./types";

export abstract class RenderableError extends NativeError {
  public severity: ErrorSeverity = ErrorSeverity.WARNING;
  public showBoundary: boolean = true;

  abstract render(): React.ReactNode;
  abstract getErrorHeading(): string;
}
