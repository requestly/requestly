import React from "react";
import { NativeError } from "./NativeError";
import { ErrorSeverity } from "./types";

export abstract class RenderableError<T = any> extends NativeError<T> {
  public severity: ErrorSeverity = ErrorSeverity.WARNING;
  
  abstract render(): React.ReactNode;
  abstract getErrorHeading(): string;
}
