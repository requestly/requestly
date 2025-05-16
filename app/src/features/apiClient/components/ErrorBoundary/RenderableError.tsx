import React from "react";
import { NativeError } from "../../errors/NativeError";

export abstract class RenderableError extends NativeError {
  abstract render(): React.ReactNode;
  abstract getErrorHeading(): string;
}
