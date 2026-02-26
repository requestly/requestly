import * as Sentry from "@sentry/react";

const extractTraceContext = () => {
  const activeSpan = Sentry.getActiveSpan();

  if (!activeSpan) {
    return null;
  }

  const traceContext = {
    "sentry-trace": Sentry.spanToTraceHeader(activeSpan),
    baggage: Sentry.spanToBaggageHeader(activeSpan),
  };

  return traceContext;
};

export const traceIPC = {
  invokeEventInMain: (eventName, payload) => {
    const traceContext = extractTraceContext();

    const newPayload = {
      ...payload,
      _traceContext: traceContext,
    };

    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInMain(eventName, newPayload);
  },

  invokeEventInBG: (eventName, payload) => {
    const traceContext = extractTraceContext();

    let newPayload;
    if (Array.isArray(payload)) {
      newPayload = [...payload, { _traceContext: traceContext }];
    } else {
      newPayload = {
        ...payload,
        _traceContext: traceContext,
      };
    }

    return window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG(eventName, newPayload);
  },
};
