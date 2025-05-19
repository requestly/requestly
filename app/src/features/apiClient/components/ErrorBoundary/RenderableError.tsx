import React from "react";
import { NativeError } from "../../errors/NativeError";

export abstract class RenderableError<T = any> extends NativeError<T> {
  abstract render(): React.ReactNode;
  abstract getErrorHeading(): string;
}
